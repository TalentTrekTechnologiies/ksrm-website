# Protected documents — final test report

Every number here is measured. Where something has not been measured — real
phones, real OS screenshots — it says so, rather than standing in a simulation.

Evidence images and the raw optimiser log are in
[`protection-evidence/`](protection-evidence/). To reproduce:
`BASE=http://localhost:3000 node frontend/scripts/protection/optimise.mjs`.

---

## 1. What we can prevent

| | How it is enforced |
|---|---|
| **Downloading the document** | The PDF never leaves the server. The browser is sent one flattened JPEG per page. There is no file on the device. |
| **A permanent file URL** | Page links carry a 15-minute HMAC token, bound to the document id. A copied link expires; one document's token opens no other. Six tests. |
| **Walking document ids** | Only pages on an allow-list of sections are served. Everything else 404s, including ids that exist. |
| **Copying text** | There is no text layer. It is pixels. |
| **Printing** | Print styles blank the viewer. |
| **Right-click save, drag, Ctrl+S/P/C** | Refused — but through page events, so devtools bypasses it. Listed here because it stops the ordinary user; it is not a control against a determined one. |

## 2. What we can disrupt

**Machine copying of a phone photograph (OCR)** — substantially, at a cost.

The optimiser searched pattern, period, strength, dithering and a second spatial
frequency, scoring every point by OCR: one captured frame (a phone photo, HDR
off) against sixteen averaged (what the eye integrates to). The reader had to
keep 90% of what the unprotected page yields, words and figures separately.

| Strength | Camera: words | Camera: **figures** | Reader: words | Reader: figures |
|---|---|---|---|---|
| None | 100% | 100% | 100% | 100% |
| 0.1 | 100% | 60% | 100% | 100% |
| 0.2 | 99% | 50% | 100% | 98% |
| **0.3** | **50–60%** | **4–8%** | **100%** | **98–100%** |
| 0.4 | 0% | 0% | 100% | 98% |

**Figures break long before words do.** OCR repairs a damaged word from context
and a dictionary; it cannot do that for "4617500". For accreditation documents,
which are mostly figures and tables, a moderate strength protects the numbers
far more than the prose.

**One capture method, possibly**: Snipping Tool opened as an app. Seconds pass
between it taking focus and the capture; the viewer hides in about 22 ms.
Not yet confirmed on a real machine.

## 3. What we can only watermark

- **A person reading a photograph.** This is the finding that matters most, and
  it is visible in the evidence: at 0.3 the photographed frame defeats OCR on 92%
  of the figures — and a person can still read every one of them through the
  stripes. The pattern breaks machine segmentation, not human reading. See
  `2-a030-camera.png`.
- **Screenshots** by PrintScreen, Win+Shift+S, browser capture and extensions.
- **Any phone photo taken with HDR, night mode or video.** All three average
  several frames, which is the same operation the eye performs — so they see
  what the reader sees. No setting can separate an HDR camera from a human eye.

For all of these, the watermark is the protection. It is burned into the page
image by the server and drawn again over the top, moving:
**KSRM COLLEGE · CONFIDENTIAL — VIEW ONLY · Viewer · Session · Time.**
It survives screenshots, HDR, night mode and video frames, because it is in
the pixels a person sees rather than in a timing trick a camera can average out.

## 4. What the browser cannot control

- **OS-level screen capture.** No web API exists.
- **When the OS takes its pixels.** PrintScreen is reported to the page as a
  keyup, after the framebuffer is taken. Win+Shift+S freezes the screen the
  moment it is invoked.
- **Faster than 60Hz.** A page cannot render faster than the display refreshes.
  Anti-camera displays that genuinely defeat cameras modulate at 120–240Hz in
  hardware.
- **Whether the phone stacks exposures.** Most modern phones default to HDR.
- **Physical monitor brightness.** Everything here is CSS on the element.

A native application could block OS screenshots — `FLAG_SECURE` on Android,
`SetWindowDisplayAffinity` on Windows. Neither stops a phone camera.

## 5. Best parameters discovered

**Recommended candidate: horizontal grating, period 3px, amplitude 0.3,
modulation every frame.**

At that setting, in simulation: a photograph loses 40–50% of words and 92–96%
of figures to OCR; the reader keeps essentially all of both.

**Not adopted as the production default yet**, deliberately. Amplitude 0.3
modulated at 60Hz is at the edge of where people see flicker, and flicker in
this range is a photosensitivity risk. A simulation cannot measure eye strain
or flicker perception. It needs the human test in section 8 first.

