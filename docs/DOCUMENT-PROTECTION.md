# Protected documents — what is actually enforced

For `ProtectedDocumentViewer`, used by NBA documents. Written so nobody has to
guess later which parts are controls and which are friction, and so the college
is never told something is prevented when it is only discouraged.

> **Watermarks removed (2026-09-30), at the college's request.** Neither the
> burned-in server watermark nor the moving on-screen one is applied to NBA
> documents any more. Everything below that describes a watermark, or tracing
> a leaked capture back to a viewer, no longer applies: a screenshot or photo
> of a page now carries nothing that identifies who took it. What remains is
> page images only (no PDF sent), no download or text copy, and page links
> that expire after 15 minutes.

## Architecture

```
Next.js page
  └─ ProtectedDocumentViewer          layers 3-6, configurable
       └─ page images (JPEG)          one page at a time
            └─ GET /api/protected-docs/:id/page/:n?t=…
                 └─ signed 15-minute token, bound to the document
                      └─ NestJS rasterises + burns the watermark
                           └─ storage adapter
                                └─ file outside the web root
```

## Actually blocked

| | How |
|---|---|
| **Downloading the document** | The PDF never leaves the server. The browser receives flattened JPEGs. There is no document on the device to save. |
| **A permanent file URL** | Page links carry a 15-minute HMAC token bound to the document id. A URL copied from the network tab stops working, and one document's token opens no other. |
| **Walking the id space** | Only pages whose section is on a short allow-list are served at all. Everything else 404s, including ids that exist. |
| **Copying the text** | There is no text. It is pixels. |
| **Printing** | Print styles blank the viewer. |
| **The original file, by its media URL** | `/media/file/:id/...` 404s for any media used by a download in a protected section, deleted or inactive rows included. Added 2026-10-05 — before it, the original PDF was publicly downloadable at a sequential id. |
| **The original file, from the document list** | Public `GET /downloads` lists a protected document only when its own section is asked for, and always with `fileUrl: ""` and `mediaId: null`. Added 2026-10-05 — before it, the list beside the viewer carried a direct link to every PDF. |

**Which sections are protected** is decided in one place,
`backend/src/protected-docs/protected-sections.ts`: a section whose part before
the first dot is `nba`. `nba-certificates` (the NBA Certifications block) uses a
dash on purpose — those PDFs are published openly.

Verified in a browser: 14 of 14 checks — image not PDF, token present, content-type
`image/jpeg`, right-click / copy / drag / selection blocked, Ctrl+P, Ctrl+S,
Ctrl+C swallowed, no download or print button, hidden on blur, restored on focus.

Token behaviour is covered by six tests: a token for one document is refused
for another, an edited signature is refused, a pushed-out expiry is refused
(the expiry is inside the signature), and an expired token is refused.

## Degraded, not blocked

| | Reality |
|---|---|
| **Screenshots** | The capture cannot be blocked - it happens in the OS - but what it captures is now unusable. At `protectionLevel="screenshot"` a single capture keeps **2-6% of the words and none of the figures**, and is destroyed to a person and not only to OCR. Four captures averaged recover the document, and a screen recording does it for free. The page also hides on blur, which catches the tools that take focus as they open. |
| **Right-click, copy, drag, shortcuts** | Enforced through events, so devtools walks past all of it. Friction. |
| **Temporal modulation (overlay)** | Weaker than it measures. An overlay modulates the PAPER and leaves glyph shapes intact, so it wrecks OCR and a person reads the capture without difficulty - 67% measured word loss on an image every word of which was legible. It is a finisher, not the control. See [PROTECTION-REPORT.md](PROTECTION-REPORT.md) section 2. |
| **Content masking** | The layer that actually hides the page. Two copies of the page carry complementary masks and one shows per frame, so a capture is missing half of every glyph rather than textured over it. Costs about half the reader's contrast. Still defeated by averaging four captures. |
| **Phone photographs** | Not preventable by anything. A camera records what a person can see. |

## Capture response (experimental)

The viewer reacts to the browser events that sometimes accompany a capture:
PrintScreen `keydown` and `keyup`, `window.blur`, and `visibilitychange`.

`protectionResponse` decides what reacting looks like:

