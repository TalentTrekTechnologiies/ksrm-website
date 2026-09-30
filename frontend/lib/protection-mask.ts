/**
 * The modulation mask, shared by the lab overlay and the production viewer.
 *
 * It lives here because it used to live in both, as two copies that happened
 * to agree. That is a bad place for it: the OCR numbers in
 * docs/PROTECTION-REPORT.md are produced by driving the LAB, and they are only
 * evidence about the production viewer if the production viewer builds the
 * identical mask. Sharing the builder makes that true by construction instead
 * of by inspection, so the measurement cannot quietly stop describing the
 * thing that ships.
 *
 * The mechanism, in one line: draw the mask at +delta on one frame and -delta
 * on the next. A person's vision integrates over roughly 20ms and sees the
 * average, which is flat. A capture of one frame sees one polarity on its own.
 *
 * Two invariants, both learned by getting them wrong:
 *
 *   - Every pixel is painted, the pattern in `ink` and the gaps in its
 *     opposite. Painting only the pattern's own cells leaves the gaps
 *     untouched, so the two phases no longer cancel and the pattern stays
 *     behind as a permanent veil over the page.
 *   - Both phases of a pair come from the SAME `seed`. A mask is only
 *     cancelled by itself.
 */

export type MaskPattern =
  | "none"
  | "horizontal"
  | "vertical"
  | "diagonal"
  | "checker"
  | "random"
  | "moire"

/**
 * Builds one polarity of the mask, as an offscreen canvas.
 *
 * Pre-rendered rather than drawn per frame: at 60fps a full-page pattern drawn
 * cell by cell is enough work to miss frames, and a dropped frame breaks the
 * +delta/-delta pairing the whole effect depends on - the average stops being
 * neutral and the person sees it flicker.
 *
 * @param ink `#ffffff` for the light phase, `#000000` for the dark one.
 * @param seed Only used by `random`. Both phases of a pair must share it.
 */
export function buildMask(
  type: MaskPattern,
  period: number,
  width: number,
  height: number,
  ink: string,
  seed = 0x2545f491,
): HTMLCanvasElement | null {
  if (type === "none" || period <= 0) return null
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.ceil(width))
  c.height = Math.max(1, Math.ceil(height))
  const ctx = c.getContext("2d")
  if (!ctx) return null

  const light = ink === "#ffffff"
  const p = Math.max(1, Math.round(period))

  if (type === "random") {
    // Randomised in BLOCKS of `period`, not per pixel.
    //
    // It was per pixel, which ignored `period` entirely - so the optimiser's
    // random rows at period 2, 3 and 4 were three runs of the identical 1px
    // noise, and 1px noise is the weakest thing this could do: subpixel
    // antialiasing and the 2x upscale an attacker applies before OCR both
    // average it back out. At block size 3 it survives both.
    //
    // Measured, blocks beat stripes by 27 points of word loss at the same
    // amplitude (67% against 40%). Stripes are regular enough that OCR's line
    // finding steps over them; an aperiodic mask leaves nothing to lock onto.
    let st = seed | 0
    for (let y = 0; y < c.height; y += p) {
      for (let x = 0; x < c.width; x += p) {
        st ^= st << 13
        st ^= st >>> 17
        st ^= st << 5
        ctx.fillStyle = ((st & 0xff) > 127) === light ? "#ffffff" : "#000000"
        ctx.fillRect(x, y, p, p)
      }
    }
    return c
  }

  ctx.fillStyle = light ? "#000000" : "#ffffff"
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = ink

  if (type === "horizontal") {
    for (let y = 0; y < c.height; y += p * 2) ctx.fillRect(0, y, c.width, p)
  } else if (type === "vertical") {
    for (let x = 0; x < c.width; x += p * 2) ctx.fillRect(x, 0, p, c.height)
  } else if (type === "diagonal") {
    ctx.save()
    ctx.translate(c.width / 2, c.height / 2)
    ctx.rotate(Math.PI / 4)
    const span = Math.hypot(c.width, c.height)
    for (let y = -span; y < span; y += p * 2) ctx.fillRect(-span, y, span * 2, p)
    ctx.restore()
  } else if (type === "checker") {
    for (let y = 0; y < c.height; y += p) {
      for (let x = 0; x < c.width; x += p) {
        if (((x / p) | 0) % 2 === ((y / p) | 0) % 2) ctx.fillRect(x, y, p, p)
      }
    }
  } else if (type === "moire") {
    // Two gratings at a slight angle. Their beat frequency is what a sensor
    // aliases into coarse fringes; to the eye it is a fine texture.
    for (const angle of [0, 0.06]) {
      ctx.save()
      ctx.translate(c.width / 2, c.height / 2)
      ctx.rotate(angle)
      const span = Math.hypot(c.width, c.height)
      for (let y = -span; y < span; y += p * 2) ctx.fillRect(-span, y, span * 2, p)
      ctx.restore()
    }
  }

  return c
}

