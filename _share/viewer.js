/* Share server viewer: full-screen images, videos and before/after groups.
 * Swipe or ←/→ between items, pinch / double-tap / wheel to zoom, swipe down or Esc or Back to close.
 * The open item lives in the URL hash (#view=<file>), so a link can open it and Back closes it. */
(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const ICON = {
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    open: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3M11 8v6M8 11h6"/></svg>',
    zoomOut: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3M8 11h6"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/></svg>',
    split: '<svg viewBox="0 0 24 24"><path d="M8 9l-3 3 3 3M16 9l3 3-3 3"/></svg>',
  };
  const takesText = e => !!e && (e.isContentEditable || e.tagName === 'TEXTAREA' || e.tagName === 'SELECT' ||
    (e.tagName === 'INPUT' && !/^(button|submit|reset|checkbox|radio|range|color|file|image)$/i.test(e.type)));
  const STATE_CLS = s => 'b-' + String(s || '').replace(/\d+$/, '');

  /* ── page bits: fade-in thumbnails, topic filter ─────────────────────────────── */
  document.querySelectorAll('.thumb img, .cover img').forEach(img => {
    const box = img.closest('.thumb');
    const ok = () => { img.classList.add('ok'); box && box.classList.add('loaded'); };
    if (img.complete && img.naturalWidth) ok();
    else { img.addEventListener('load', ok); img.addEventListener('error', () => box && box.classList.add('loaded')); }
  });
  document.querySelectorAll('.thumb video').forEach(v => {
    const box = v.closest('.thumb');
    v.addEventListener('loadeddata', () => box.classList.add('loaded'));
    v.addEventListener('error', () => box.classList.add('loaded'));
    setTimeout(() => box.classList.add('loaded'), 4000);
  });
  const filter = $('.filter');
  if (filter) filter.addEventListener('input', () => {
    const q = filter.value.trim().toLowerCase();
    document.querySelectorAll('.topic').forEach(t => { t.style.display = !q || t.dataset.filter.includes(q) ? '' : 'none'; });
  });

  /* ── items ───────────────────────────────────────────────────────────────────── */
  const dataEl = $('#gallery-data');
  const galleryItems = dataEl ? JSON.parse(dataEl.textContent).items : [];
  const baseName = src => decodeURIComponent(String(src).split(/[?#]/)[0].split('/').pop());
  const titleOf = name => {
    const t = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const proseImgs = [...document.querySelectorAll('.prose img')];
  const proseItems = proseImgs.map(img => {
    const name = baseName(img.getAttribute('src'));
    const alt = (img.getAttribute('alt') || '').trim();
    return { type: 'image', src: img.getAttribute('src'), name, title: alt && !/^(before|after|image|screenshot)$/i.test(alt) ? alt : titleOf(name), badges: [], desc: '' };
  });
  const findInGallery = name => galleryItems.findIndex(it => it.name === name || (it.variants || []).some(v => v.name === name));

  /* ── image view: fit, pan, zoom ──────────────────────────────────────────────── */
  class ImageView {
    constructor(item, viewer) {
      this.item = item; this.v = viewer; this.zoomable = true;
      this.el = el('div', 'vw-stage');
      this.spin = el('div', 'vw-spin');
      this.img = el('img', 'vw-media');
      this.img.alt = item.title || '';
      this.img.draggable = false;
      this.img.decoding = 'async';
      this.el.append(this.spin, this.img);
      this.img.onload = () => {
        this.iw = this.img.naturalWidth || 800; this.ih = this.img.naturalHeight || 600;
        this.spin.remove(); this.img.classList.add('ok'); this.layout(true);
      };
      this.img.onerror = () => { this.spin.remove(); this.el.append(el('div', 'vw-err', 'Couldn’t load this image')); };
      this.img.src = item.src;
    }
    box() { return this.v.box(); }
    layout(reset) {
      if (!this.iw) return;
      const b = this.box();
      const contain = Math.min(b.w / this.iw, b.h / this.ih);
      const fitW = Math.min(b.w / this.iw, 1.5);
      // A full-page screenshot fitted whole is a sliver: show it at screen width and let it scroll.
      this.tall = this.ih / this.iw > Math.max(1.6, 1.5 * b.h / b.w);
      this.base = this.tall ? fitW : Math.min(contain, 2.5);
      this.min = Math.min(this.base, contain);
      this.max = Math.max(this.base * 5, 3);
      this.img.style.width = this.iw * this.base + 'px';
      this.img.style.height = this.ih * this.base + 'px';
      if (reset || this.s == null) {
        this.s = this.base;
        const w = this.iw * this.s;
        this.x = (b.W - w) / 2; this.y = b.y;
        this.clampNow();
      } else {
        this.s = clamp(this.s, this.min, this.max); this.clampNow();
      }
      this.apply();
    }
    bounds(s = this.s) {
      const b = this.box(), w = this.iw * s, h = this.ih * s;
      const bx = w <= b.W ? [(b.W - w) / 2, (b.W - w) / 2] : [b.W - w, 0];
      const by = h <= b.h ? [b.y + (b.h - h) / 2, b.y + (b.h - h) / 2] : [Math.min(b.y + b.h - h, 0), Math.max(b.y, 0)];
      if (h > b.h && h <= b.H) { const c = (b.H - h) / 2; by[0] = Math.min(by[0], c); by[1] = Math.max(by[1], c); }
      return { x: bx, y: by };
    }
    clampNow() { const bd = this.bounds(); this.x = clamp(this.x, bd.x[0], bd.x[1]); this.y = clamp(this.y, bd.y[0], bd.y[1]); }
    apply() {
      const k = this.s / this.base;
      this.img.style.transform = `translate3d(${this.x}px,${this.y}px,0) scale(${k})`;
    }
    overflow() {
      if (!this.iw) return { x: false, y: false };
      const bd = this.bounds();
      return { x: bd.x[1] - bd.x[0] > 1, y: bd.y[1] - bd.y[0] > 1 };
    }
    zoomed() { return this.iw && this.s > this.base * 1.01; }
    snapshot() { return { x: this.x, y: this.y, s: this.s }; }
    panTo(x, y) {
      const bd = this.bounds(), rub = (v, lo, hi) => v < lo ? lo - (lo - v) * 0.3 : v > hi ? hi + (v - hi) * 0.3 : v;
      this.x = rub(x, bd.x[0], bd.x[1]); this.y = rub(y, bd.y[0], bd.y[1]); this.apply();
    }
    zoomAt(s, cx, cy, from = this.snapshot(), soft = false) {
      if (!this.iw) return;
      s = soft ? (s < this.min ? this.min * Math.pow(s / this.min, 0.35) : s > this.max ? this.max * Math.pow(s / this.max, 0.35) : s) : clamp(s, this.min, this.max);
      const px = (cx - from.x) / from.s, py = (cy - from.y) / from.s;
      this.s = s; this.x = cx - px * s; this.y = cy - py * s;
      if (!soft) this.clampNow();
      this.apply();
    }
    settle() {
      this.v.animate(() => {
        if (this.s < this.min) { this.s = this.min; }
        if (this.s > this.max) { const b = this.box(); this.zoomAt(this.max, b.W / 2, b.H / 2); }
        this.clampNow(); this.apply();
      });
    }
    toggleZoom(cx, cy) {
      const b = this.box();
      if (cx == null) { cx = b.W / 2; cy = b.y + b.h / 2; }
      this.v.animate(() => {
        if (this.zoomed()) { this.s = this.base; const w = this.iw * this.s; this.x = (b.W - w) / 2; if (!this.tall) this.y = b.y; this.clampNow(); this.apply(); }
        else this.zoomAt(Math.min(Math.max(this.base * 2.5, 1), this.max), cx, cy);
      });
    }
    zoomBy(f) { const b = this.box(); this.v.animate(() => this.zoomAt(this.s * f, b.W / 2, b.y + b.h / 2)); }
    reset() { this.s = null; this.layout(true); }
    leave() { if (this.iw) this.reset(); }
    destroy() { this.img.onload = this.img.onerror = null; }
  }

  /* ── video view ──────────────────────────────────────────────────────────────── */
  class VideoView {
    constructor(item, viewer) {
      this.item = item; this.zoomable = false;
      this.el = el('div', 'vw-stage');
      this.video = el('video', 'vw-video');
      Object.assign(this.video, { controls: true, playsInline: true, preload: 'metadata', src: item.src });
      this.video.setAttribute('playsinline', '');
      this.el.append(this.video);
      this.v = viewer;
    }
    layout() {
      const b = this.v.box();
      Object.assign(this.video.style, { top: b.y + 'px', height: b.h + 'px', bottom: 'auto', maxHeight: b.h + 'px' });
    }
    overflow() { return { x: false, y: false }; } zoomed() { return false; }
    leave() { this.video.pause(); }
    destroy() { this.video.pause(); this.video.removeAttribute('src'); this.video.load(); }
  }

  /* ── before/after group view ─────────────────────────────────────────────────── */
  const MODES = [['slide', 'Slider'], ['side', 'Side by side'], ['flip', 'Flip']];
  // How much two same-size screenshots disagree once shrunk to a few dozen pixels wide: the share of cells whose
  // brightness differs a lot. A changed dialog moves a few cells; a shifted or different layout moves most of them.
  const MISALIGNED = 0.3;
  function misalignment(a, b) {
    if (!a.naturalWidth || !b.naturalWidth) return null;
    if (a.naturalWidth !== b.naturalWidth || a.naturalHeight !== b.naturalHeight) return 1;
    const w = 48, h = clamp(Math.round(w * a.naturalHeight / a.naturalWidth), 8, 400);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const gray = img => { ctx.clearRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h); const d = ctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
      for (let i = 0; i < g.length; i++) g[i] = 0.3 * d[4 * i] + 0.59 * d[4 * i + 1] + 0.11 * d[4 * i + 2]; return g; };
    try {
      const ga = gray(a), gb = gray(b);
      let off = 0;
      for (let i = 0; i < ga.length; i++) if (Math.abs(ga[i] - gb[i]) > 32) off++;
      return off / ga.length;
    } catch (_) { return null; }
  }
  window.shareMisalignment = misalignment;

  class CompareView {
    constructor(item, viewer) {
      this.item = item; this.v = viewer; this.zoomable = false;
      this.vs = item.variants;
      // Slider only for a real before/after of the same size that lines up; variants (prod, env, ar/en,
      // light/dark) and anything that doesn't line up start side by side. Every mode stays one tap away.
      this.mode = item.mode || 'side';
      this.show = item.right || 1;   // flip: the variant on screen; slide/side: the right-hand one
      this.pos = 0.5;
      this.el = el('div', 'vw-stage');
      this.cmp = el('div', 'vw-cmp');
      this.el.append(this.cmp);
      this.imgs = this.vs.map(v => { const i = new Image(); i.decoding = 'async'; i.draggable = false; i.alt = v.label; i.src = v.src; return i; });
      this.imgs.forEach(i => i.addEventListener('load', () => { this.layout(); this.checkAlignment(); }));
      this.render();
    }
    checkAlignment() {
      if (this.picked || this.mode !== 'slide' || this.checked) return;
      const a = this.imgs[0], b = this.imgs[this.show];
      if (!a.complete || !b.complete || !a.naturalWidth || !b.naturalWidth) return;
      this.checked = true;
      this.offness = misalignment(a, b);
      if (this.offness !== null && this.offness > MISALIGNED) {
        this.mode = 'side'; this.autoSide = true; this.render();
        if (this.v.view() === this) this.v.renderCaption();
      }
    }
    setMode(m) { this.mode = m; this.picked = true; if (m !== 'flip' && this.show === 0) this.show = this.item.right || 1; this.render(); }
    box() { return this.v.box(); }
    layout() {
      const b = this.box(), ref = this.imgs[0];
      let r = { left: 0, top: b.y, width: b.W, height: b.h };
      // slider and flip sit exactly on the picture, so the line and labels are on it, not on the letterbox
      if (this.mode !== 'side' && ref.naturalWidth) {
        const k = Math.min(b.W / ref.naturalWidth, b.h / ref.naturalHeight, 2.5);
        const w = ref.naturalWidth * k, h = ref.naturalHeight * k;
        r = { left: (b.W - w) / 2, top: b.y + (b.h - h) / 2, width: w, height: h };
      }
      Object.assign(this.cmp.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', bottom: 'auto', right: 'auto' });
      if (this.mode === 'slide') this.placeDivider();
    }
    render() {
      const vs = this.vs, L = vs[0], R = vs[this.show === 0 ? 1 : this.show];
      this.cmp.textContent = '';
      this.imgs.forEach(i => i.remove());
      if (this.mode === 'slide') {
        const a = el('div', 'layer'), b = el('div', 'layer top');
        a.append(this.imgs[0]); b.append(this.imgs[vs.indexOf(R)]);
        this.top = b;
        this.divider = el('div', 'divider', `<div class="knob">${ICON.split}</div>`);
        this.cmp.append(a, b, this.divider,
          el('span', `lbl l ${STATE_CLS(L.state)}`, esc(L.label)), el('span', `lbl r ${STATE_CLS(R.state)}`, esc(R.label)));
        this.placeDivider();
      } else if (this.mode === 'side') {
        const side = el('div', 'side');
        [L, R].forEach(v => {
          const f = el('figure'), d = el('div');
          d.append(this.imgs[vs.indexOf(v)]);
          f.append(d, el('figcaption', '', `<span class="lbl-inline ${STATE_CLS(v.state)}">${esc(v.label)}</span>`));
          side.append(f);
        });
        this.cmp.append(side);
      } else {
        const v = vs[this.show];
        const layer = el('div', 'layer'); layer.append(this.imgs[this.show]);
        this.cmp.append(layer, el('span', `flipl ${STATE_CLS(v.state)}`, esc(v.label)));
      }
      this.layout();
    }
    placeDivider() {
      if (!this.top) return;
      const p = this.pos * 100;
      this.top.style.clipPath = `inset(0 0 0 ${p}%)`;
      this.divider.style.left = p + '%';
    }
    // slider: a drag that starts on the divider moves it; elsewhere the viewer swipes as usual
    grabs(x) {
      if (this.mode !== 'slide') return false;
      const r = this.cmp.getBoundingClientRect();
      return Math.abs(x - (r.left + r.width * this.pos)) < 36;
    }
    slideTo(x) {
      const r = this.cmp.getBoundingClientRect();
      this.pos = clamp((x - r.left) / r.width, 0, 1);
      this.placeDivider();
    }
    tap(x) {
      if (this.mode === 'slide') { this.v.animate(() => this.slideTo(x), 'cmp'); return true; }
      if (this.mode === 'flip') { this.select((this.show + 1) % this.vs.length); return true; }
      return false;
    }
    select(i) {
      if (this.mode !== 'flip' && i === 0) return;
      this.show = i; this.checked = false; this.render(); this.checkAlignment(); this.v.renderCaption();
    }
    step(d) {
      const lo = this.mode === 'flip' ? 0 : 1, n = this.vs.length;
      const next = this.show + d;
      if (next < lo || next >= n) return false;
      this.select(next); return true;
    }
    current() { return this.mode === 'flip' ? this.vs[this.show] : this.vs[this.show === 0 ? 1 : this.show]; }
    shown() { return this.mode === 'flip' ? [this.vs[this.show]] : [this.vs[0], this.current()]; }
    overflow() { return { x: false, y: false }; } zoomed() { return false; }
    leave() {} destroy() {}
  }

  /* ── the viewer ──────────────────────────────────────────────────────────────── */
  class Viewer {
    constructor() {
      this.views = new Map();
      this.chrome = true;
    }
    build() {
      const r = this.root = el('div', 'vw');
      r.setAttribute('role', 'dialog'); r.tabIndex = -1; r.setAttribute('inputmode', 'none'); r.setAttribute('aria-modal', 'true'); r.setAttribute('aria-label', 'Image viewer');
      r.innerHTML = `
        <div class="vw-bg"></div>
        <div class="vw-track"></div>
        <div class="vw-top">
          <button class="vw-btn vw-close" aria-label="Close (Esc)" title="Close (Esc)">${ICON.close}</button>
          <span class="vw-pos" aria-live="polite"></span>
          <button class="vw-btn vw-zoom" aria-label="Zoom" title="Zoom (+ / −)">${ICON.zoomIn}</button>
          <a class="vw-btn vw-orig" target="_blank" rel="noopener" aria-label="Open the original" title="Open the original">${ICON.open}</a>
          <a class="vw-btn vw-dl" download aria-label="Download" title="Download">${ICON.down}</a>
        </div>
        <button class="vw-nav prev" aria-label="Previous (←)">${ICON.prev}</button>
        <button class="vw-nav next" aria-label="Next (→)">${ICON.next}</button>
        <div class="vw-bottom"><div class="vw-cap"></div><div class="vw-strip" role="tablist"></div></div>
        <div class="vw-toast"></div>`;
      this.bg = $('.vw-bg', r); this.track = $('.vw-track', r);
      this.posEl = $('.vw-pos', r); this.cap = $('.vw-cap', r); this.strip = $('.vw-strip', r);
      this.bottom = $('.vw-bottom', r); this.topBar = $('.vw-top', r);
      $('.vw-close', r).onclick = () => this.close();
      $('.vw-zoom', r).onclick = () => { const v = this.view(); v && v.zoomable && v.toggleZoom(); this.syncButtons(); };
      $('.prev', r).onclick = () => this.go(-1);
      $('.next', r).onclick = () => this.go(1);
      this.bindGestures();
    }
    box() {
      const W = this.root.clientWidth, H = this.root.clientHeight;
      const top = this.chrome ? this.topBar.offsetHeight - 14 : 0;
      const bottom = this.chrome ? Math.min(this.bottom.offsetHeight - 18, H * 0.42) : 0;
      return { W, H, y: Math.max(0, top), h: Math.max(80, H - Math.max(0, top) - Math.max(0, bottom)), w: W };
    }
    open(list, index, { fromHash = false } = {}) {
      if (!this.root) this.build();
      this.list = list; this.idx = clamp(index, 0, list.length - 1);
      this.returnFocus = document.activeElement;
      this.views.forEach(v => v.destroy()); this.views.clear();
      document.documentElement.classList.add('viewing');
      document.body.append(this.root);
      this.root.classList.toggle('single', list.length < 2);
      this.buildStrip();
      this.show();
      requestAnimationFrame(() => this.root.classList.add('open'));
      const hash = '#view=' + encodeURIComponent(this.item().name);
      if (fromHash) history.replaceState(null, '', location.pathname + location.search);
      history.pushState({ vw: 1 }, '', hash);
      this.isOpen = true;
      // Nothing that takes text may keep focus under the viewer: Windows shows its touch-keyboard indicator for it
      // and keys would type into it. The viewer takes focus and keeps it until it closes.
      const ae = document.activeElement;
      if (ae && ae !== document.body && takesText(ae)) ae.blur();
      this.root.focus({ preventScroll: true });
      this.onFocusIn = e => { if (!this.root.contains(e.target) || takesText(e.target)) this.root.focus({ preventScroll: true }); };
      document.addEventListener('focusin', this.onFocusIn);
      this.onKey = e => this.key(e); document.addEventListener('keydown', this.onKey);
      this.onResize = () => this.relayout(); window.addEventListener('resize', this.onResize);
    }
    close() {
      if (history.state && history.state.vw) history.back(); // popstate tears down
      else this.teardown();
    }
    teardown() {
      if (!this.isOpen) return;
      this.isOpen = false;
      document.removeEventListener('keydown', this.onKey); window.removeEventListener('resize', this.onResize);
      document.removeEventListener('focusin', this.onFocusIn);
      this.views.forEach(v => v.destroy()); this.views.clear();
      this.root.classList.remove('open', 'bare'); this.chrome = true;
      this.track.textContent = '';
      this.root.remove();
      document.documentElement.classList.remove('viewing');
      const card = this.list === galleryItems ? document.querySelector(`.card[data-i="${this.idx}"]`) : proseImgs[this.idx];
      const back = this.returnFocus && this.returnFocus.isConnected && this.returnFocus !== document.body && !takesText(this.returnFocus) ? this.returnFocus : card;
      if (card) card.scrollIntoView({ block: 'nearest' });
      if (back && back.focus) back.focus({ preventScroll: true });
    }
    item(i = this.idx) { return this.list[i]; }
    view(i = this.idx) { return this.views.get(i); }
    makeView(i) {
      if (i < 0 || i >= this.list.length) return null;
      if (!this.views.has(i)) {
        const it = this.list[i];
        const v = it.type === 'group' ? new CompareView(it, this) : it.type === 'video' ? new VideoView(it, this) : new ImageView(it, this);
        this.views.set(i, v);
      }
      return this.views.get(i);
    }
    show() {
      for (const [i, v] of this.views) if (Math.abs(i - this.idx) > 1) { v.destroy(); this.views.delete(i); }
      this.track.textContent = '';
      for (let i = this.idx - 1; i <= this.idx + 1; i++) {
        const slide = el('div', 'vw-slide');
        const v = this.makeView(i);
        if (v) slide.append(v.el);
        this.track.append(slide);
      }
      this.setTrack(0);
      this.renderCaption();
      this.relayout();
      const pre = this.item(this.idx + 2); if (pre && pre.type === 'image') new Image().src = pre.src;
    }
    relayout() { for (const [i, v] of this.views) v.layout(i !== this.idx || !v.zoomed()); }
    setTrack(dx) { this.track.style.transform = `translate3d(${-this.root.clientWidth + dx}px,0,0)`; }
    go(d) {
      const to = this.idx + d;
      if (to < 0 || to >= this.list.length) { this.bounce(d); return; }
      const cur = this.view(); cur && cur.leave();
      this.animate(() => this.setTrack(-d * this.root.clientWidth), 'track', () => {
        this.idx = to;
        history.replaceState({ vw: 1 }, '', '#view=' + encodeURIComponent(this.item().name));
        this.show();
      });
    }
    goTo(i) { if (i === this.idx) return; const cur = this.view(); cur && cur.leave(); this.idx = i; history.replaceState({ vw: 1 }, '', '#view=' + encodeURIComponent(this.item().name)); this.show(); }
    bounce(d) { this.animate(() => this.setTrack(d * -40), 'track', () => this.animate(() => this.setTrack(0), 'track')); }
    animate(fn, what = 'all', done) {
      this.root.classList.add('anim');
      if (what === 'cmp') { const v = this.view(); v && v.top && (v.top.style.transition = v.divider.style.transition = 'clip-path .25s ease, left .25s ease'); }
      fn();
      clearTimeout(this.animT);
      this.animT = setTimeout(() => {
        this.root.classList.remove('anim');
        const v = this.view(); if (v && v.top) v.top.style.transition = v.divider.style.transition = '';
        done && done();
      }, 290);
    }
    setChrome(on) {
      this.chrome = on;
      this.root.classList.toggle('bare', !on);
      this.animate(() => this.relayout());
    }
    toast(msg) { const t = $('.vw-toast', this.root); t.textContent = msg; t.classList.add('on'); clearTimeout(this.toastT); this.toastT = setTimeout(() => t.classList.remove('on'), 1100); }

    /* caption, buttons, strip */
    renderCaption() {
      const it = this.item(), n = this.list.length, v = this.view();
      this.posEl.textContent = n > 1 ? `${this.idx + 1} / ${n}` : '';
      const cur = it.type === 'group' && v ? v.current() : it;
      const badges = (it.type === 'group' ? it.badges : it.badges || []).map(b =>
        `<span class="badge ${/^(before|after|prod|old|new|current)/i.test(b) ? STATE_CLS(b.split(' ')[0].toLowerCase()) : ''}">${esc(b)}</span>`).join('');
      let desc = esc(it.desc || '');
      if (it.type === 'group') {
        const lines = it.variants.filter(x => x.title || x.desc).map(x => `<b>${esc(x.label)}:</b> ${esc([x.title, x.desc].filter(Boolean).join(' — '))}`);
        desc = lines.join('<br>');
      }
      let ctl = '', files = esc(cur.name);
      if (it.type === 'group' && v) {
        const mode = v.mode;
        const modes = MODES.map(([k, l]) => `<button data-mode="${k}" class="${mode === k ? 'on' : ''}">${l}</button>`).join('');
        const choosable = mode === 'flip' ? it.variants : it.variants.slice(1);
        const chips = choosable.length > 1 ? `<span class="seg vw-var">${choosable.map(x => {
          const i = it.variants.indexOf(x);
          return `<button data-v="${i}" class="${(mode === 'flip' ? v.show === i : (v.show || 1) === i) ? 'on' : ''}">${mode === 'flip' ? '' : esc(it.variants[0].label) + ' vs '}${esc(x.label)}</button>`;
        }).join('')}</span>` : '';
        const hint = v.autoSide && mode === 'side' ? 'Side by side: these two don’t line up' :
          { slide: 'Drag the line or tap to move it', side: '', flip: 'Tap the image to flip' }[mode];
        ctl = `<div class="vw-ctl"><span class="seg vw-mode">${modes}</span>${chips}${hint ? `<span class="vw-hint">${hint}</span>` : ''}</div>`;
        files = v.shown().map(x => `<span class="vw-fn"><b>${esc(x.label)}</b> ${esc(x.name)}</span>`).join('');
      }
      this.cap.innerHTML =
        (it.section ? `<div class="vw-sec">${esc(it.section)}</div>` : '') +
        `<div class="vw-title">${it.num ? `<span class="num">${esc(it.num)}</span>` : ''}<span>${esc(it.title)}</span>${badges}</div>` +
        `<div class="vw-desc">${desc}</div>` + ctl +
        `<div class="vw-file">${files}</div>`;
      const d = $('.vw-desc', this.cap); d.onclick = () => d.classList.toggle('more');
      this.cap.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => this.setMode(b.dataset.mode));
      this.cap.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const cv = this.view(); cv.select(+b.dataset.v); });
      const orig = $('.vw-orig', this.root), dl = $('.vw-dl', this.root);
      orig.href = cur.src; dl.href = cur.src; dl.setAttribute('download', cur.name);
      this.syncButtons();
      this.strip.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('on', i === this.idx); b.setAttribute('aria-selected', i === this.idx); });
      const on = this.strip.children[this.idx];
      if (on) this.strip.scrollLeft = on.offsetLeft - this.strip.clientWidth / 2 + on.offsetWidth / 2;
    }
    setMode(m) {
      const v = this.view();
      if (!(v instanceof CompareView)) return;
      v.setMode(m); this.renderCaption(); v.layout();
    }
    syncButtons() {
      const v = this.view();
      const z = $('.vw-zoom', this.root);
      z.style.display = v && v.zoomable ? '' : 'none';
      z.innerHTML = v && v.zoomed() ? ICON.zoomOut : ICON.zoomIn;
      $('.prev', this.root).disabled = this.idx === 0;
      $('.next', this.root).disabled = this.idx === this.list.length - 1;
    }
    buildStrip() {
      this.strip.textContent = '';
      if (this.list.length < 2) return;
      this.list.forEach((it, i) => {
        const b = el('button'); b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `${i + 1}: ${it.title}`);
        const src = it.type === 'group' ? it.variants[it.variants.length - 1].src : it.src;
        if (it.type === 'video') b.append(el('span', 'sv', ICON.play));
        else { const im = el('img'); im.loading = 'lazy'; im.decoding = 'async'; im.alt = ''; im.src = src; b.append(im); }
        b.onclick = () => this.goTo(i);
        this.strip.append(b);
      });
    }

    /* keyboard */
    key(e) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      const v = this.view(), it = this.item();
      const k = e.key;
      if (k === 'Escape') { e.preventDefault(); if (v && v.zoomed()) { v.toggleZoom(); this.syncButtons(); } else this.close(); return; }
      if (e.target.tagName === 'VIDEO' && (k === ' ' || k === 'ArrowLeft' || k === 'ArrowRight')) return;
      if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey && !(v && v.tall))) { e.preventDefault(); this.go(1); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); this.go(-1); }
      else if (k === 'Home') { e.preventDefault(); this.goTo(0); }
      else if (k === 'End') { e.preventDefault(); this.goTo(this.list.length - 1); }
      else if ((k === '+' || k === '=') && v && v.zoomable) { v.zoomBy(1.5); this.syncButtons(); }
      else if ((k === '-' || k === '_') && v && v.zoomable) { v.zoomBy(1 / 1.5); this.syncButtons(); }
      else if (k === '0' && v && v.zoomable) { this.animate(() => v.reset()); this.syncButtons(); }
      else if ((k === 'ArrowDown' || k === 'ArrowUp') && it.type === 'group') { e.preventDefault(); v.step(k === 'ArrowDown' ? 1 : -1); }
      else if ((k === 'ArrowDown' || k === 'ArrowUp') && v && v.overflow && v.overflow().y) { e.preventDefault(); this.animate(() => v.panTo(v.x, v.y + (k === 'ArrowDown' ? -1 : 1) * this.root.clientHeight * 0.6)); v.clampNow(); }
      else if (k === 'm' && it.type === 'group') { const i = MODES.findIndex(m => m[0] === v.mode); this.setMode(MODES[(i + 1) % MODES.length][0]); this.toast(MODES[(i + 1) % MODES.length][1]); }
      else if (k === 'i' || k === 'h') this.setChrome(!this.chrome);
      else if (k === 'f') { document.fullscreenElement ? document.exitFullscreen() : this.root.requestFullscreen && this.root.requestFullscreen().catch(() => {}); }
    }

    /* pointer gestures: swipe, pan, pinch, double-tap, swipe-down-to-close, wheel */
    bindGestures() {
      const r = this.root, pts = new Map();
      let g = null, lastTap = null, tapT = null;
      const mid = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
      const onUi = t => t.closest('.vw-top, .vw-bottom, .vw-nav');
      r.addEventListener('pointerdown', e => {
        if (onUi(e.target) || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const v = this.view();
        if (e.target.tagName === 'VIDEO') {
          const rect = e.target.getBoundingClientRect();
          if (e.clientY > rect.bottom - 70) return; // leave the native controls alone
        }
        cancelAnimationFrame(this.inertia);
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { r.setPointerCapture(e.pointerId); } catch (_) {}
        if (pts.size === 1) {
          g = { mode: null, x0: e.clientX, y0: e.clientY, t0: performance.now(), snap: v && v.snapshot ? v.snapshot() : null, hist: [], target: e.target };
          g.grab = v instanceof CompareView && v.grabs(e.clientX);
        } else if (pts.size === 2 && v && v.zoomable && v.iw) {
          const m = mid();
          g = { mode: 'pinch', m0: m, snap: v.snapshot(), hist: [] };
          this.setTrack(0);
        }
      });
      r.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId) || !g) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const v = this.view();
        if (g.mode === 'pinch' && pts.size === 2) {
          const m = mid();
          v.zoomAt(g.snap.s * m.d / g.m0.d, m.x, m.y, { x: g.snap.x + (m.x - g.m0.x), y: g.snap.y + (m.y - g.m0.y), s: g.snap.s }, true);
          return;
        }
        if (pts.size !== 1) return;
        const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
        g.hist.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (g.hist.length > 6) g.hist.shift();
        if (!g.mode) {
          if (Math.hypot(dx, dy) < 8) return;
          const of = v && v.overflow ? v.overflow() : { x: false, y: false };
          const horiz = Math.abs(dx) > Math.abs(dy);
          if (g.grab && horiz) g.mode = 'slider';
          else if ((horiz && of.x) || (!horiz && of.y)) g.mode = 'pan';
          else if (horiz) g.mode = this.list.length > 1 ? 'swipe' : 'none';
          else if (dy > 0 && !(v && v.zoomed())) g.mode = 'dismiss';
          else g.mode = 'none';
          clearTimeout(tapT); tapT = null; lastTap = null;
        }
        if (g.mode === 'slider') v.slideTo(e.clientX);
        else if (g.mode === 'pan') v.panTo(g.snap.x + dx, g.snap.y + dy);
        else if (g.mode === 'swipe') {
          const edge = (dx > 0 && this.idx === 0) || (dx < 0 && this.idx === this.list.length - 1);
          this.setTrack(edge ? dx * 0.3 : dx);
        } else if (g.mode === 'dismiss') {
          const p = Math.max(0, dy);
          this.track.style.transform = `translate3d(${-r.clientWidth}px,${p}px,0) scale(${1 - Math.min(p / r.clientHeight, 1) * 0.15})`;
          this.bg.style.opacity = String(1 - Math.min(p / (r.clientHeight * 0.6), 1));
          r.classList.add('bare');
        }
      });
      const end = e => {
        if (!pts.has(e.pointerId)) return;
        pts.delete(e.pointerId);
        if (!g) return;
        const v = this.view();
        if (g.mode === 'pinch') {
          if (pts.size === 0) { v.settle(); this.syncButtons(); g = null; }
          else g.mode = 'after-pinch';
          return;
        }
        if (pts.size) return;
        const dx = e.clientX - g.x0, dy = e.clientY - g.y0, dt = performance.now() - g.t0;
        const h = g.hist, last = h[h.length - 1], first = h.find(p => last && last.t - p.t < 90) || h[0];
        const vx = last && first && last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;
        const vy = last && first && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0;
        const mode = g.mode; g = null;
        if (mode === 'swipe') {
          const W = r.clientWidth;
          if ((dx < -W * 0.18 || vx < -0.45) && this.idx < this.list.length - 1) this.go(1);
          else if ((dx > W * 0.18 || vx > 0.45) && this.idx > 0) this.go(-1);
          else this.animate(() => this.setTrack(0), 'track');
        } else if (mode === 'dismiss') {
          if (dy > 110 || vy > 0.6) { this.bg.style.opacity = ''; this.close(); }
          else { this.animate(() => { this.setTrack(0); this.bg.style.opacity = ''; }, 'track'); r.classList.toggle('bare', !this.chrome); }
        } else if (mode === 'pan') {
          this.fling(v, vx, vy);
        } else if (mode === null && dt < 350 && e.type === 'pointerup') {
          this.tap(e.clientX, e.clientY, e.target);
        }
      };
      this.tap = (x, y, target) => {
        const v = this.view();
        if (target && target.tagName === 'VIDEO') return;
        const now = performance.now();
        if (lastTap && now - lastTap.t < 300 && Math.hypot(x - lastTap.x, y - lastTap.y) < 40) {
          clearTimeout(tapT); tapT = null; lastTap = null;
          if (v && v.zoomable) { v.toggleZoom(x, y); this.syncButtons(); }
          return;
        }
        lastTap = { t: now, x, y };
        if (v instanceof CompareView && v.tap(x)) { this.renderCaption(); lastTap = null; return; }
        tapT = setTimeout(() => { tapT = null; this.setChrome(!this.chrome); }, v && v.zoomable ? 300 : 0);
      };
      r.addEventListener('pointerup', end);
      r.addEventListener('pointercancel', end);
      r.addEventListener('wheel', e => {
        if (onUi(e.target)) return;
        e.preventDefault();
        const v = this.view();
        if (!v) return;
        if (e.ctrlKey && v.zoomable) { cancelAnimationFrame(this.inertia); v.zoomAt(v.s * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY); this.syncButtons(); return; }
        const of = v.overflow();
        if (of.x || of.y) { v.panTo(v.x - (of.x ? e.deltaX : 0), v.y - (of.y ? e.deltaY : 0)); v.clampNow(); v.apply(); return; }
        // trackpad sideways swipe or a plain wheel: one item per gesture
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const now = performance.now();
        if (now - (this.wheelT || 0) > 400 && Math.abs(d) > 25) { this.wheelT = now; this.go(d > 0 ? 1 : -1); }
        else if (Math.abs(d) > 4) this.wheelT = now;
      }, { passive: false });
    }
    fling(v, vx, vy) {
      if (!v || !v.panTo) return;
      let last = performance.now();
      const stepFn = now => {
        const dt = Math.min(32, now - last); last = now;
        vx *= Math.pow(0.95, dt / 16); vy *= Math.pow(0.95, dt / 16);
        const bd = v.bounds();
        v.x = clamp(v.x + vx * dt, bd.x[0], bd.x[1]); v.y = clamp(v.y + vy * dt, bd.y[0], bd.y[1]); v.apply();
        if (Math.hypot(vx, vy) > 0.02) this.inertia = requestAnimationFrame(stepFn);
      };
      const bd = v.bounds();
      const out = v.x < bd.x[0] || v.x > bd.x[1] || v.y < bd.y[0] || v.y > bd.y[1];
      if (out) { this.animate(() => { v.clampNow(); v.apply(); }); return; }
      this.inertia = requestAnimationFrame(stepFn);
    }
  }

  const viewer = new Viewer();
  window.shareViewer = viewer; // handy from the console and for tests

  /* ── wiring: cards, README images, hash, back button ─────────────────────────── */
  const plain = e => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button);
  document.querySelectorAll('.card[data-i]').forEach(card => card.addEventListener('click', e => {
    if (!plain(e)) return;
    e.preventDefault(); viewer.open(galleryItems, +card.dataset.i);
  }));
  proseImgs.forEach((img, i) => {
    img.tabIndex = 0;
    const open = e => {
      const link = img.closest('a'); if (link && link.getAttribute('href') !== img.getAttribute('src')) return;
      e.preventDefault();
      const gi = findInGallery(proseItems[i].name);
      if (gi >= 0 && baseName(img.getAttribute('src')) === proseItems[i].name && !img.getAttribute('src').includes('/')) {
        const it = galleryItems[gi];
        if (it.type === 'group') { const vi = it.variants.findIndex(x => x.name === proseItems[i].name); viewer.open(galleryItems, gi); const cv = viewer.view(); if (cv && vi > 0) cv.select(vi); else if (cv && vi === 0 && cv.mode === 'flip') cv.select(0); viewer.renderCaption(); }
        else viewer.open(galleryItems, gi);
      } else viewer.open(proseItems, i);
    };
    img.addEventListener('click', e => plain(e) && open(e));
    img.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && open(e));
  });

  const fromHash = () => {
    const m = location.hash.match(/^#view=(.+)$/);
    if (!m) return false;
    const name = decodeURIComponent(m[1]);
    let i = findInGallery(name);
    if (i >= 0) { viewer.open(galleryItems, i, { fromHash: true }); const it = galleryItems[i]; if (it.type === 'group') { const vi = it.variants.findIndex(x => x.name === name); if (vi > 0) { viewer.view().select(vi); } } return true; }
    i = proseItems.findIndex(it => it.name === name);
    if (i >= 0) { viewer.open(proseItems, i, { fromHash: true }); return true; }
    return false;
  };
  window.addEventListener('popstate', () => {
    if (viewer.isOpen && !(history.state && history.state.vw)) viewer.teardown();
    else if (!viewer.isOpen && location.hash.startsWith('#view=')) fromHash();
  });
  // a #view= link followed on this same page (a new hash, not Back) opens that picture
  window.addEventListener('hashchange', () => { if (!viewer.isOpen && location.hash.startsWith('#view=')) fromHash(); });
  fromHash();
})();