| Mode | Effect |
|---|---|
| `hide` | Opaque "Protected content" cover. Nothing of the document remains. |
| `obscure` | CSS blur and darkening on the page image, watermark still legible over it. |
| `watermark` | Document stays; overlay amplitude and watermark opacity are turned up hard. |

`captureProtection`, `captureHoldMs`, `captureAmplitude` and
`captureWatermarkOpacity` are all configurable. Every event is reported with
the time it took to repaint, and `/screenshot-lab` lists them live.

These are CSS filters on the element. **Nothing here touches physical display
brightness**, and nothing in a browser can.

### The number that decides it

Measured on the running viewer: **22.0 ms** from a PrintScreen `keydown` to
the response being painted, **22.6 ms** from `keyup`, **25.3 ms** from `blur`.
That is one and a half frames at 60Hz, and it is as fast as a web page gets -
the response is read from a ref inside the animation loop rather than through
a re-render, so it reaches the very next frame.

Whether one and a half frames is fast enough is a property of each capture
method, not of the page:

| Method | Event reaches the page? | Expected outcome |
|---|---|---|
| PrintScreen | `keyup`, usually not `keydown` | **Not disrupted.** Windows grabs the framebuffer on the keypress and tells the page afterwards. The response protects the *next* capture. |
| Win + Shift + S | `blur`, after the fact | **Not disrupted.** The snip overlay freezes an image of the screen the moment it is invoked; the blur arrives after that freeze. |
| Snipping Tool (app) | `blur`, on the app taking focus | **Plausibly disrupted.** Seconds pass between the app opening and the user dragging a rectangle, so 22 ms is ample. |
| Browser / devtools capture | none | **Not disrupted.** Rendered from the page by the browser itself. |
| Screenshot extension | none | **Not disrupted.** `captureVisibleTab` never touches the page. |

**This table is a prediction, not a result.** It follows from how each method
is documented to work and from the measured latency; it has not been confirmed
with real OS captures, because that needs a person at the deployment machine
pressing the keys. `/screenshot-lab` exists to record it: take a real capture,
check whether a row appeared in the event log, then score the captured file by
OCR.

Expect roughly one method in five to be disruptable. That is worth having and
is not worth describing to anyone as screenshot prevention.

## What a browser cannot control

- **OS-level screen capture.** No API exists. `FLAG_SECURE` is Android-native only.
- **Rendering faster than the display refreshes.** 60Hz is the ceiling on the
  modulation, which is why the effect is weak; commercial anti-camera displays
  modulate at 120–240Hz in hardware.
- **Whether a phone stacks exposures.** HDR, night mode and video all average
  several frames, which is exactly the operation that makes the page readable
  to a person. The mechanism cannot tell them apart.
- **A camera pointed at the screen.**

## What ships: figure redaction

**The page reads completely normally, and every figure on it is blacked out,
revealing one at a time as the reader points at it.** A screenshot therefore
carries a whole-looking document with a single readable number in it.

No flicker, no covered page, no contrast loss, sharp at any zoom, works in
Chrome with nothing installed.

### Why figures rather than the page

From the OCR work in [PROTECTION-REPORT.md](PROTECTION-REPORT.md): prose
survives damage and figures do not, because context and a dictionary repair a
mangled word and nothing repairs `4617500`. The same asymmetry applies to a
person reading a leaked screenshot.

An accreditation submission is prose *about* numbers. The prose is largely
boilerplate; the numbers are the finding. So covering ~3% of the page protects
most of what is worth protecting, where the reading band covered 66% to protect
all of it and the modulation degraded the whole page to protect some of it.

### How it works

| | |
|---|---|
| **At upload** | Each rendered page is OCR'd once and every numeric token's box is stored in `figures.json` beside the page images. Cached with the render, so no reader ever waits for OCR. |
| **Serving** | `GET /protected-docs/:id/figures/:page` returns the boxes, behind the same expiring token as the page image. **Positions only — never values.** The numbers stay in the page pixels. |
| **In the viewer** | Opaque blocks are positioned in fractional coordinates over the page image. Hover or keyboard focus uncovers exactly one at a time. |

