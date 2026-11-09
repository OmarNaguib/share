# Always-on dev VPS on Oracle Free Tier: quick guide

How Omar's `oci-dev` box was built (Sept 2026), boiled down. You end up with a free ARM VM, reachable only over Tailscale from your laptop and phone, running Claude Code around the clock. About an hour, most of it waiting on sign-ins.

## 1. Get the VM (free)

- Sign up at cloud.oracle.com with a **personal** account. Pick a home region with **3 availability domains** (Frankfurt has 3); you can't change it later, and ARM capacity runs out in single-AD regions.
- **Size it to the current Always Free limit: 2 OCPU / 12 GB.** Oracle cut A1 from 4/24 to 2/12 in June 2026, and most guides online still say 4/24. During the free trial it will let you create 4/24, but anything above 2/12 gets terminated when the trial ends.
- Create the instance:
  - Shape `VM.Standard.A1.Flex` (Ampere ARM64), 2 OCPU, 12 GB
  - Image: Ubuntu 24.04 (aarch64)
  - Boot volume **~200 GB** (the free allowance is 200 GB of block storage in total)
  - VCN with a public subnet and internet gateway (the console wizard does this), and paste your SSH public key
- "Out of host capacity" error: try the other ADs, or retry in a loop with the OCI CLI (`oci compute instance launch …`). The fastest route is an API key (Profile → API keys) plus the CLI, so Claude can drive the whole thing.
- If you already have a work OCI profile in `~/.oci/config`, **add a separate `[personal]` profile**. Don't overwrite the work one.

## 2. Stop Oracle reclaiming it

Oracle reclaims idle Always Free VMs: CPU, network **and** memory all under 20% (p95) over 7 days. Keeping just one of those above 20% is enough, and memory is the cheapest. Run a small systemd service that holds ~30% RAM as ballast and **releases it automatically** when real work needs the memory. The script is at the bottom of this page; install it as `/usr/local/bin/oci-keepalive.py` with this unit:

```ini
# /etc/systemd/system/oci-keepalive.service
[Unit]
Description=OCI Always Free keep-alive (adaptive memory ballast)
After=network.target

[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/oci-keepalive.py
Environment=KEEPALIVE_TARGET_PCT=30
Environment=KEEPALIVE_MIN_FREE_MB=1536
Restart=always
Nice=19
OOMScoreAdjust=1000

[Install]
WantedBy=multi-user.target
```

`sudo systemctl enable --now oci-keepalive`

## 3. Base setup

```bash
sudo adduser <you> && sudo usermod -aG sudo <you>   # same username as your laptop, so absolute paths in configs still work
sudo apt update && sudo apt install -y tmux git ripgrep fd-find jq htop mosh build-essential fail2ban
# 8 GB swap
sudo fallocate -l 8G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab; echo vm.swappiness=10 | sudo tee /etc/sysctl.d/99-swap.conf
sudo apt purge -y rpcbind   # the image listens on :111, which you don't need
```

- Node via nvm (arm64 builds), then Claude Code. Use a user-level npm prefix so you don't need sudo.
- `gh auth login`, plus any other CLIs you use.
- **It's ARM64:** Google ships no Chrome for ARM Linux, so use Playwright with `--browser=chromium`. Headless only.

## 4. Lock it down with Tailscale

1. Install on the VM with `curl -fsSL https://tailscale.com/install.sh | sh`, then `sudo tailscale up --ssh` and open the login link it prints.
2. Install Tailscale on your **laptop and phone** with the same account. (On WSL, the Windows install is enough: WSL reaches the tailnet through it.)
3. In the admin console (Access controls), change the `ssh` rule from `"action": "check"` to `"accept"`. Otherwise Tailscale SSH asks for a browser re-auth every ~12 h.
4. **Before closing anything, check that `ssh <you>@<vm-name>` works from both the laptop and the phone.** The phone needs no key file (Tailscale SSH); Termius works.
5. Then remove the `0.0.0.0/0 :22` ingress rule from the OCI security list. The VM ends up with no public inbound at all. (Within hours the public IP gets 1000+ SSH brute-force attempts; key-only sshd and fail2ban hold them off, but closing the port is better.) If you lock yourself out, the OCI console's Cloud Shell or serial console still gets you in.

Gotcha: Oracle's Ubuntu image has its **own iptables** rule rejecting everything except :22. To expose a service, open it in both the security list **and** iptables (or just reach it over Tailscale).

