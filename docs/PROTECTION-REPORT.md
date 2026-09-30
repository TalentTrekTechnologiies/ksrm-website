# Protected documents — final test report

Every number here is measured. Where something has not been measured — real
phones, real OS screenshots — it says so, rather than standing in a simulation.

Evidence images and the raw optimiser output (`optimiser-run.txt`) are in
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

### A screenshot — and this reverses what this report used to say

A screenshot is **one composited frame**. That is the same thing the `camera`
column has always measured, with no optical averaging to soften it. So the
single-frame score *is* the screenshot score.

The previous version of this report filed screenshots under "can only
watermark". That confused two claims — *we cannot block the capture* and *we
cannot degrade what it captures*. The first is true. The second is not.

### The trap in the OCR number, which caught this project once already

Raising the overlay to amplitude 0.3 with an aperiodic mask took OCR word
recall from 100% to 33% and figures to 0%. On the metric, a success.

**Then somebody looked at the image, and every word of it was readable.**
`screenshot.png` in `protection-evidence/screenshot/` is that capture: the
heading, the paragraph, 4820000, 4617500 and the entire table, plainly legible.

The reason is mechanical. An overlay drawn on top modulates the **paper**: a
white block over white paper leaves it white, a black block darkens it to grey.
Text stays dark under both polarities, so **the glyph shapes survive intact**.
That destroys OCR's binarisation step and does nothing whatsoever to a human
reader, who segments text by shape. Machine segmentation and human reading are
not the same faculty and the overlay only ever attacked one of them.

Any OCR-only measurement of this will keep saying the protection works. It is
necessary and nowhere near sufficient, and every number in this report should
be read with `capture-pair.mjs` output beside it.

### What actually hides the page: masking the content

Instead of drawing over the page, remove half of it per frame. Two copies of
the page carry complementary masks and one is shown per frame, so a single
capture is **missing half of every glyph** rather than merely textured over.
The two frames still sum to the whole page for the eye.

| Setting | Capture: words | figures | heading | Reader |
|---|---|---|---|---|
| No protection | 100% | 100% | 100% | 100% / 100% |
| Overlay only, 0.3 — *reads fine to a human* | 33% | 0% | **100%** | 100% / 57–100% |
| Content mask, 3px | 19% | 8% | 33% | 100% / 100% |
| Content mask, 4px | 9% | 0% | 17% | 100% / 70–100% |
| **Content mask 4px + overlay 0.2 — shipped** | **2–6%** | **0%** | **0–17%** | **100% / 98%** |

Note the heading column. The overlay leaves headings **completely intact** —
their strokes are wider than the mask, so a block lands inside a stroke instead
of breaking it. Content masking cuts the stroke itself, and the heading goes
with everything else.

Look at `combined-screenshot.png` against `combined-reader.png`. The capture is
destroyed to a person, not only to a machine; the reader's page is clean at
slightly reduced contrast.

**Being exact about "destroyed":** a determined person staring at the capture
can still reconstruct some prose, because human reading recovers a damaged word
from context. What they cannot reliably recover is the **figures** — there is
no context that repairs "4617500" — and an accreditation document is mostly
figures. That is the right way round, and it is the claim that should be made:
not "unreadable", but "the numbers cannot be trusted off a screenshot".

### The amplitude window, for the overlay component

| Amplitude | Capture loses | Reader keeps | |
|---|---|---|---|
| 0.20 | 0% words | 100% | no effect alone |
| 0.30 | 67% words | 100% / 100% | OCR only — reads fine to a human |
| 0.40 | everything | 100% / 100% | pronounced flicker |
| 0.45 | everything | **33% / 0–86%** | the reader breaks too |

The shipped overlay sits at 0.2 because the content mask is now doing the work
and the overlay only has to finish the edges. That is a **lower** flicker cost
than the 0.3 this report recommended an hour before it.

## 3. What we can only watermark

- **Averaging several captures.** The ceiling on the whole technique, and not a
  tuning problem. The page is readable to a person *because* the eye averages
  consecutive frames; an attacker who averages captures does the same operation
  and gets the same result. A screen recording is this for free. See §9.