Two OCR passes are merged, `AUTO` and `SPARSE_TEXT`. AUTO reads the page as a
document and routinely misses a short number alone in a table cell - it lost
two of four values in one column of the test page, and a figure this layer
fails to cover is served in the clear. SPARSE finds exactly those.

Blocks are **solid, never blurred**: a blur is a reversible transform of the
real pixels and deblurring a known font is not hard.

### What it is worth, honestly

- It raises the cost from **one capture to one per figure** — 18 on the test
  page. That is a large increase and it is not a wall. Someone patient gets
  every number.
- **The prose is still captured.** Only figures are protected.
- It is the only layer here that is **indifferent to how the capture was
  made**, so unlike everything else it applies to a phone photograph too.
- Detection is OCR, so it is not guaranteed complete on every document. Verify
  a new document by opening it; anything missed is served in the clear.

Reproduce the detection on a page image:

```bash
cd backend
FIGURE_FIXTURE=../docs/protection-evidence/screenshot/clean.png FIGURE_DEBUG=../docs/protection-evidence/screenshot/figures-detected.png npx jest figure-boxes
```

`figures-detected.png` draws the boxes onto the page. **Look at it** — every
assertion in the suite passed while the boxes sat below and to the right of
every number, leaving all of them readable, because they were normalised
against the extent of the detected text rather than the page. Numbers could
not catch that and one glance did.

`/camera-lab/redact` is the same idea on the fixture, without the backend.

## The one thing that would empty a screenshot entirely — CONFIRMED WORKING

**Requirement**: the page reads normally, and a screenshot of it carries nothing.

**No browser can do this.** Not as a limitation to work around - the page is
told about a capture after Windows has already taken the pixels (measured:
22 ms to repaint, and PrintScreen reports on keyup). Every in-browser approach
in this document instead degrades what the capture contains, and each was
tried and rejected by a reader: the modulation flickered and was hard to read,
the reading band covered most of the page.

**A native window can do it, and it was verified on a real machine.**
`SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)` tells the Desktop
Window Manager to omit the window from any capture of the screen.

Proof taken during the session: a WinForms window at a known position, restored
and foregrounded (`IsIconic` false), holding the fixture document. A full-screen
`CopyFromScreen` of exactly that region returned **the windows behind it**. The
document was on screen and absent from the capture. The reader then confirmed
it independently with PrintScreen.

Because the compositor enforces it, it covers PrintScreen, Snipping Tool,
Win+Shift+S, screen recorders and any capture API at once - not only the routes
a page gets warning of.

`scripts/protection/protected-window.ps1` reproduces it in isolation.

### Shipping it

The document backend does not change - expiring tokens, server-side
rasterisation and the burnt-in watermark all stay. Only the window changes:

| | |
|---|---|
| **Electron viewer** | `win.setContentProtection(true)` is the same flag, one line, and maps to `NSWindow.sharingType = .none` on macOS. Loads the existing viewer URL. |
| **Cost** | Readers install a small desktop app instead of opening a browser tab. That is the whole trade, and it is a product decision rather than a technical one. |
| **Windows support** | `WDA_EXCLUDEFROMCAPTURE` needs Windows 10 2004+. Older builds fall back to `WDA_MONITOR`, which renders the window black in captures - equally effective here. |

**Still not covered**: a phone camera pointed at the screen. Nothing in software
reaches that, which is why the watermark stays.

## What would need a native application

- **Screenshot blocking on Android** — `FLAG_SECURE` on the window. Blocks the
  screenshot and the recent-apps thumbnail. Android only, native only.
- **Screenshot blocking on Windows** — `SetWindowDisplayAffinity` with
  `WDA_EXCLUDEFROMCAPTURE`. Desktop app only.
- **DRM-protected video** (Widevine/FairPlay) is the one web technique that
  genuinely blackens a screenshot — and it applies to a `<video>` element, not
  to documents. Using it would mean encoding each document as an encrypted
  stream, paying for a licence service, and giving reviewers a document they
  cannot zoom or scroll. Priced separately if it is ever wanted.

## The layer to actually rely on

The watermark. Burned into the page image by the server, and drawn again over
the top client-side, drifting. It carries the address, a session id and the
time. A screenshot carries it. An HDR photograph carries it. A video frame
carries it. A phone photo of the screen carries it.

