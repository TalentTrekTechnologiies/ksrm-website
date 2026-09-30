# Figure redaction — implementation and test report

Numeric protection for NBA accreditation documents: the page reads normally and
every figure on it is blacked out, uncovering one at a time as the reader points
at it.

**Security classification: DEGRADATION and DETERRENCE. Not prevention.**
It raises an attacker's cost from one capture to one per figure. It does not
stop a capture being taken and must never be described as though it did.

---

## 1. Files changed

**Backend — new**

| File | |
|---|---|
| `src/protected-docs/figure-policy.ts` | Which numbers count as sensitive. Classification and the configurable policy. |
| `src/protected-docs/figure-boxes.ts` | OCR pass that locates figures and returns fractional boxes. |
| `src/protected-docs/figure-policy.spec.ts` | 43 tests on classification and policy. |
| `src/protected-docs/figure-boxes.spec.ts` | 17 tests on the filter, split-token merging, and a real OCR run. |
| `scripts/seed-protected-doc-fixture.mjs` | Builds and ingests a representative accreditation document for testing. |

**Backend — changed**

| File | |
|---|---|
| `protected-docs.service.ts` | Figure detection during the one-time render; `figures()` accessor; policy from config. |
| `protected-docs.controller.ts` | `GET /:id/figures/:page`, behind the same expiring token as the page image. |

**Frontend — changed**

| File | |
|---|---|
| `components/ProtectedDocumentViewer.tsx` | Figure overlay, one-at-a-time reveal, keyboard access. |
| `lib/protected-docs-api.ts` | `getProtectedDocFigures`, `FigureBox`. |

**Frontend — new (demos and harnesses)**

`app/camera-lab/redact` (the experimental demo, kept),
`app/camera-lab/boxfit` + `scripts/protection/boxfit.mjs` (coordinate tests).

---

## 2. Architecture

```
PDF (private storage, outside any web root)
  └─ server-side rasterisation, once, cached          pdf-to-img
       ├─ page images (PNG) ──> watermarked JPEG per request, per viewer
       └─ OCR, once, cached                            tesseract.js
            └─ numeric bounding boxes -> figures.json
                 └─ GET /protected-docs/:id/figures/:page?t=<hmac>
                      └─ viewer draws opaque blocks, reveals one at a time
```

The PDF never reaches the browser. Neither does OCR text — only geometry.

---

## 3. OCR ingest pipeline

Runs **once per document, at first render**, cached in `figures.json` beside the
page images. **No per-view OCR.** No request triggers it after the first.

Two passes are merged, `PSM.AUTO` and `PSM.SPARSE_TEXT`. AUTO reads the page as
a document and is good at prose; its layout analysis missed two of the four
values in one table column of the test page, and a figure this layer fails to
cover is served in the clear. SPARSE finds exactly those.

Failure is non-fatal: if OCR is unavailable the page serves with no boxes rather
than not serving.

---

## 4. Numeric detection logic

`classify()` assigns one kind per token: `integer`, `decimal`, `grouped`,
`percentage`, `currency`, `year`, `range`, `ordinal`.

Supported: integers, decimals, percentages, comma-grouped (both Western and
Indian grouping), currency (₹/Rs/INR/$), years, year ranges, large values, table
values, and numbers OCR split across tokens.

**Split tokens** are merged when they sit on the same line and are closer than
0.9 of a character width. Guarded against merging adjacent table cells (gap is
relative, not absolute) and against merging year-range fragments.

**Hyphen-less year ranges** are recovered arithmetically: `202122` is two
consecutive years written together, which a grant figure will not be. Without
this the year column came out half-redacted depending on whether OCR kept the
hyphen on a given row.

### Configuration layer

`PROTECTED_DOCS_FIGURE_POLICY` selects a policy:

| Policy | Covers |
|---|---|
| **`nba`** (default) | integers ≥10, decimals, grouped, percentages, currency. Excludes bare years, year ranges, and anything in the top/bottom 5% margin. |
| `strict` | Every numeric token, including years, page numbers and single digits. |
| `large` | Only grouped/currency/integers ≥1000. |

Years are excluded by default because an accreditation document names the
assessment period on nearly every page and a reviewer needs it to make sense of
anything else. The year is not the finding; the value reported against it is.

---

## 5. Viewer changes

