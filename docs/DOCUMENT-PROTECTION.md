# Protected documents — what is actually enforced

For `ProtectedDocumentViewer`, used by NBA documents. Written so nobody has to
guess later which parts are controls and which are friction, and so the college
is never told something is prevented when it is only discouraged.

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

Verified in a browser: 14 of 14 checks — image not PDF, token present, content-type
`image/jpeg`, right-click / copy / drag / selection blocked, Ctrl+P, Ctrl+S,
Ctrl+C swallowed, no download or print button, hidden on blur, restored on focus.

Token behaviour is covered by six tests: a token for one document is refused
for another, an edited signature is refused, a pushed-out expiry is refused
(the expiry is inside the signature), and an expired token is refused.

## Degraded, not blocked

| | Reality |
|---|---|
| **Screenshots** | Not preventable in a browser. The capture happens in the OS. What happens instead: the page hides itself when the window loses focus, which catches Snipping Tool, Win+Shift+S and most recorders because they take focus as they open; PrintScreen blanks it briefly; the capture carries the modulation stripes and both watermarks. |
| **Right-click, copy, drag, shortcuts** | Enforced through events, so devtools walks past all of it. Friction. |
| **Temporal modulation** | Real but weak at readable amplitudes. Measured: OCR recovered 98% of words from the strongest comfortable setting. See [CAMERA-RESISTANCE.md](CAMERA-RESISTANCE.md). |
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
  screenshotProtection      // default true; false leaves layers 1-2 only
  protectionLevel="strong"  // standard | strong | experimental
/>
```

| Level | Modulation | Noise | Notes |
|---|---|---|---|
| `standard` | none | none | Watermark and browser-action blocking only. No flicker. |
| `strong` | 0.09 | 0.02 | The default for protected documents. |
| `experimental` | 0.20 | 0.05 | Lab only. Visible flicker. |

Amplitude, frequency, pattern scale, noise and watermark opacity are all
overridable for testing.

**Safety.** All modulation is disabled under `prefers-reduced-motion`. The
default amplitude is conservative, and `experimental` stops at 0.20 — well
below the 0.4 where the sweep found real separation, because at 0.4 a person
sees pronounced flicker and that is a photosensitivity risk, not a trade-off.
Do not raise these defaults on the strength of a simulation.

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