It is legible to a person and not to OCR, which is the right way round: it
exists so a leaked page names its source, not so a machine can index it.

So the honest position to give the college is **not** "this cannot be copied"
— it is **"every copy identifies who made it"**.

## Configuration

```tsx
<ProtectedDocumentViewer
  documentId={id}
  title={title}
  onClose={close}
  screenshotProtection          // default true; false leaves layers 1-2 only
  protectionLevel="screenshot"  // standard | strong | screenshot | experimental
/>
```

| Level | Content mask | Overlay | A capture keeps | Notes |
|---|---|---|---|---|
| `standard` | no | none | everything | Watermark and browser-action blocking only. No flicker. |
| `strong` | no | 0.09 stripes | ~everything | The old default. Be plain that it costs a capture approximately nothing. |
| **`screenshot`** | **4px blocks** | **0.2** | **2-6% words, 0% figures** | **The default for protected documents.** Reader keeps 100% / 98%. |
| `experimental` | 4px blocks | 0.4 | nothing | Lab only. Pronounced flicker. |

**The content mask is the control and the overlay is the finisher** - which is
the opposite of what this file said before it was measured against a human
rather than against OCR. Alone, the content mask takes a capture to 9% of words
and 0% of figures; the overlay alone takes it to 100%, i.e. nowhere.

A capture of the overlay alone is *plainly readable* while scoring 67% word
loss, because an overlay modulates the paper and leaves glyph shapes intact.
See `docs/protection-evidence/screenshot/screenshot.png` and do not accept an
OCR number for this without looking at the image.

Amplitude, frequency, pattern scale, noise and watermark opacity are all
overridable for testing.

**Safety.** Three things, and the first two are not optional:

- All modulation is disabled under `prefers-reduced-motion`.
- The viewer shows a **Reduce flicker** button whenever modulation is running.
  One click turns it off for the session and says plainly what that costs
  ("a screen capture of this page would now be readable"). A reader must never
  have to choose between reading the page and their eyes.
- Every frame carries the same mean luminance — half the blocks light, half
  dark — so there is no large-area flash, which is the property the
  photosensitivity guidance is written around. Fine-grained modulation at
  constant mean is a much lower risk than a full-area flash at the same rate.
  That lowers the risk; it does not remove it.

`screenshot` has **not yet been assessed by a person**, for flicker or for the
contrast the content mask costs (text lands dark grey, not black). A simulation
cannot do either. `/camera-lab` → **★ Shipped** is that exact configuration. If
it is unpleasant to read, lower it — a 3px content mask still costs a capture
most of its figures — and an overlay nobody will tolerate protects nothing.

## The attack that beats it

Averaging captures. The page is legible to a person because the eye averages
consecutive frames, so an attacker who averages captures performs the same
operation and gets the same result:

| Captures averaged | 1 | 2 | 3 | 4 | 8 |
|---|---|---|---|---|---|
| Words recovered | 33% | 33% | 33% | **99%** | 100% |

(Measured on the overlay; the content mask has the same ceiling for the same
reason - two complementary frames sum to the page by design.)

**Four is enough**, and a screen recording is four for free. No parameter fixes
this; anything that stopped the attacker would stop the reader.

Rotating several masks instead of one was tried against this and dropped: it
made no difference at 4 captures and made 2-3 captures *easier* to recover
from, because two captures of one fixed mask at the same polarity carry no new
information between them while two different masks each carry some.

So the supportable claim is narrow, and worth writing down in these words:
**one casual screenshot comes out unreadable; somebody who knows what they are
doing gets the document back with four.** That defeats screenshot-and-forward,
which is how these documents actually leak. It is not access control.

## Benches

- `/camera-lab` — the overlay on its own, seven configurations, OCR scoring.
- `/screenshot-lab` — the real viewer, with a row per capture method
  (PrintScreen, Win+Shift+S, Snipping Tool, macOS, browser, devtools,
  extension, phone, phone with HDR, screen recording). Capture, feed the file
  back in, and it is OCR'd and scored against a reference.

Both are `noindex`, on no menu and in no sitemap.

**Read the OCR word recall, not the appearance.** A capture can look ruined and
still give up 98% of the document. That is the one measurement that answers
"can somebody obtain a clean, reusable copy".