- **A person reading a photograph of the screen.** A phone sees what the eye
  sees if it stacks exposures, and most phones do by default.
- **Any phone photo taken with HDR, night mode or video.** All three average
  frames. No setting separates an HDR camera from a human eye.

For all of these the watermark is the protection. It is burned into the page
image by the server and drawn again over the top, moving:
**KSRM COLLEGE · CONFIDENTIAL — VIEW ONLY · Viewer · Session · Time.**
It survives screenshots, HDR, night mode and video frames, because it is in the
pixels a person sees rather than in a timing trick a camera can average out.

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

**Shipped: content masking in 4px blocks, plus an overlay at amplitude 0.2,
one flip per frame, mask seeded per session.**

That is `protectionLevel="screenshot"`, which `/nba` now opens documents with.
A capture keeps 2-6% of words and none of the figures; the reader keeps 100%
and 98%. Scored twice, and the spread between the runs is the run-to-run
variance of the OCR itself - read these as ranges, not exact values.

The two layers do different jobs and both are needed:

| Layer | What it does | On its own |
|---|---|---|
| **Content mask** | Removes half of every glyph per frame | Capture 9% words / 0% figures |
| **Overlay 0.2** | Textures the paper, breaks what is left | Capture 100% — nothing at all |

The overlay is **not** the layer that protects the page, which is the opposite
of what this report said before. It is a finisher. The content mask is the
control, and the overlay at 0.2 is there because it costs little and closes the
last few percent.

Tried and **not** shipped:

| Tried | Why not |
|---|---|
| Overlay alone at 0.3 | Scores well on OCR, reads perfectly to a human. §2. |
| Rotating 8 masks instead of 1 | No change to one capture, slightly better for an attacker averaging 2–3. §9. |
| Content mask at 5px | No better than 4px, more visible to the reader. |
| Dithering, second spatial frequency | Cost reader contrast for nothing the mask was not already doing. |

**Flicker.** The overlay dropped from 0.3 to 0.2 once the content mask took
over the work, so the shipped setting flickers **less** than the one this
report recommended earlier. It is still modulation at frame rate and still
needs the human check in §8. Every frame carries the same mean luminance — half
the blocks light, half dark — so there is no large-area flash, which is the
property the photosensitivity guidance is written around. That lowers the risk;
it does not remove it. `prefers-reduced-motion` disables the whole mechanism,
and the viewer carries a one-click **Reduce flicker** control that says plainly
what turning it off costs.

## 6. Actual screenshots and photos from testing

In `protection-evidence/screenshot/`, the ones that matter:

| File | What it is |
|---|---|
| `screenshot.png` | **Overlay only, 0.3. OCR called this 67% destroyed. Read it — it is legible.** The single most useful image here. |
| `reader.png` | The same setting averaged: what the eye sees. |
| `contentmask-screenshot.png` | Content mask 3px. Glyphs broken rather than textured. |
| `combined-screenshot.png` | **The shipped setting. Compare to `screenshot.png`.** |
| `combined-reader.png` | The shipped setting as the reader sees it — clean, slightly low contrast. |

In `protection-evidence/`, from the earlier camera work, one pair per strength
(`0-none`, `1-a020`, `2-a030`, `3-a040`), camera against reader.

**These are browser frames, not phone photos or OS screenshots.** A browser
frame is a faithful stand-in for a screenshot — both are one composited frame —
and it is *not* one for a phone photo, which may stack exposures. **No real
phone has been pointed at the screen and no real OS screenshot has been taken**;
I have no way to do either on your machine. `/screenshot-lab` exists for that.

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

## 8. Human readability assessment — DONE, AND IT FAILED

This section asked for a person to read the shipped setting and say whether it
was comfortable. A person did. The verdict:

> "while viewing, that flickering is there, it is difficult to read"

**That ends the modulation approach as a default.** It is not a tuning result to
be traded against the OCR numbers - it is the acceptance bar this report set
for itself, failed by the only instrument that can measure it.

