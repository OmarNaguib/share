# Buret: Sales and Customers questions for Moaz and Mostafa

Draft, 2026-11-09. **Omar sends this with the Sales + Customers founder build.** It replaces the Sales part of the
2026-11-06 pack and adds Customers. Stock, purchasing, import and users come in their own pack.

**The build.** It is the Sales founder build with the customers module turned on. Choose «صيدلية تجريبية» on the
first screen. It opens a demo pharmacy with a real item list (from a pilot pharmacy), a few invented
items, four demo sign-in accounts (owner, manager, pharmacist, cashier) and four invented customers:

- «حسام فتحي»: buys on credit, limit 1,500 ج, each invoice due 30 days after it.
- «نادية إبراهيم»: holds 56 points from one earlier cash sale (invoice 1).
- «شريف عادل»: linked to «شركة التأمين التجريبية» (local items 10%, imported 5%, the company pays 70%, medicines
  only).
- «هالة مصطفى»: has a saved delivery address.

**Nothing here blocks the build.** Every item has a default that Buret follows today. Your answer either confirms
the default or turns into a change.

When you try the build, note that item search forgives letter forms (أ/ا, ى/ي, ة/ه), diacritics and one typing
mistake, but not two. S-22 explains the rules in full and asks how forgiving it should be.

Receipts don't print in this build: there is no screen yet to choose a printer, so a finished sale says
«اختر طابعة الإيصال من الإعدادات». The printer card («الطابعات») comes with Settings. The receipt itself (58 or 80 mm,
returns, «نسخة» reprints) is built.

How to read each item:

- **Question**: the question in plain words.
- **Options**: what you can choose between.
- **Buret today**: what is built now, with the id of the call (so Omar can find it).
- **Why it matters**: what it changes for a pharmacy.
- **If you say no**: what we would change.