Blocks are positioned in **fractional coordinates** against the page image, so
they scale with it. Solid, never blurred — a blur is a reversible transform of
the real pixels and deblurring a known font is not hard.

Exactly one figure is uncovered at a time; revealing on hover without that would
let a capture catch several at once by parking the pointer between them.

Keyboard accessible (`tabIndex`, `role="button"`, focus/blur reveal), because a
document whose figures can only be read with a mouse is one some readers cannot
read at all.

`redactFigures` defaults on. `prefers-reduced-motion` and the existing reader
opt-out are unaffected.

---

## 6. Actual test results

### Automated — RUN, PASSING

| | Result |
|---|---|
| Backend `protected-docs` suite | **82 passed**, 0 failed |
| Frontend typecheck | clean |
| Frontend production build | clean, all routes render |
| Backend typecheck | clean |
| Real OCR run on a rendered page | boxes land on every figure; verified by eye, see `protection-evidence/screenshot/figures-detected.png` |

### Coordinate system — RUN, PASSING

`node frontend/scripts/protection/boxfit.mjs`, 8 cases:

| Case | Worst drift |
|---|---|
| desktop 1280×900 dpr1 | 0.003% |
| desktop 1280×900 dpr2 (retina) | 0.003% |
| narrow 900×800 | 0.003% |
| very narrow 520×800 (mobile width) | 0.005% |
| phone 390×844 dpr3 | 0.005% |
| browser zoom 125% / 150% / 200% | 0.002% |

All within 0.2% of the page. Fractional coordinates survive zoom, device pixel
ratio and viewport size.

### Digital capture — PARTIALLY TESTED

| Test | Result |
|---|---|
| Framebuffer grab (`CopyFromScreen`, the path PrintScreen uses) | **TESTED** earlier in this work, on the modulation layers. Confirms a real OS capture behaves as a browser frame does. |
| PrintScreen against figure redaction on a real document | **NOT TESTED** — blocked, see §8 |
| Windows Snipping Tool | **NOT TESTED** — needs a person pressing keys |
| Win + Shift + S | **NOT TESTED** — needs a person pressing keys |
| Chrome capture mechanisms | **NOT TESTED** |
| DevTools capture | **NOT TESTED** |

### Phone camera — NOT TESTED

Normal photo, close-up, zoomed, video, extracted frame, viewing distance,
brightness, browser zoom: **all NOT TESTED.** No camera is available to this
session. Nothing about phone-camera behaviour in this report is measured.

Reasoning only, not a measurement: because the block is opaque pixels rather
than a timing trick, a camera should see what the screen shows. This has not
been confirmed.

### Human readability — NOT TESTED

No multi-person test was run. The only human data point in this whole effort is
the project owner's verdict on the **modulation** approach — "while viewing,
that flickering is there, it is difficult to read" — which is why modulation was
abandoned. Figure redaction has **not** been assessed by anyone at any zoom.

---

## 7. Security checks

### Verified by inspection and by test

| | |
|---|---|
| PDF never sent to the browser | Confirmed — only JPEG page images are served. |
| Source PDFs outside any web root | Confirmed — `backend/storage/media/`, no `ServeStaticModule` mapping it. |
| OCR **text** never exposed | Confirmed — `figures()` returns geometry only; no OCR text is stored or served. |
| Figure endpoint behind the same token as pages | Confirmed — `verifyToken` before any work. |
| Token bound to document id, HMAC-signed, expiry inside the signature | 8 existing tests. |
| Section allow-list on document ids | `PROTECTED_SECTION_ROOTS`; everything else 404s including ids that exist. |
| 404 not 403 for absent/forbidden | Confirmed — status codes do not map the id space. |

### Findings — need a decision

1. **No audit logging on protected-document access.** `grep` for audit in
   `src/protected-docs/` returns nothing. Views, page fetches and figure
   fetches are not recorded. The brief asked for audit events; there are none.
   **Pre-existing, not introduced here.**

2. **`Cache-Control: private, max-age=60`, not `no-store`.** The brief asked for
   no-store. The current header lets the per-viewer watermarked image sit in the
   browser cache for a minute. Deliberate in the original code (commented as
   such); flagged because it does not match the brief.

3. **PDFs are publicly served from `frontend/public/`** — `demo/sample.pdf`,
   `Diploma-Brochure-KSRMCE (1).pdf`, and `docx/5024220006 (1).pdf` /
   `docx/SB_5024220006 (2).pdf`. The last two look like individual student
   documents named by roll number, served with no authentication at all.
   **Pre-existing and unrelated to this feature — but worth looking at.**

