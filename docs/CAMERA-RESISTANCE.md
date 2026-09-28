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

## Then measured again, properly

Laplacian detail says how noisy a picture looks. It does not say whether the
document can be copied, and those turned out to be different questions. Each
panel was put through OCR and scored against the known text - character
accuracy, and the share of words recovered exactly.

| Configuration | Camera words | Reader words |
|---|---|---|
| A — none | 100% | 100% |
| B — static watermark | 100% | 100% |
| C — dynamic watermark | 98% | 98% |
| D — temporal modulation | 100% | 98% |
| E — spatial only | 100% | 100% |
| F — temporal + spatial | 98% | 100% |
| G — everything | **98%** | 98% |

**At readable strength, none of it works.** The configuration that carried 89%
more fine detail still gave up 98% of its words. A page can be covered in
stripes and transcribe perfectly, and the detail measure could not see the
difference.

## Sweeping for a setting that does work

Three patterns x four scales x four strengths, each scored by OCR on one frame
against eight averaged:

| Overlay strength | Camera words | Reader words |
|---|---|---|
| 0.12 (comfortable) | 97% | 97% |
| 0.25 | 71-95% | 95-97% |
| **0.40** | **0-14%** | 86-100% |
| **0.60** | **0-3%** | 93-100% |

So the mechanism is real - below about 0.25 there is no separation at all, and
at 0.4 and above a single frame stops being transcribable while the average
survives.

The catch is what 0.4-0.6 means. That is an overlay at half strength
alternating every frame. The averaged column says a reader recovers the text;
it says nothing about what watching it feels like, and at that amplitude a
person will see pronounced flicker. The simulation cannot measure eye strain,
and it cannot measure a seizure risk. **Do not deploy these settings on the
strength of this table** - they are the settings to test on a person, briefly,
having read the health note below.

The sweep was also unstable in places: the same pattern scored 0% and then
100% for the reader one step apart. That is the harness, not the effect -
screenshots are not guaranteed to land on alternating frames, so an uneven
number of each polarity leaves a residue. It means these numbers show where to
look, not what to ship.

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

## Scoring a real photograph

The lab scores phone photos directly. Photograph a panel, then use **Score a
photo** in that panel's row: the image is read with OCR in the browser and
compared against the original text. The transcript is kept, and the CSV export
carries both scores and the text that was read.

**OCR words** is the number to read. Someone copying a document needs the
words, not the pixels - a panel can look ruined and still score 98%.

Verified against a capture of the unprotected panel: 78% characters, 100%
words, "copies fully". A control that scored low would mean the scorer was
broken and every other number meaningless.

Note the automated numbers above come from clean screen captures, not
photographs. A real phone adds lens blur, perspective, glare and lower
effective resolution, all of which lower OCR on their own - so the absolute
figures will be lower on a phone. What carries over is the comparison between
configurations.

## Testing it properly

Per phone, photograph the lab page in each of: default auto, HDR off, night
mode, and a video recording with a frame extracted afterwards. Record results
in the table on the page; it saves as you type and exports CSV.

The expected finding is that D/F/G degrade an HDR-off still and little else.
If that is what happens, that is the finding — the prototype exists to
establish it, not to confirm a hope.