0.4 separates completely (camera 0%, reader 100%) and is in the range where
flicker is likely pronounced. It is available in the lab for testing only.

The lab's configurations C, E, F and G use the 0.3 settings. The production
viewer's `strong` level stays at 0.09 until a person has confirmed 0.3 is
comfortable.

## 6. Actual screenshots and photos from testing

In `protection-evidence/`, one pair per strength:

| File | What it is |
|---|---|
| `0-none-camera.png` / `-reader.png` | Unprotected. Identical, as they should be. |
| `1-a020-camera.png` / `-reader.png` | 0.2. Visible texture; OCR still reads the prose. |
| `2-a030-camera.png` / `-reader.png` | **0.3. Heavy stripes in the capture — still readable to a person.** |
| `3-a040-camera.png` / `-reader.png` | 0.4. Strongest separation. |

**These are simulations, not phone photos.** "Camera" is a single browser frame,
which is what a short exposure with HDR off captures. **No real phone has been
pointed at the screen yet, and no real OS screenshot has been taken** — I have no
way to do either on your machine. The lab exists for that.

## 7. OCR comparison

Per content type at the recommended 0.3, scored in a dedicated run:

| Part | Camera | Reader | Unprotected |
|---|---|---|---|
| Heading (22px bold) | **100%** | 100% | 100% |
| Paragraph (15px) | 51% | 100% | 100% |
| Small print (12px) | **0%** | 100% | 100% |
| Figures | **8%** | 100% | 100% |
| Table | **0%** | 95% | 100% |
| **Total** | **50% words, 4% figures** | **100%, 98%** | 100%, 100% |

**Large bold text survives the pattern.** The stripes are thinner than a heading's
strokes, so OCR reads straight through them. Protection works best on exactly
the parts that matter in an accreditation document — small print, figures and
tables — and least on headings, which usually carry the least sensitive text.

**Run-to-run variance is about ±10 points.** The optimiser's pass over this same
setting scored 60% words and 8% figures; this dedicated run scored 50% and 4%.
The difference is which frame the capture lands on relative to the modulation.
Read these as ranges, not exact values.

The OCR here is a **competent** attacker's: each part cropped to its own region,
upscaled 2x, layout detection set explicitly. That is stricter than the
out-of-the-box settings, and it had to be — with the defaults, the engine could
not read the *unprotected* table at all, and every table score would have been
measuring the engine instead of the protection.

Three measurement bugs were found and fixed before these numbers could be
trusted: scoring the whole page in one pass (layout detection mangled the
table), the worker's default layout mode not being AUTO, and an absolute
readability bar the clean page itself could not meet.

## 8. Human readability assessment

**Not done, and it cannot be done by me.** The reader column above is OCR on an
averaged image — it says the text is *recoverable*, not that reading it is
*comfortable*. Those are different, and the second is the one you set as the bar.

What the averaged images show: at 0.3 there is a faint residual texture but the
page reads cleanly. What they cannot show: whether 0.3 flickers perceptibly at
60Hz, or tires the eyes over a minute.

To do it: `/camera-lab`, **Human readability test**. It opens the same document
— heading, paragraph, small print, figures, table — at each strength. Read each
at normal distance for a minute. If one visibly flickers or tires your eyes,
that strength is too high, whatever OCR says.

---

## Did the experiment succeed?

**Partly, and it is worth being exact about where.**

Against **OCR of a photograph taken with HDR off**: largely, at 0.3 in
simulation — 92–96% of the figures and all of the small print become
unrecoverable, while the reader keeps essentially everything. Large headings
still come through.

Against **a person reading that photograph**: no. The stripes stop a machine, not
an eye. Someone can photograph the screen and transcribe it by hand.

Against **HDR, night mode and video**: no, and not by any setting. They average
frames, which is what makes the page readable to a person in the first place.

Against **screenshots**: no, except plausibly Snipping Tool.

**Why it cannot fully succeed**: the entire technique depends on the camera
seeing one frame and the eye seeing the average. Any capture that also averages
— which is what modern phones do by default — sees what the eye sees. That is a
property of the physics, not a tuning problem.

**What does work, everywhere**: the watermark. Every copy, by every method,
carries who took it and when. The honest message to the college is not
"this cannot be copied" but "every copy identifies its source."