Use **mosh + tmux** for the phone: sessions survive network changes and screen locks, and typing feels local even over a slow link.

## 5. Moving your laptop setup over (optional)

`rsync` your home directory, **excluding** anything built for x86 or easy to regenerate: `node_modules`, `~/.nvm`, venvs, native binaries (`~/.local/bin/claude`), `~/.cache`. Then rebuild those natively on the VM. Omar went from 17 GB down to 5 GB this way. Logins (gh, etc.) usually need redoing. For OAuth flows that call back to `localhost:<port>`, tunnel the port with `ssh -L <port>:localhost:<port> <vm>` so the callback reaches the VM.

## 6. Claude Code on the box

- **Unattended jobs (timers, agents):** run `claude setup-token` once and keep the long-lived token (~1 year) in an env file that the systemd units load. Don't copy `~/.claude/.credentials.json` from your laptop: the two machines then fight over one refresh token.
- **From your phone:** a Remote Control session inside tmux, run as a systemd service, so it shows up in the Claude app:

```ini
# /etc/systemd/system/claude-rc.service
[Unit]
After=network-online.target
[Service]
Type=forking
User=<you>
WorkingDirectory=/home/<you>/workspace
ExecStart=/usr/bin/tmux new-session -d -s rc -c /home/<you>/workspace "/home/<you>/.local/bin/claude remote-control --name <vm-name>"
ExecStop=/usr/bin/tmux kill-session -t rc
Restart=always
RestartSec=30
[Install]
WantedBy=multi-user.target
```

Run `claude` and `/login` once interactively first. Note: if your Claude account is **shared**, everyone on it can see the Remote Control session. Omar uses his personal account for Remote Control for that reason.

- **Machine doc:** write `/etc/claude-code/CLAUDE.md` (Claude Code loads it in every session, for every user) covering what the box is, what runs on it, which credential files exist (names only) and the rules. Agents then know the constraints without being told.

## 7. Later, if you run unattended agents

Run them as a **separate Linux user** with no sudo, no SSH keys and no cloud-admin credentials, only the API tokens they need. "Read-only" written in a prompt doesn't count as a boundary.

## Appendix: oci-keepalive.py

```python
#!/usr/bin/env python3
"""
Keep an OCI Always Free instance out of idle-reclamation range.

Oracle reclaims an Always Free instance only when, over a rolling 7-day window,
the 95th percentile of CPU AND network AND memory utilisation are ALL below 20%.
Exceeding any single one is sufficient, so this holds memory above the line --
which costs no CPU and no bandwidth.

The ballast is adaptive: it targets TARGET_PCT total memory utilisation and
shrinks whenever real workload needs the RAM, never letting available memory
fall below MIN_FREE_MB.
"""
import os, time

CHUNK = 64 << 20                                  # 64 MiB granularity
TARGET_PCT  = float(os.environ.get("KEEPALIVE_TARGET_PCT", "30"))
MIN_FREE_MB = int(os.environ.get("KEEPALIVE_MIN_FREE_MB", "1536"))
INTERVAL    = int(os.environ.get("KEEPALIVE_INTERVAL", "60"))

def meminfo():
    d = {}
    with open("/proc/meminfo") as f:
        for line in f:
            k, _, v = line.partition(":")
            d[k] = int(v.split()[0]) * 1024        # kB -> bytes
    return d["MemTotal"], d["MemAvailable"]

ballast = []                                       # list of 64 MiB byte objects

def held():
    return len(ballast) * CHUNK

while True:
    total, available = meminfo()
    # what the rest of the system is using, excluding our own ballast
    other_used = (total - available) - held()

    desired = int(total * TARGET_PCT / 100.0) - other_used   # to hit the target
    headroom = (total - MIN_FREE_MB * 1024 * 1024) - other_used
    desired = max(0, min(desired, headroom))                 # never starve the box

    want = desired // CHUNK
    have = len(ballast)

    if want > have:
        for _ in range(want - have):
            try:
                ballast.append(b"\x01" * CHUNK)    # fully materialised -> real RSS
            except MemoryError:
                break
    elif want < have:
        del ballast[want:]

    if len(ballast) != have:
        total_mb, held_mb = total // 1048576, held() // 1048576
        pct = (total - meminfo()[1]) * 100.0 / total
        print(f"ballast {have*64}MiB -> {held_mb}MiB "
              f"(mem now {pct:.1f}% of {total_mb}MiB)", flush=True)

    time.sleep(INTERVAL)
```