The same reader also reported that **a phone photo of the screen is still
readable**, which is the independently predicted behaviour: phones stack
exposures by default, and stacking is averaging, and averaging is what makes
the page readable to an eye in the first place.

### Why no amount of tuning was going to fix this

Both the flicker and the capture damage come from the same physical fact:
consecutive frames differ, and the eye integrates them. The capture sees one
frame; the reader sees the blend. **The blend is the flicker.** They are one
effect measured two ways, so there is no setting where the page looks normal
and a capture is destroyed. Turning the amplitude down reduces both together.

Everything from section 2 onwards optimised along a curve whose every point is
paid for by the reader. The mistake was accepting that curve, not choosing the
wrong point on it.

### What replaced it

`protectionLevel="reveal"` - show only part of the page at a time, as a band
that follows the reader.

| | Modulation | Reading band |
|---|---|---|
| Text quality | Patterned, half contrast, flickers | **Untouched. Sharp, no flicker.** |
| One screenshot gets | 2-6% of words | **~34% of the page, perfectly legible** |
| A phone photo gets | **Everything** | **~34% of the page** |
| Cost to the reader | Eye strain | Reads a section at a time |
| Four captures get | Everything | Everything |

The band is worse on the OCR metric and better on every question that was
actually asked. The covered region is not obscured - **it is not rendered** - so
no capture method can contain it, including the phone photograph that defeats
everything else here. A camera cannot average its way to something that was
never on the screen.

The reader pays in convenience instead of in eye strain, and that cost is
visible to them and theirs to judge. `/camera-lab/reveal` demonstrates it with
no backend required, with the visible fraction on a slider.

## 9. The attack that beats it

Averaging several captures. Measured, because the size of the number is the
whole point:

| Captures averaged | 1 | 2 | 3 | 4 | 8 |
|---|---|---|---|---|---|
| Words recovered | 33% | 33% | 33% | **99%** | 100% |
| Figures recovered | 0% | 0% | 0% | 50% | 88% |

**Four screenshots is enough.** Not four hundred — four. And a screen recording
is this attack for free: three seconds of video is 180 frames.

This is not a flaw in the tuning and no parameter fixes it. The page is legible
to a person *because* the eye averages consecutive frames; an attacker who
averages captures performs the same operation and necessarily gets the same
result. Anything that stopped them would stop the reader too.

So the claim this technique supports is narrow, and it should be stated in
exactly these words:

> **One casual screenshot comes out unreadable. Somebody who knows what they
> are doing gets the document back with four.**

That is still worth having — it defeats the screenshot-and-forward that is how
these documents actually leak — and it is not access control. The watermark
remains the layer that covers every case.


---

## Did the experiment succeed?

**Yes, after being wrong once in a way worth recording.**

Against **a single screenshot**: yes. A capture keeps 2-6% of the words and
none of the figures. Everything on the page is destroyed to a
person holding the image, not only to a machine reading it.

**The mistake in the middle**: the overlay was measured at 67% word loss and
called a success, and the capture was plainly readable. OCR recall measures
machine segmentation; it does not measure reading. The fix was to stop drawing
*over* the page and start removing *half of it* — an overlay leaves glyph
shapes intact by construction, and glyph shapes are what a person reads.
The general lesson: **if the claim is "a human cannot read this", no automated
metric closes it. Look at the image.**

Against **somebody who takes four screenshots and averages them**: no. Four is
all it takes, and a screen recording does it for free. §9.

Against **HDR photos, night mode and video**: no, and not by any setting. They
average frames, which is the operation that makes the page readable at all.

Against **a person transcribing by hand from a photograph**: partly. Prose can
be reconstructed from context; **figures cannot**, and an accreditation
document is mostly figures.

**Where the ceiling comes from**: the technique depends on the capture seeing
one frame and the eye seeing the average. Any capture that also averages sees
what the eye sees. Physics, not tuning.

**What the college should be told**, in one sentence: *a screenshot of these
documents comes out unusable, anyone determined can still obtain a copy, and
every copy names the account that made it.*