/**
 * Builds `count` mask pairs, each pair one mask at both polarities.
 *
 * `count` ships at 1. Rotating several masks was tried and measured, and it
 * does not earn its place: the single-frame OCR score is identical (67% of
 * words lost either way), and against an attacker averaging a few captures it
 * is slightly WORSE - two averaged captures gave back 33% of words against one
 * fixed mask and 65% against eight rotating, because two captures of a fixed
 * mask at the same polarity carry no new information between them while two
 * different masks each carry some. The knob stays because the bench uses it.
 *
 * `base` exists so one fixed mask is not shared by every viewer of every page.
 * It is not a secret: the mask is built in the browser, so it is recoverable
 * by anyone who reads the bundle, and nothing here should be described as
 * though it were not.
 */
export function buildMaskCycle(
  type: MaskPattern,
  period: number,
  width: number,
  height: number,
  count: number,
  base = 0x2545f491,
): Array<{ light: HTMLCanvasElement | null; dark: HTMLCanvasElement | null }> {
  const n = Math.max(1, Math.round(count) || 1)
  return Array.from({ length: n }, (_, i) => {
    // Distinct odd seeds: the xorshift degenerates from zero, and adjacent
    // seeds open with similar runs.
    const seed = (base + i * 0x9e3779b9) | 1
    return {
      light: buildMask(type, period, width, height, "#ffffff", seed),
      dark: buildMask(type, period, width, height, "#000000", seed),
    }
  })
}

/**
 * A complementary pair of CSS masks, as data URLs, for masking the CONTENT.
 *
 * This exists because the overlay does not do what people assume it does.
 *
 * An overlay drawn on top modulates the PAPER: a white block over white paper
 * leaves it white, a black block darkens it to grey. Text stays dark under
 * both polarities, so the glyph shapes survive intact. That is why a capture
 * of the overlay defeats OCR - the mottled background wrecks the binarisation
 * step - while a person reads it without difficulty. Machine segmentation and
 * human reading are not the same faculty, and the overlay only attacks one.
 *
 * Masking the content instead removes it. Where the mask is transparent the
 * glyph is not dimmed, it is gone, and the paper shows through. One frame
 * carries half of every letter; the other half is in the next frame.
 *
 * The pair is exactly complementary, so the two frames sum to the whole page:
 *
 *   visible = (content + paper) / 2      uniform, at half contrast
 *   one frame = half of every glyph replaced by blank paper
 *
 * The half-contrast average is the price and it is not avoidable: the page has
 * to be recoverable by the eye from the same two frames the attacker can also
 * average, so anything hidden from one capture is given back in the next.
 */
export function buildContentMaskPair(
  period: number,
  width: number,
  height: number,
  seed = 0x2545f491,
): { a: string; b: string } | null {
  const w = Math.max(1, Math.ceil(width))
  const h = Math.max(1, Math.ceil(height))
  const p = Math.max(1, Math.round(period))

  const make = (invert: boolean) => {
    const c = document.createElement("canvas")
    c.width = w
    c.height = h
    const ctx = c.getContext("2d")
    if (!ctx) return null
    // Opaque where the content shows, fully transparent where it is removed.
    // CSS masks key on alpha by default, so the blocks carry the alpha and the
    // colour is irrelevant.
    ctx.fillStyle = "#000000"
    let st = seed | 0
    for (let y = 0; y < h; y += p) {
      for (let x = 0; x < w; x += p) {
        st ^= st << 13
        st ^= st >>> 17
        st ^= st << 5
        if (((st & 0xff) > 127) !== invert) ctx.fillRect(x, y, p, p)
      }
    }
    return c.toDataURL("image/png")
  }

  const a = make(false)
  const b = make(true)
  return a && b ? { a, b } : null
}

/**
 * Which mask of the rotation a frame uses.
 *
 * Advances one step per completed pair, so both polarities of a mask are shown
 * before the next is used. Getting this wrong - advancing per frame - shows
 * each mask at one polarity only, and the average never cancels.
 */
export function maskIndex(frame: number, modulationSpeed: number, count: number): number {
  if (count <= 1) return 0
  return Math.floor(frame / Math.max(1, modulationSpeed * 2)) % count
}