Arabic in «» is the exact text on screen. Where a question started as a GitHub issue, its number is given as
(#nnn) so Omar can paste your answer there.

Who is asked: **M** = Moaz (product), **D** = Mostafa (design), **M+D** = both.

Omar can share screenshots of the screen items (design next to the app) on request.

---

## 1. Sales

### S-1. A manager's discount approval: does it have its own limit? (M) (#368)

- **Question:** when a seller asks for a discount above their limit and a manager approves it, can the manager
  approve any amount, up to 100%?
- **Options:** (1) an approval lifts every limit, and the audit record is the control; (2) an approval lifts the
  seller's limit only up to the approver's own limit and the pharmacy's caps; (3) as (2), and nobody can approve
  a discount on their own sale.
- **Buret today:** (1), calls A3-9 and A3-10. Self-approval is allowed: a manager can approve 100% on their
  own sale with their own password. Every approval is recorded with who approved it.
- **Why it matters:** this is the main way money can leave the till as "discount" without a cash shortage
  showing. With (1), the audit record is the only check.
- **If you say no:** say "cap approvals" for (2) or "cap approvals, no self-approval" for (3). The screens stay the
  same, with one new refusal message.

### S-2. Empty "lost receipt" invoices after a restore (M) (#413)

- **Question:** after a backup is restored, some receipt numbers were already printed but are no longer in the
  database. Buret fills each one with an empty, zero-total invoice so a receipt number never repeats and every
  gap is named. Should these show in the sales invoice list and in reports?
- **Options:** shown (labelled as lost receipts); hidden by default with a filter to show them.
- **Buret today:** shown, labelled as lost receipts, and left out of totals (they are zero anyway) (#277, #413).
- **Why it matters:** a pharmacist scrolling the list will see invoices with no lines. Hiding them is tidier;
  showing them makes the gap visible to the owner and to a tax inspector.
- **If you say no:** lists and reports hide them unless a filter asks for them. The invoices themselves stay
  (they are what stops a number being reused).

### S-3. The business day for pharmacies that trade past midnight (M) (#321)

- **Question:** a pilot pharmacy trades until about 02:30. Should the "day" end at midnight, or at a cutoff such
  as 04:00?
- **Options:** (a) one setting for the whole app, default 04:00, used by reports, day totals and the return window;
  (b) keep midnight.
- **Buret today:** (b) midnight. The drawer follows the shift, not the calendar date (call A4-9), so a shift that
  runs past midnight stays one shift.
- **Why it matters:** with midnight, the evening shift's sales split across two report days, and "today's sales"
  at 01:00 shows almost nothing.
- **If you say no (choose a):** a business-day cutoff setting is added, and reports, the return window and day
  totals use it. Omar must also sign this off.

### S-4. Returning goods sold before Buret was installed (M+D) (#301, PQ-AFB-6)

- **Question:** sales history is not imported, so for about a month after the move a customer can bring back goods
  that have no invoice in Buret. Is the "return without an invoice" in this build right, and should it stay?
- **Options:** keep it as built; keep it but hide it from users who cannot use it (today they see it and are
  refused when they confirm); remove it from v1.
- **Buret today:** built. In «إنشاء مرتجع», the panel «مرتجع بدون فاتورة» says «يُحسب المبلغ بسعر التشغيلة الآن،
  ويُرد نقدًا، وترجع الكمية إلى التشغيلة المختارة.». The reason is one of «بيع قبل بدء العمل على بيوريت» /
  «فُقدت الفاتورة» / «سبب آخر». Only a user who may make returns after the return window can confirm it. The panel
  carries a note that its rules still need a pharmacy owner to confirm them. It is not in the design.
- **Why it matters:** without it, the first weeks after the move create arguments at the counter, or returns done
  off the books. With it, cash leaves the drawer with no invoice behind it, so who may use it matters.
- **What we need from Mostafa:** a drawn version of the panel for the next design export.
- **If you say no:** we hide it from users without the permission, or take it out.

### S-5. Opening a second box of the same batch (D) (#482)

- **Question:** Omar ruled that each batch has at most one open box per store, so «علبة جديدة» is turned off while a
  box of that batch is open. How often do your pharmacists open a second box of the same batch on purpose?
- **Options:** rarely (keep the rule); often (we change how open boxes are tracked).
- **Buret today:** one open box per batch (Omar's ruling on #482, calls A7-2 and A7-6). While a batch has an open
  box, strips come from it first, and «علبة جديدة» is offered only for another batch. Known limit: loose strips
  that are returned until they add up to a full box count as a sealed box again.
- **Why it matters:** the rule keeps the count of loose strips right without a number on every box. The cost is
  that the seller cannot open a second box of the same batch.
- **If you say "often":** Buret moves to a number on every box. It is a large change that touches returns.

### S-6. Closing an invoice tab that has lines (D) (#402)

- **Question:** the 11-04 design asks «إغلاق دون حفظ» / «رجوع للفاتورة», saying «عند الإغلاق تُحذف الأصناف ولا
  تُحفظ الفاتورة.». Buret also offers to keep the invoice as a draft. Which one?
- **Options:** closing deletes the lines (as drawn), and the deletion is kept in the audit record; closing can
  keep it as a draft, with a separate delete.
- **Buret today:** three buttons: «رجوع», «حفظ كمسودة», «حذف البنود وإغلاق» (the deletion is kept in the audit
  record).
- **Why it matters:** a closed tab with lines is either a lost sale or a saved one. Deleting is faster; keeping
  avoids losing a half-built order when someone clicks the wrong button.
- **If you say no:** the dialog becomes the design's two buttons, and closing always deletes the lines.

### S-7. Open invoices: block only the drawer handover, or sign-out and exit too? (D) (#399)

- **Question:** your own PQ-17 answer (2026-11-03) was «لا يتم التسليم بدون اتمام الفاتورة او اغلاقها». Buret
  now follows it and blocks the handover. Should sign-out and closing the app also be blocked while invoices hold lines?
- **Options:** handover only; also block sign-out and exit.
- **Buret today:** handover only. «تسليم الدرج» is disabled and each open invoice is listed with «فتح وإتمام» /
  «إغلاق» (call A4-12, from your PQ-17 answer). Empty drafts are ignored. Coming in the next build (Omar,
  2026-11-09): a finished handover signs the giver out and signs the receiver in, since the handover form has just
  checked the receiver's name and password.
- **Why it matters:** drafts live on the main PC, so exiting loses nothing. But the next person on the till may
  inherit someone else's open invoices.
- **If you say no:** sign-out and exit get the same block, with «فتح وإتمام» / «إغلاق».

### S-8. Reprinting a completed sale's receipt (M+D) (#393, #410)

- **Question:** your PQ-16 answer was «من غير طباعة». Buret now has a reprint. Is that what you meant? And who may
  use it?
- **Options:** no reprint in v1; view the receipt on screen only; a reprint marked «نسخة» (as built), for the roles
  you name.
- **Buret today:** «طباعة نسخة» in «فواتير البيع», for the owner and the manager only (call 67, the PQ-16
  default). The paper says «نسخة». A pharmacist can open the list but sees «ليست لديك صلاحية طباعة نسخة من
  الفاتورة.»; whether the pharmacist gets the reprint waits for Omar. A cashier cannot open «فواتير البيع» at all
  (call A9-1). Known gap (#410): the seller's "print again" after a printer error (call A15-fails2-3) also prints
  the stored invoice, and it is open to anyone who can sell.
- **Why it matters:** customers often ask for a copy for insurance or a refund. A copy that does not say «نسخة»
  could be used to claim a second refund.
- **If you say no:** we build the option you pick, and give the reprint to the roles you name.

### S-9. Delivery orders: when stock leaves, and when «تحصيل» is allowed (M+D) (#391)

- **Question:** your D3 answer: the order can be changed until collection; stock leaves when it goes out; collection
  is entered only when the courier is back with the money. Buret takes stock at registration and allows «تحصيل» at
  any time before the order is collected or cancelled. Is that close enough?
- **Options:** keep as built; take stock only when the order goes out with a courier; allow «تحصيل» only for an
  order that has gone out (a platform order stays «في الصيدلية», so it would need its own rule).
- **Buret today:** registration takes the stock (call A14-1) and prints nothing yet (call A14-UI-11). The invoice is made at «تحصيل»
  and dated that day. An order can be changed until then; once it is «خرج مع المندوب», lines can only go down.
  Each change is a new receipt version («إيصال رقم n من m»), shown on screen.
- **Why it matters:** entering collection before the money is in hand makes the drawer look full when it is not.
- **If you say no:** we add the rule you pick to «تحصيل» or to registration.

### S-10. Delivery orders: discounts, points, controlled items, prepaid (M)

- **Question:** the spec is silent on these. Are Buret's defaults right?
- **Options:** for each line below, keep or change.
- **Buret today:**
  - No discount on a delivery order (call A14-3). Switching an invoice to «توصيل» takes its discounts off and says
    «طلب التوصيل يُسجَّل بدون خصم: أُلغي الخصم من الفاتورة.» (call A14-UI-15).
  - Points are earned at «تحصيل», not at registration. A delivery order cannot use points (call A14-10).
  - Controlled items are refused on a delivery order (call A14-4): the two ticks are done at the counter.
  - A platform order («طلبات», «إنستاشوب») cannot be given to the pharmacy's own courier (call A14-7).
  - No "paid in advance" delivery (call A14-UI-12).
- **Why it matters:** many pharmacies give regular customers a discount on delivery too, and some deliver
  controlled items with the prescription.
- **If you say no:** name the line. Discounts and points on delivery are small changes; controlled items on
  delivery need a pharmacist's rule for the two ticks.

### S-11. Delivery screens (D) (PQ-DFA14-1, PQ-DFA14-2)

- **Question:** a few delivery screen details are not in the design. Are Buret's choices fine?
- **Options:** keep or change, per line.
- **Buret today:**
  - The «−»/«+» on an open order's line are saved together with «حفظ التعديلات», not one by one (call A14-UI-7),
    so five clicks make one receipt version, not five.
  - Filters: «كل الطلبات الجارية», «في الصيدلية», «خرج مع المندوب», «تم التحصيل», «ملغي», with no counts (call
    A14-UI-9).
  - With the filter on «تم التحصيل» or «ملغي», the card still says «الطلبات الجارية» and counts open orders.
  - The collection message also says the points earned, for example «أضيفت للعميل 4 نقاط».
  - «طباعة إيصال جديد» is not built yet (call A14-UI-11); the receipt versions show on screen.
- **Why it matters:** these are the screens the delivery staff use all day; a heading that does not match the
  filter makes them think orders are missing.
- **If you say no:** for example "the heading follows the filter" («الطلبات المحصّلة», «الطلبات الملغاة»).

### S-12. Return window, collections in the drawer, discount above the total (D) (#395)

- **Question:** your answers D6, D11 and D12: the return window is enforced, collections count in the drawer, a
  discount above the total is refused. The prototype still does the old thing. Will it catch up?
- **Options:** the prototype will catch up; it stays and Buret differs on purpose.
- **Buret today:** your answers apply. A delivery invoice's window counts from the collection day (call A14-2).
- **Why it matters:** the expected cash is what the drawer count is checked against. If collections were missing,
  every shift with a collection would show a false surplus.
- **If you say no:** nothing changes in Buret.

### S-13. POS text when the receipt counter is missing or damaged (M) (#279, #280)

- **Question:** if the file that guards receipt numbers is lost or damaged, Buret refuses every sale rather than
  risk printing a receipt number twice. What should the cashier see, and who may do the recovery?
- **Options for the text:** one message for all cases; a message per case. **For the recovery:** support only;
  the owner, from a screen that asks for the last number on each till's paper roll.
- **Buret today:** not in this build. The refusal is built in the app's base, not yet in the Sales build. There
  is no Arabic text for it yet; without one the cashier would see the general "unknown result" message. Recovery is
  a manual step by support.
- **Why it matters:** this is rare (a main PC replaced and restored), but when it happens the pharmacy cannot sell.
- **Proposed meaning of the message (not final copy):** the sale was not recorded; call support.
- **If you say no to "support only":** we build an owner screen for it.

### S-14. Expiry date format (D) (PQ-AFB-1, PQ-DFA15-4)

- **Question:** the design shows «2027-03» in search results, «03/27» in the lines and DD/MM/YYYY in one place.
  Which format?
- **Options:** MM/YY everywhere; YYYY-MM everywhere; as the design.
- **Buret today:** MM/YY everywhere (results, lines, pickers), for example «04/27». Expiry is a month.
- **Why it matters:** one batch should read the same way everywhere on one screen. YYYY-MM is wider and crowds
  1024-pixel-wide screens.
- **If you say no:** we change every expiry text to the format you pick.

### S-15. POS refusals: a message that fades, or a line that stays (D) (PQ-AFB-2, PQ-DFA15-2)

- **Question:** the design shows refusals (cash short, expired item, unknown barcode) as messages that fade.
  Buret shows a red line under the search box that stays until the cause is fixed. Which one?
- **Options:** fading message (design); line that stays (Buret); fading for scans, line for Ctrl+S.
- **Buret today:** the line that stays, for example «المبلغ المستلم أقل من الإجمالي».
- **Why it matters:** a cashier looking at the customer misses a message that fades, and then nothing on screen
  says why Ctrl+S did nothing.
- **If you say no:** refusals become fading messages, or the split you choose.

### S-16. The manager approval dialog (D) (PQ-AFB-3, PQ-DFA15-3)

- **Question:** the design has no manager approval for a discount over the limit. Buret has one. Can Mostafa draw
  it?
- **Options:** keep Buret's dialog and draw it in the next export; put the two fields in the pay column; no
  approval (the manager signs in instead).
- **Buret today:** the line shows «يحتاج موافقة مدير». Ctrl+S opens «موافقة مدير على الخصم» with «اسم المستخدم»,
  «كلمة المرور» and «موافقة وإتمام الفاتورة». The seller stays signed in.
- **Why it matters:** without an approval in place, the seller's open invoices move when a manager signs in.
- **If you say no:** we follow the drawn version.

### S-17. A sale whose result was lost on the way (D) (PQ-AFB-4)

- **Question:** sometimes Ctrl+S is sent but the answer from the main PC is lost. The sale is kept on the till
  until confirmed. How should that look?
- **Options:** (1) the same red line as a refusal, and the invoice cannot be changed; (2) a warning band above the lines, lines dimmed,
  the main button «إعادة المحاولة Ctrl+S»; (3) a dialog that blocks until confirmed.
- **Buret today:** (1), as of the 11-06 comparison. The line says «تعذّر التأكد من إتمام الفاتورة. اضغط Ctrl+S
  لإعادة المحاولة، ولن تُسجَّل مرتين.», the tab cannot be edited or closed, and sign-out is blocked. Our
  recommendation is (2).
- **Why it matters:** with (1) it looks like an ordinary error, though the money may already be in.
- **If you say no:** we build the option you pick; (2) needs a drawn state.

### S-18. «فواتير البيع»: summary line, returns, footer (D) (PQ-AFB-7, PQ-DFA15-11, PQ-DFA15-18)

- **Question:** the design's source file has a summary line; its bundle still draws three number cards. Which is
  right? And two more details below.
- **Options:** summary line; three cards; both.
- **Buret today:**
  - A summary line, for example «3 فواتير | الإجمالي 2,689.05 ج | متوسط الفاتورة 896.35 ج».
  - A partly returned invoice counts at its full total.
  - An opened invoice shows the footer «خصم على الفاتورة: X ج».
- **Why it matters:** the cards take about 100 px of height on a 768 px screen.
- **If you say no:** we follow your choice. Please re-export the bundle so the two design files agree.

### S-19. Drawer dialogs: one button word, and the sign-out question (D) (PQ-AFB-8, PQ-AFB-9, PQ-DFA15-12)

- **Question:** two small differences from the design.
- **Options and Buret today:**
  - After «تم استلام الدرج», the button says «تم»; the design says «متابعة». We recommend «متابعة».
  - The sign-out question «هل ستسلّم الدرج؟» adds the line «لم يُسلَّم درج هذا الجهاز بعد.» and a × that cancels
    the sign-out. The design has neither. We recommend keeping both.
- **Why it matters:** without the ×, a user who pressed sign-out by mistake must sign out or start a handover.
- **If you say no:** we follow the design.

### S-20. A correction of the drawer count: what moves? (M) (PQ-DFA15-17)

- **Question:** after a handover, the count can be corrected (for example 40 → 350). Should the correction change
  the amount left in the drawer («بقي في الدرج») or the amount moved to the safe?
- **Options:** the amount left in the drawer; the amount moved to the safe.
- **Buret today:** the amount left in the drawer moves; the safe amount stays.
- **Why it matters:** the next shift starts with the amount left in the drawer.
- **If you say no:** a correction moves the safe amount instead.

### S-21. What opens after sign-in (M+D) (PQ-AFB-12, PQ-DFA15-1, #532)

- **Question:** after sign-in Buret opens a «الرئيسية» tab that shows only «بيوريت», the version, the build number
  and «حول». The design opens on a new invoice and has no «الرئيسية» tab. What should open?
- **Options:** (1) open on a new invoice for anyone who can sell, no «الرئيسية» tab, version and «حول» moved to
  settings or the account menu; (2) keep a home tab with real content (drawer state, open drafts, shortcuts);
  (3) keep it as now.
- **Buret today:** (3). The «الرئيسية» tab is selected after sign-in; a sale is one more click («+» or Ctrl+N)
  We recommend (1).
- **Also (#532):** the header button «فاتورة جديدة Ctrl+N» is outlined, not filled, because a page has only one
  filled button and on the POS that is «إتمام الفاتورة». Is the outline fine everywhere?
- **Why it matters:** an almost empty tab with a build number is the first thing a pharmacist sees.
- **If you say no:** we build (1) or (2). (2) needs a design.

### S-22. How forgiving should item search be? (M)

- **Question:** a pharmacist types fast and often misses letters. How much should search forgive?
- **How search works in this build (in plain words):**
  - These letters count as the same: أ إ آ ٱ and ا; ى ئ and ي; ؤ and و; ة and ه. Diacritics, tatweel («ـ») and
    invisible marks are ignored. «٣» and «3» are the same. Latin letters ignore upper and lower case.
  - Exact matches need the typed text in one piece, as it appears in the name: words typed in another order, or
    with a word skipped, find nothing.
  - One mistake is forgiven in the whole search (a letter missing, extra or changed, or two neighbouring letters
    swapped). This applies only to words of 3 letters or more, and also against the start of a word in the name.
  - Arabic does not find Latin or the other way round («بانادول» does not find «Panadol»). Other names for an item
    work only where someone entered them on the item.
  - At most 6 results. Order: a scanned box or batch label first, then barcode, then item code, then names that
    start with the text, then names that contain it, then other names, then matches with one mistake. Within each
    group, items that can be sold now come first, then alphabetical order.
  - Matches with a mistake are tried only when fewer than 6 exact matches are found, and never for a search of
    digits only.
  - Example: «بندول» does not find «بانادول» (two letters missing).
- **Options:** (1) also compare with the long vowels ا و ي left out, so «بندول» finds «بانادول»; (2) allow two
  mistakes on words of 6 letters or more; (3) leave it as it is and rely on other names entered on items.
- **Buret today:** as described above.
- **Why it matters:** a search that finds nothing sends the seller to the shelf, or to sell the wrong item. A search
  that forgives too much fills the 6 places with wrong items.
- **Our recommendation:** (1). It costs little and catches most fast typing.
- **If you say no:** we build (2) or leave it (3).

### S-23. Smaller POS calls (D) (PQ-DFA15-5, PQ-DFA15-8, PQ-DFA15-9)

- **Question:** please confirm or change each.
- **Options:** small items, each with its own default (below).
- **Buret today:**
  - With many tabs on 1024-pixel-wide screens, a scroll bar shows under the tabs and the chosen tab can sit half
    off screen.
  - On 1024-pixel-wide screens, the message after a sale covers the tabs and the top of the search while it shows.
  - A number such as «500» lists barcode matches above name matches.
  - With no receipt printer chosen, the message after a sale says «اختر طابعة الإيصال من الإعدادات» and offers no
    "print again" (call A15-fails-2). With a printer that fails, it offers «طباعة الإيصال».
- **Why it matters:** each one slows the seller a little at the counter.
- **If you say no:** name the line and what it should do.

---

## 2. Customers

### C-1. A credit sale over the limit: can a manager approve it? (M) (PQ-DFA15-7)

- **Question:** your PQ-19 answer: credit stops at the credit limit, or when stopped by hand. Today Buret refuses any
  credit sale over the limit, even by one piaster. Should a manager be able to approve one, as with discounts?
- **Options:** (1) refuse, no approval; (2) a manager approves with name and password, recorded; (3) as (2), up to
  a set amount over the limit.
- **Buret today:** (1). The sale is refused with a message that names the limit, the debt and what is available,
  with «الدفع نقدًا» next to it, and «إتمام الفاتورة» is disabled (Omar's call C-4, 2026-10-30).
- **Why it matters:** a regular customer one pound over the limit cannot take their medicine on credit, so staff
  may raise the limit and forget to put it back.
- **If you say no:** we add the approval, using the same dialog as the discount approval (S-16).

### C-2. Over the limit: what the credit panel shows (D) (PQ-DFA3-1)

- **Question:** over the limit, the panel shows «المتاح بعد الفاتورة 0 ج». Is 0 right, or should it show how much is
  missing? And the design's line «لا يتم البيع بالآجل: الفاتورة أكبر من المتاح بـ X ج.» is not used. Do you want it?
- **Options:** keep 0 and the refusal text; show the shortfall («ينقص X ج») or the design's line.
- **Buret today:** 0 (what is available never goes below 0), plus the refusal text with the limit, the debt and the
  available amount (calls A11-UI-2, A11-UI-3). The overdue line shows the overdue amount but not the days of the
  oldest open invoice.
- **Why it matters:** the seller has to work out by hand how much the customer must pay in cash.
- **If you say no:** we show the shortfall, and the oldest open invoice's days if you want them.

### C-3. Part cash, part credit (M)

- **Question:** can one invoice be paid partly in cash and the rest on credit?
- **Options:** no, credit takes the whole total; yes, any split.
- **Buret today:** no (call A11-10). «آجل» takes the whole total.
- **Why it matters:** a customer may pay 100 ج now and put the rest on their account. Today that is two steps: a
  credit sale, then a collection.
- **If you say no:** we allow a split with credit. It touches the payment rules, so Omar signs it off.

### C-4. Credit terms: defaults and words (M+D)

- **Question:** are the default terms and the words right?
- **Options:** keep or change, per line.
- **Buret today:**
  - Credit is set in its own dialog «إعدادات الآجل»: «التعامل بالآجل», «حد الائتمان (ج)», «السداد» with «مدة
    بالأيام» or «تاريخ محدد» (call A11-UI-8). Owner and manager only.
  - A new customer has credit off. The dialog suggests 2,000 ج and 30 days, from the design, marked as not yet
    confirmed (call A11-2).
  - The date is typed as YYYY-MM-DD; a date picker comes later.
  - Credit off reads «موقوف» in the register and «التعامل بالآجل غير مفعّل لهذا العميل» at the POS. The design, and
    Omar's earlier wording call C-11, said «الآجل مقفول».
- **Why it matters:** the limit and days are what most pharmacies leave as they are.
- **If you say no:** give the numbers or the words.

### C-5. No message that a credit sale earns no points (M+D)

- **Question:** on «آجل», the points block says «البيع بالآجل لا يكسب نقاطًا.» only when the customer already holds
  points. A credit customer with no points (for example «حسام فتحي») sees nothing about points. Should the seller
  always be told?
- **Options:** keep as now; always show «البيع بالآجل لا يكسب نقاطًا.» on «آجل» when the customer is registered.
- **Buret today:** shown only when the customer holds points (customers spec 3.5, as drawn). The rule itself is
  Omar's ruling on PQ-25 / D13: no points on credit, points already held can be used.
- **Why it matters:** customers ask why a credit purchase earned nothing.
- **If you say no:** the line shows on every credit sale to a registered customer.

### C-6. Returns of a credit invoice (M) (D4)

- **Question:** your D4 answer: a return of a credit invoice lowers the debt first, and only what was paid comes
  back in cash. Buret does that. Two follow-ups: is it right that cash leaves the drawer when the customer has
  already paid? And what should the printed return receipt say?
- **Options:** for the cash: as built; never cash on a credit invoice return. For the receipt: as now; print
  «خصم من المديونية» (and the cash part, if any).
- **Buret today:**
  - The debt goes down first, up to what the customer owes now; the rest is paid in cash, never more than was
    paid (call A11-1).
  - The returns page says it plainly: «خصم من المديونية», and for example «يُخصم X من مديونية العميل، ولا يُصرف
    شيء من الدرج.» (call SBM-1).
  - «سجل المرتجعات» counts it under «آجل» (call A8-sales-fix-3).
  - But the printed return receipt still says «طريقة الرد: نقدي», because the return is stored as a cash return.
- **Why it matters:** a paper that says "cash" for a return that paid no cash is wrong in the customer's hand and
  in an audit.
- **If you say no:** we print the debt part on the return receipt, and/or stop cash on credit returns.

### C-7. Collections («تحصيل») (M)

- **Question:** are these collection rules right?
- **Options:** keep or change, per line.
- **Buret today:**
  - Each collection gets its own receipt number, «RC-0001», counted per till, not per pharmacy (call A11-3).
  - The collection receipt does not print yet: the print waits until its paper layout is built (call A11-UI-10).
    The money is recorded either way.
  - A collection needs an open drawer on that PC, for every payment method (call A11-5).
  - InstaPay and wallet collections ask for no reference number, as drawn (call A11-UI-11).
  - Paying more than the debt is refused; «كامل المستحق» fills the exact debt.
- **Why it matters:** two tills can each print «RC-0001». A customer paying by InstaPay leaves no reference to
  check later.
- **If you say no:** for example "one RC number series per pharmacy" or "ask «رقم العملية» for InstaPay".

### C-8. Fixing a wrong collection or balance (M)

- **Question:** if a collection is entered by mistake (wrong customer or wrong amount), how is it fixed?
- **Options:** a reversal by the owner or manager, with a reason, recorded; a manual adjustment of the balance; no
  fix in v1.
- **Buret today:** no way to fix it in the screens yet (call A11-11). The records are already able to hold a
  correction, so adding one later changes no past numbers.
- **Why it matters:** a wrong collection leaves the customer's balance wrong, and archiving a customer who
  "owes" is refused.
- **If you say no:** tell us who may correct, and whether a reason is required.

### C-9. Credit screen layout (D) (PQ-DFA3-2, PQ-DFA15-10)

- **Question:** two layout points.
- **Buret today:**
  - With a customer and «آجل», the pay column is taller than a 768-pixel-high screen, so on 1024-pixel-wide
    screens «إتمام الفاتورة» is off screen until you scroll down (the design does the same). Ctrl+S still works.
  - «آجل» with no customer shows a line in the panel, and Ctrl+S shows an alert too.
- **Options:** keep; keep «إتمام الفاتورة» fixed at the bottom of the pay column; show only one of the two messages.
- **Why it matters:** a seller who uses the mouse has to scroll to finish every credit sale.
- **If you say no:** we change it as you pick. A fixed button changes the POS layout, so it needs a drawn version.

### C-10. Points rules: defaults and saving (M+D) (PQ-DFA3-3)

- **Question:** are the default rules right, and should the rules save on a button?
- **Options:** keep or change the numbers; save with «حفظ القواعد» or save as you type.
- **Buret today:**
  - One point per 10 ج paid; 100 points = 10 ج discount; points expire 365 days after they are earned; used in
    steps of 10 («الاستبدال يبدأ من 10 نقاط وبمضاعفات 10.»). These are the design's numbers, not yet confirmed.
  - Rules save with «حفظ القواعد», which stays off until something changes, and the card says «القواعد الافتراضية،
    لم تُحفظ بعد.» until the first save. Each change is recorded with the old and new values.
  - The owner and manager edit the rules; others read them as sentences.
- **Why it matters:** these numbers decide how much discount the pharmacy gives away.
- **If you say no:** give the numbers, or say "save on edit".

### C-11. Points: smaller rules (M) (PQ-DFA15-24)

- **Question:** please confirm or change each.
- **Options:** small items, each with its own default (below).
- **Buret today:**
  - Points are used soonest-expiring first (call A12-4). Using 10 points can show as two rows in the points history
    (−5, −5) when they come from two earnings (O-CU8).
  - A contract sale earns points on what the customer pays, not on the company's share (call A13-14).
  - A returned item takes back the points it earned, rounded down, as you answered (PQ-23).
  - A credit sale shows in the points history only when points are used on it, and that row lacks « · آجل» (a
    known gap, to be fixed).
- **Why it matters:** the points history is what staff show a customer who asks where their points went.
- **If you say no:** for example "one row per use of points".

### C-12. Contracts: a discount or price per item (M) (PQ-A13-1)

- **Question:** insurance and contract companies often give different discounts on different items. The design has
  only two rates (local and imported) plus category filters. Do you need a rate or price per item?
- **Options:** (1) a list of items on the contract with their own discount or contract price, the origin rate for
  the rest; (2) a rate per category; (3) origin rates only in v1.
- **Buret today:** (3). Not built.
- **Why it matters:** with (3), item deals are given by hand at the POS or not at all.
- **If you say no:** our recommendation is (1), added after v1. It adds to contracts and changes no past claim.

### C-13. Contracts: a minimum the customer pays, or a cap on the company's share (M) (PQ-A13-2)

- **Question:** do your contracts have a fixed minimum the customer pays per invoice, or a monthly or per-invoice cap
  on what the company pays?
- **Options:** neither in v1; a minimum; a cap; both.
- **Buret today:** neither. Not built.
- **Why it matters:** without them, the company may be charged more than the contract allows.
- **If you say no:** tell us the rule and we add it.

### C-14. Contracts: the customer's share on credit (M) (PQ-A13-3)

- **Question:** on a contract sale, can the customer's own share go on their credit account?
- **Options:** refused; allowed.
- **Buret today:** refused with «لا يُباع بالآجل على تعاقد أو تأمين.».
- **Why it matters:** company employees often buy on both a contract and an account.
- **If you say no:** the share can go on credit, within the customer's limit.

### C-15. Contracts on delivery orders (M) (PQ-A13-4)

- **Question:** can a delivery order use the customer's contract or insurance?
- **Options:** no; yes.
- **Buret today:** no. Switching an invoice to «توصيل» takes the contract off with the other discounts and says so
  (call A13-UI-10).
- **Why it matters:** insured customers who order by phone pay the full price, or must come to the counter.
- **If you say no:** we add contracts to delivery orders. «تحصيل» would then collect only the customer's share.

### C-16. Where an item's origin (local / imported) comes from (M) (A13-4)

- **Question:** contract rates depend on whether an item is local or imported. An item with no origin is not
  covered («غير مشمول»), as Omar agreed. How should origin be filled?
- **Options:** (1) from B-Connect at import, then the item card for the rest; (2) also a screen that sets origin
  for many items at once; (3) the item card only.
- **Buret today:** (1) is planned; the import itself is not in this build. This build's item list is loaded with
  the same reading of B-Connect's origin: «محلى», «مصنع محلى» and «إستثمارى» count as local, «مستورد» and «مستورد
  خاص» as imported, «أخرى» or blank as none. So all the real items here have one (3,970 local, 346 imported). The
  invented demo items have none, so they are «غير مشمول».
- **Why it matters:** an item with no origin gets no contract discount, so a gap here shows at the POS as an
  insured customer paying full price.
- **What we need from you:** is «إستثمارى» local for your contracts? Is «أخرى» right as "not covered"?
- **If you say no:** we change the mapping, or add the bulk screen (2).

### C-17. Contracts: smaller calls (M)

- **Question:** please confirm or change each.
- **Options:** small items, each with its own default (below).
- **Buret today:**
  - When a contract names categories, an item with no category is not covered (call A13-5).
  - The contract is linked from «تعديل عميل» only, not when the customer is first added (call A13-UI-8).
  - The monthly claim statement shows on screen; «طباعة الكشف» is not built yet (call A13-UI-6).
  - Recording what the company paid is left to the Accounts module (call A13-12).
  - Contracts are managed by the owner and the manager; any seller can apply one at the POS (call A13-16).
- **Why it matters:** a customer added at the counter gets no contract discount until a manager edits them.
- **If you say no:** name the line.

### C-18. No «كود العميل» on the new-customer form (M+D)

- **Question:** the spec puts a suggested, editable «كود العميل» on «إضافة عميل». The new form has none; the code is
  given automatically and can be changed later on «تعديل عميل». Is that fine?
- **Options:** keep (automatic code, edit later); show the next code on the new form and let it be changed.
- **Buret today:** automatic: the next number, starting at 1000. The edit form shows and edits it; a code already in
  use is refused with «الكود مستخدم لعميل آخر.». Customers can be found by code at the POS.
- **Why it matters:** the design notes say some pharmacies give customers a short code on the phone. They want to
  set it when the customer is added.
- **If you say no:** the new form gets «كود العميل», filled with the next number.

### C-19. Delivery addresses (M)

- **Question:** who may add and change a customer's addresses?
- **Options:** as built; only the owner and manager add addresses; every seller can also edit.
- **Buret today:**
  - A customer can have several addresses; a sale uses one, and the invoice keeps that address's text.
  - Any seller can add a customer and add an address, at the POS too. Changing, removing or choosing the default
    address is for the owner and the manager.
  - Quick registration under in-house «توصيل» requires an address: «العنوان مطلوب للتوصيل» (call A15-fails-3). For
    a platform order the address stays optional.
  - The address field takes two lines on screen, but is saved as one line (call DFA15-9).
- **Why it matters:** addresses are what the courier reads; a wrong one sends him to the wrong door.
- **If you say no:** name the rule.

### C-20. Deleting a customer is archiving (M+D) (D9, O-CU11, PQ-DFA15-20)

- **Question:** your D9 answer: no delete while the customer owes; otherwise delete with a confirmation. Buret
  archives instead of deleting, so history and balances stay. Is that fine?
- **Options:** archive (as built); a true delete when the customer has no invoices at all.
- **Buret today:**
  - «أرشفة» with the question «أرشفة <name>؟». Refused while the customer owes: «لا يمكن أرشفة عميل عليه مستحقات.
    حصّل المستحق أولًا.».
  - Archived customers are under «المؤرشفون» with «استرجاع». Their points stay, and still expire on their dates.
  - A new customer may reuse an archived customer's phone. Then restoring the old one is refused with «الرقم مسجل
    لعميل آخر.».
- **Why it matters:** a deleted customer would leave invoices and points with no owner.
- **Phone reuse:** the default is that a new customer may reuse an archived customer's phone (O-CU11). Please
  confirm or change it.
- **If you say no:** say which part, for example "an archived phone stays reserved".

### C-21. Who sees and edits what (M) (#275)

- **Question:** the customer permissions follow the design's matrix, which has no rows for them. Please confirm.
- **Options:** confirm; mark what to change.
- **Buret today (owner and manager hold everything):**
  - Pharmacist and cashier can: open the register, add a customer and an address, sell on credit, use points and
    contracts at the POS, collect, and open «الحسابات الآجلة» and «كشف الحساب» (call A11-4).
  - Pharmacist and cashier cannot: edit or archive a customer, change credit terms, open «سجل العميل» or the
    «النقاط» page, edit points rules, manage contracts.
- **Why it matters:** a pharmacist cannot look up what a regular customer bought last time, which they are often
  asked.
- **If you say no:** for example "pharmacists see customer history". It is a small change.

### C-22. Invoices sent to the cashier: credit, points, contracts (M)

- **Question:** when a pharmacist sends an invoice to the cashier («إرسال للكاشير»), what should travel with it?
- **Options:** for each of credit, using points and contract: travels; does not.
- **Buret today:** the customer travels, and the points it will earn show to the cashier. But the cashier cannot
  take it on credit (call A8-UI-9-M1), the invoice cannot use points (call A12-M5), and a PC without a drawer
  shows no contract (call A13-UI-9).
- **Why it matters:** in a pharmacy where the pharmacist never takes money, a credit, points or contract sale must
  be done at the cashier's PC from the start.
- **If you say no:** we make the ones you name travel. Each is a change to how a sent invoice is stored.

### C-23. Smaller customer screen calls (D) (PQ-DFA15-21)

- **Question:** please confirm or change each.
- **Options:** small items, each with its own default (below).
- **Buret today:**
  - The register has no «الزيارات» column yet; nothing counts visits (call DFA14-5).
  - In an empty «سجل العميل», «فاتورة جديدة» opens a new invoice without the customer (call A15-fails-4).
  - The POS quick add says «لا يوجد عميل مطابق», «إضافة عميل جديد «…»» and «عميل جديد — تسجيل سريع». The spec's
    words are different («الرقم … غير مسجل. يمكنك إضافته عميلًا جديدًا.»).
  - «حفظ» on the customer form is off until every field is valid (call DFA15-10).
  - After a customer is chosen at the POS, the cursor goes back to the item search (call DFA15-6).
- **Why it matters:** these are the screens staff use to register and find regular customers.
- **If you say no:** name the line.

### C-24. Credit returns, points on returns, deleting a customer: the prototype (D) (#396)

- **Question:** your answers D4, PQ-22, PQ-23, D14 and D9. The 11-04 prototype still offers «رصيد للعميل», has no
  debt-first rule, does not take points back, and its delete warns only about lost points. Will it catch up?
- **Options:** the prototype will catch up; it stays and Buret differs on purpose.
- **Buret today:** your answers apply (no store credit, PQ-22).
- **Why it matters:** staff trained on the prototype will look for a «رصيد للعميل» button Buret does not have.
- **If you say no:** nothing changes in Buret. We note the prototype as out of date for these screens.

### C-25. Moving customers and their balances from B-Connect (M) (PQ-31)

- **Question:** you deferred PQ-31. Do we bring a pharmacy's customers and what they owe from B-Connect?
- **Options:** customers and one opening balance each, dated on the move day; customers only; nothing.
- **Buret today:** the import is being built and tested on a copy only. It stays off until you decide (Omar's
  ruling, 2026-11-04). This build's customers are invented.
- **Why it matters:** a pharmacy with many credit customers cannot start without their balances.
- **If you say no:** we turn on the part you choose.

---

## Decided since your last answers (tell us if any is wrong)

- **PQ-1 sign-in (Omar, 2026-11-06):** imported staff keep their B-Connect passwords. The owner sets a password for
  anyone whose password could not be carried. This replaces "a new password at first sign-in".
- **PQ-25 / D13 (Omar, 2026-11-04):** a credit sale earns no points; points already held can be used.
- **PQ-17 (your answer, 2026-11-03; applied by Omar, 2026-11-07):** the drawer handover is refused while the giver
  has an invoice with lines.
- **Handover signs the receiver in (Omar, 2026-11-09, next build):** a finished «تسليم الدرج» signs the giver out
  and the receiver in.
- **Open boxes, #482 (Omar, 2026-11-06):** one open box per batch; «علبة جديدة» is off while one is open (see S-5).
- **Return window (Omar, 2026-10-31):** counts from the invoice date. (Builder's call A14-2: a delivery invoice's
  date is its collection day.)
- **Points expiry (Omar, 2026-11-07):** the daily expiry is posted by the system user «النظام». A manual run posts
  as the user who runs it.
- **Credit over the limit (Omar, 2026-10-30, C-4):** refused, no approval (asked again in C-1).
- **Contracts (Omar, 2026-11-07):**
  - The company's share is a claim on the company, not a payment method.
  - The invoice total is after the contract discount; the claim pays the company's share.
  - No line may go below zero.
  - An item with no origin is not covered («غير مشمول»).
  - A partial return splits each amount the same way as the sale, so a full return gives back exactly what was
    charged.
  - A return refunds the customer only their own share.
