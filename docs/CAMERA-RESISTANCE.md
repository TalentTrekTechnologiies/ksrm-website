# Camera-resistant viewing — experiment notes

An attempt to make a photograph of the screen measurably worse than the screen,
without making the screen worse to read. Prototype only. Nothing here is wired
into a public page.

Open `/camera-lab` on the machine under test. It is `noindex`, on no menu, and
in no sitemap.

## The one asymmetry a browser can use

A person's vision integrates light over roughly 20ms, so two frames shown in
quick succession are perceived as their average. A camera exposing for less
than a frame — which a phone does readily, because a lit screen is bright —
catches one of the two on its own.

So the overlay paints a pattern at +Δ on one frame and −Δ on the next.
Averaged, that is a flat grey veil. Caught singly, it is stripes.

Everything else in the prototype is a variation on that, or a watermark.

## Measured

Each panel was captured eight times, one display frame apart. "Camera" is the
first frame alone; "human" is the eight averaged — which is also what an HDR
stack converges on. The number is mean Laplacian response: how much
fine detail sits in the image, relative to the unprotected control.

| Configuration | Camera | Human | Reading |
|---|---|---|---|
| A — none | 1.00 | 1.00 | control |
| B — static watermark | 1.09 | 1.09 | identical to both, as it should be |
| C — dynamic watermark | 1.08 | 1.02 | drifts out of the average |
| D — temporal modulation | 1.29 | 1.13 | the asymmetry, on its own |
| E — spatial only | 1.25 | 1.25 | no asymmetry — same to both |
| F — temporal + spatial | 1.74 | 1.24 | the two compound |
| G — everything | **1.89** | **1.20** | best separation measured |

G puts 89% more fine detail into a single-frame capture than the control, while
the averaged view gains only 20%. That gap is the effect.

## Two bugs the measurement caught

Both were invisible by eye and would have shipped as a feature that did
nothing:

1. **The modulation was not modulating.** The two phases were drawn with
   `drawImage` after setting `fillStyle`, and `drawImage` ignores `fillStyle` —
   so both phases painted the same white mask. Frame-to-frame difference was
   0.114 out of 255. After building two masks instead, 2.492.

2. **The phases did not cancel.** Only the pattern's own cells were painted,
   leaving the gaps untouched, so averaging the two phases left the pattern
   behind as a permanent veil rather than cancelling it. Each phase now paints
   every pixel — the cells in one tone, the gaps in the other.

## What this does not do

- **It does not stop a screenshot.** A screenshot captures one composited
  frame, so it catches one polarity and comes out patterned — but it is still
  a readable screenshot.
- **It is expected to fail against HDR, night mode and video.** All three
  average several exposures, which is precisely the operation that makes the
  page readable to a human. The mechanism cannot tell those apart. A
  photographer who turns HDR off gets the degraded image; one who leaves it on
  probably does not.
- **60Hz is the ceiling.** A browser cannot render faster than the display
  refreshes. Commercial anti-camera displays modulate at 120–240Hz in
  hardware, which is why they need the hardware.
- **Moiré is defeated by moving closer or changing zoom.**
- **Nothing here touches a camera pointed at the screen from across a room.**

## What survives everything

The watermark. It is in the pixels, it moves so two photographs are not
stamped identically, and it appears in an HDR capture, a night-mode capture, a
video frame and a phone photo alike. The realistic goal is attribution, not
prevention.

## Health note

Alternating luminance in this range can affect people with photosensitive
epilepsy. Amplitude is kept low, the lab page carries a warning, and
modulation is disabled automatically under `prefers-reduced-motion`. Any move
from prototype to production should keep all three.

## Testing it properly

Per phone, photograph the lab page in each of: default auto, HDR off, night
mode, and a video recording with a frame extracted afterwards. Record results
in the table on the page; it saves as you type and exports CSV.

The expected finding is that D/F/G degrade an HDR-off still and little else.
If that is what happens, that is the finding — the prototype exists to
establish it, not to confirm a hope.