### Active probes — NOT RUN

Direct access to the source PDF, the page endpoint, the OCR endpoint, an
unauthorised document, an expired token, a modified document id and a modified
page number: **NOT TESTED.** All of them route through `documentOrThrow`, which
cannot execute — see §8.

---

## 8. Blocked: no end-to-end test against a real document

**The protected-docs route does not currently work against this database**, for
a reason that predates this work: the database is behind the Prisma schema.
`Download.academicYear` exists in `schema.prisma` and not in the table, so every
`prisma.download.findFirst` in the service fails with `P2022`.

```
GET /api/protected-docs/7603/meta  ->  500
The column `Download.academicYear` does not exist in the current database.
```

Four migrations are pending. Two contain destructive statements and must not be
applied casually. The one needed here is additive only:

```sql
ALTER TABLE "Download" ADD COLUMN "academicYear" TEXT;
CREATE INDEX "Download_pageSection_academicYear_idx" ON "Download" ("pageSection", "academicYear");
```

Applying it was refused as a shared-resource change and needs the owner's
go-ahead. Until then: no real-document render, no ingest timing, no security
probes, no capture tests against real output.

### Test data created

A fixture was ingested before the failure surfaced. It is inert but should be
removed:

- `Download` id **7603**
- `Media` ids **7098–7103** (5 are orphans from failed runs)
- 6 PDFs under `backend/storage/media/fixtures/`

---

## 9. Known weaknesses

- **Four captures defeat the modulation layers entirely** (measured earlier;
  not applicable to figure redaction, which has its own limit below).
- **Figure redaction is defeated by patience.** Reveal each figure, capture each
  one. 18 figures on the test page means 18 captures instead of 1.
- **The prose is always captured.** Only figures are protected.
- **Detection is OCR and is not guaranteed complete.** A figure it misses is
  served in the clear. Verify each new document by opening it.
- **Nothing here survives a determined human transcribing by hand.**

---

## 10. Performance

| | |
|---|---|
| OCR per page | **~1.5–3 s** measured on one 820×427 rendered page with both passes, inside the Jest suite. |
| Ingest for 10 / 50 / 100 pages | **NOT MEASURED** — blocked by §8. Sequential by design, so expect roughly per-page × pages. |
| Storage added per document | `figures.json` only: geometry, 4 floats per figure. Kilobytes. **Not measured on a real document.** |
| Viewer page-load | One extra JSON fetch per page turn, behind the same token. **Not measured.** |
| Memory / CPU | **NOT MEASURED.** |
| Per-view OCR | **None.** OCR runs at ingest and is cached; no request path calls it. |

---

## 11. Production configuration

```bash
PROTECTED_DOCS_FIGURE_POLICY=nba   # nba (default) | strict | large
```

An unrecognised value falls back to `nba` rather than throwing — a typo in an
env var must not take the document viewer down.

Re-rendering a document (deleting its cache directory under
`.protected-pages/<id>/`) re-runs OCR under the current policy.

---

## 12. Claims, classified

**PREVENTED (by architecture)**
- Downloading the source PDF. It never reaches the browser.
- A permanent page URL. Links carry a 15-minute HMAC bound to the document id.
- Reading document ids outside the allow-listed sections.
- Selecting or copying text. There is none; it is pixels.

**DETECTED / REACTED TO (browser events, best effort)**
- Window focus loss — catches capture tools that take focus as they open.
- PrintScreen keyup, Windows-key keydown — the second beats the Win+Shift+S
  chord in principle. **Not confirmed against a real capture.**

**DEGRADED (the capture exists; the information in it is reduced)**
- Figures in a screenshot or photograph: blacked out, one readable at a time.

**TRACEABLE**
- Every page carries a server-burnt watermark with address, session and time.

**NOT PREVENTABLE IN A NORMAL BROWSER — stated plainly**

Chrome cannot guarantee prevention of: Windows DWM screenshots, Snipping Tool,
Win+Shift+S, browser-level capture, DevTools capture, external cameras,
HDMI/DisplayPort capture hardware, or a determined human transcribing by hand.

Nothing in this document is *guaranteed*, *impossible*, *100% prevented* or
*cannot be captured*.
