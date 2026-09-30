"use client"

import { useEffect, useRef, useState } from "react"

import {
  buildContentMaskPair,
  buildMask,
  buildMaskCycle,
  maskIndex,
  MaskPattern,
} from "@/lib/protection-mask"

/**
 * An experiment: can a page be left readable to a person while a photograph of
 * the screen comes out measurably worse?
 *
 * The one asymmetry a web page can actually exploit is integration time. A
 * person's vision integrates light over roughly 20ms, so two frames shown in
 * quick succession are seen as their average. A camera exposing for less than
 * a frame - which a phone does readily, because a lit screen is bright - sees
 * one of the two frames on its own.
 *
 * So the overlay draws a pattern at +delta on one frame and -delta on the
 * next. Averaged, that is nothing; caught singly, it is stripes. Everything
 * else here is a variation on that, or a watermark.
 *
 * Honest limits, stated because this is a prototype and not a product:
 *
 *   - A browser cannot render faster than the display refreshes. On a 60Hz
 *     monitor the fastest alternation is 60Hz, which is close enough to the
 *     flicker-fusion threshold that some people will see it flicker. Real
 *     anti-camera displays modulate at 120-240Hz in hardware.
 *   - HDR and computational photography stack several exposures, which
 *     averages the two polarities back to flat. Night mode and video capture
 *     do the same. Expect the temporal modes to fail on a recent phone in a
 *     mode the photographer can select with one tap.
 *   - Moire is defeated by moving closer or changing zoom.
 *   - The watermark is the only layer that survives all of the above.
 *
 * Flicker is a safety matter, not only a comfort one: alternating luminance in
 * this frequency range can affect people with photosensitive epilepsy. The
 * amplitude is deliberately small, the modulation stops for anyone who has
 * asked for reduced motion, and the lab page carries a warning.
 */

export type ProtectionLevel = "off" | "low" | "medium" | "high" | "max"
/** Kept as the lab's name for the shared mask vocabulary. */
export type PatternType = MaskPattern

export interface CameraResistantViewerProps {
  /** The document. Any markup - the overlay sits on top of it. */
  children: React.ReactNode
  /** Presets that set the three knobs below; explicit props still win. */
  protectionLevel?: ProtectionLevel
  /** Draw the drifting watermark layer. */
  watermark?: boolean
  watermarkText?: string
  /** Let the watermark drift. Off gives the static control configuration. */
  watermarkMotion?: boolean
  patternType?: PatternType
  /** Pattern period in CSS pixels. Smaller aliases harder, and is harder to read through. */
  patternFrequency?: number
  /** Frames between polarity flips. 1 = flip every frame (strongest, most visible flicker). 0 = static. */
  modulationSpeed?: number
  /** Overlay strength, 0-1. Above ~0.15 the pattern starts to cost readability. */
  opacity?: number
  /** Reports the measured frame rate, so a test can record what the display was doing. */
  onFps?: (fps: number) => void
  /**
   * Fresh noise every frame, alternating polarity. A different mechanism from
   * the fixed pattern: independent noise averages DOWN over n frames by about
   * sqrt(n), so the eye sees roughly a third of it while a single exposure
   * sees all of it.
   */
  ditherIntensity?: number
  /**
   * A second grating at another period, in counter-phase to the first. One
   * spatial frequency can be aliased away by stepping back or zooming; two at
   * different periods leave no single distance that clears both.
   */
  secondaryFrequency?: number
  /** Pixels of pattern drift per frame. 0 holds the pattern still. */
  phaseShiftSpeed?: number
  /**
   * Cycle through this many different masks instead of reusing one.
   *
   * A fixed mask is one puzzle: an attacker holding two captures of the same
   * page can difference them and subtract it. Cycling means consecutive
   * captures carry unrelated masks, so there is nothing constant to subtract,
   * and the residue that survives the eye's averaging falls as sqrt(n) rather
   * than staying put.
   *
   * The pair is kept intact - each mask is shown at + then - polarity before
   * the next is used - because breaking that is what leaves a visible veil.
   * 0 or 1 keeps the single fixed mask.
   */
  maskCycle?: number
  /**
   * Mask the CONTENT rather than drawing an overlay over it.
   *
   * The overlay modulates the paper and leaves glyph shapes intact, which
   * defeats OCR and not a person. This removes half of every glyph per frame
   * instead, so a single capture is missing the content rather than merely
   * textured. Costs half the contrast, for the reason in protection-mask.ts.
   */
  contentMask?: boolean
}

const PRESETS: Record<
  ProtectionLevel,
  { patternType: PatternType; patternFrequency: number; modulationSpeed: number; opacity: number; watermark: boolean }
> = {
  off: { patternType: "none", patternFrequency: 0, modulationSpeed: 0, opacity: 0, watermark: false },
  low: { patternType: "none", patternFrequency: 0, modulationSpeed: 0, opacity: 0.1, watermark: true },
  medium: { patternType: "horizontal", patternFrequency: 6, modulationSpeed: 0, opacity: 0.08, watermark: true },
  high: { patternType: "horizontal", patternFrequency: 4, modulationSpeed: 1, opacity: 0.1, watermark: true },
  max: { patternType: "checker", patternFrequency: 3, modulationSpeed: 1, opacity: 0.14, watermark: true },
}

export default function CameraResistantViewer({
  children,
  protectionLevel = "medium",
  watermark,
  watermarkText = "KSRM COLLEGE — VIEW ONLY",
  watermarkMotion = true,
  patternType,
  patternFrequency,
  modulationSpeed,
  opacity,
  onFps,
  ditherIntensity = 0,
  secondaryFrequency = 0,
  phaseShiftSpeed = 1 / 120,
  maskCycle = 0,
  contentMask = false,
}: CameraResistantViewerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const layerA = useRef<HTMLDivElement | null>(null)
  const layerB = useRef<HTMLDivElement | null>(null)
  const [reduced, setReduced] = useState(false)

  const preset = PRESETS[protectionLevel]
  const cfg = {
    patternType: patternType ?? preset.patternType,
    patternFrequency: patternFrequency ?? preset.patternFrequency,
    modulationSpeed: modulationSpeed ?? preset.modulationSpeed,
    opacity: opacity ?? preset.opacity,
    watermark: watermark ?? preset.watermark,
  }

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Two masks, not one recoloured at draw time: drawImage ignores fillStyle,
    // so painting one mask and changing the fill colour between phases drew
    // the identical thing twice. Measured frame-to-frame difference was 0.114
    // out of 255 - the modulation was doing nothing whatsoever, and nothing
    // about the page looked wrong.
    // One entry per mask in the cycle; each entry holds the SAME mask at both
    // polarities, which is what makes the pair average to nothing.
    let masks: Array<{ light: HTMLCanvasElement | null; dark: HTMLCanvasElement | null }> = []
    let secondLight: HTMLCanvasElement | null = null
    let secondDark: HTMLCanvasElement | null = null
    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const r = host.getBoundingClientRect()
      width = r.width
      height = r.height
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      masks = buildMaskCycle(cfg.patternType, cfg.patternFrequency, width, height, maskCycle)
      secondLight =
        secondaryFrequency > 0 ? buildMask("vertical", secondaryFrequency, width, height, "#ffffff") : null
      secondDark =
        secondaryFrequency > 0 ? buildMask("vertical", secondaryFrequency, width, height, "#000000") : null
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let frame = 0
    let raf = 0
    let fpsFrames = 0
    let fpsSince = performance.now()

    const draw = () => {
      raf = requestAnimationFrame(draw)
      frame += 1

      // Frame-rate readout: which display the test actually ran on changes how
      // the result should be read, so it is measured rather than assumed.
      fpsFrames += 1
      const now = performance.now()
      if (now - fpsSince >= 1000) {
        onFps?.(Math.round((fpsFrames * 1000) / (now - fpsSince)))
        fpsFrames = 0
        fpsSince = now
      }

      ctx.clearRect(0, 0, width, height)

      // Polarity: +delta then -delta. Averaged by the eye this is neutral;
      // caught in one short exposure it is a visible pattern.
      const modulating = cfg.modulationSpeed > 0 && !reduced
      const phase = modulating ? Math.floor(frame / cfg.modulationSpeed) % 2 : 0

      // White through the mask on one phase, black through the same mask on
      // the next. Averaged they cancel; caught singly they are stripes.
      const slot = masks[maskIndex(frame, cfg.modulationSpeed, masks.length)] ?? masks[0]
      const mask = phase === 0 ? slot?.light ?? null : slot?.dark ?? null
      if (mask && cfg.opacity > 0) {
        ctx.save()
        ctx.globalAlpha = cfg.opacity
        // A stationary grating is easy for the eye to lock onto and ignore,
        // and easy for a burst to average away, so it creeps.
        const period = cfg.patternFrequency * 2
        const drift = cfg.patternType === "moire" || period <= 0 ? 0 : ((frame * phaseShiftSpeed) % 1) * period
        ctx.translate(0, drift)
        ctx.drawImage(mask, 0, 0, width, height)
        ctx.restore()
      }

      // The second grating runs in counter-phase: light when the first is
      // dark. Each still cancels against itself over two frames.
      const second = phase === 0 ? secondDark : secondLight
      if (second && cfg.opacity > 0 && !reduced) {
        ctx.save()
        ctx.globalAlpha = cfg.opacity * 0.7
        ctx.drawImage(second, 0, 0, width, height)
        ctx.restore()
      }

      if (ditherIntensity > 0 && !reduced) {
        ctx.save()
        ctx.globalAlpha = ditherIntensity
        ctx.fillStyle = frame % 2 === 0 ? "#000" : "#fff"
        // Density scaled to area, so a small panel and a full page are
        // dithered equally.
        const dots = Math.round((width * height) / 900)
        for (let i = 0; i < dots; i++) {
          ctx.fillRect((Math.random() * width) | 0, (Math.random() * height) | 0, 2, 2)
        }
        ctx.restore()
      }

      if (cfg.watermark) {
        drawWatermark(ctx, width, height, frame, watermarkText, reduced || !watermarkMotion)
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [
    cfg.patternType,
    cfg.patternFrequency,
    cfg.modulationSpeed,
    cfg.opacity,
    cfg.watermark,
    watermarkText,
    watermarkMotion,
    reduced,
    onFps,
    ditherIntensity,
    secondaryFrequency,
    phaseShiftSpeed,
    maskCycle,
  ])

  /**
   * Two copies of the content, each carrying one half of the mask, with only
   * one visible per frame.
   *
   * Two static layers toggled rather than one layer whose mask-image is
   * swapped: changing a mask forces the browser to re-rasterise that layer,
   * and doing it 60 times a second drops frames - which breaks the pairing the
   * whole effect depends on. Toggling visibility on two already-rasterised
   * layers is a compositor operation.
   */
  useEffect(() => {
    const host = hostRef.current
    const a = layerA.current
    const b = layerB.current
    if (!contentMask || !host || !a || !b) return
    if (reduced) {
      a.style.visibility = "visible"
      a.style.webkitMaskImage = ""
      a.style.maskImage = ""
      b.style.visibility = "hidden"
      return
    }

    let raf = 0
    let frame = 0

    const apply = () => {
      const r = host.getBoundingClientRect()
      const pair = buildContentMaskPair(cfg.patternFrequency || 3, r.width, r.height)
      if (!pair) return
      for (const [el, url] of [
        [a, pair.a],
        [b, pair.b],
      ] as const) {
        el.style.webkitMaskImage = `url(${url})`
        el.style.maskImage = `url(${url})`
        el.style.webkitMaskRepeat = "no-repeat"
        el.style.maskRepeat = "no-repeat"
      }
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(host)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      frame += 1
      const showA = Math.floor(frame / Math.max(1, cfg.modulationSpeed || 1)) % 2 === 0
      a.style.visibility = showA ? "visible" : "hidden"
      b.style.visibility = showA ? "hidden" : "visible"
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [contentMask, cfg.patternFrequency, cfg.modulationSpeed, reduced])

  return (
    <div
      ref={hostRef}
      style={{
        position: "relative",
        isolation: "isolate",
        // The holes punched in the content show this through, so it has to be
        // the colour of the paper.
        background: contentMask ? "#ffffff" : undefined,
      }}
    >
      {contentMask ? (
        <>
          <div ref={layerA}>{children}</div>
          {/* The second copy is decoration - the first one carries the page
              for a screen reader, and this must not be read out twice. */}
          <div ref={layerB} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
            {children}
          </div>
        </>
      ) : (
        children
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "normal",
        }}
      />
    </div>
  )
}

/**
 * The watermark: the only layer here that a camera cannot average away.
 *
 * It drifts and re-phases so a photograph taken at any moment carries it
 * somewhere across the content, rather than in a corner that can be cropped.
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  text: string,
  reduced: boolean,
) {
  const t = reduced ? 0 : frame
  const size = Math.max(13, Math.round(width / 32))
  ctx.save()
  ctx.globalAlpha = 0.16
  ctx.fillStyle = "#b00020"
  ctx.font = `700 ${size}px sans-serif`
  ctx.textBaseline = "middle"

  const rows = Math.max(3, Math.round(height / (size * 4)))
  const spacing = height / rows
  // A slow drift, plus a slower phase wander, so consecutive photographs do
  // not carry an identical stamp in an identical place.
  const drift = (t * 0.25) % (width + 400)
  const wander = Math.sin(t / 400) * 40

  ctx.translate(width / 2, height / 2)
  ctx.rotate(-0.42)
  ctx.translate(-width / 2, -height / 2)

  for (let i = 0; i < rows; i++) {
    const y = spacing * (i + 0.5) + wander
    const offset = ((i % 2 === 0 ? drift : -drift) % (width + 400)) - 200
    ctx.fillText(`${text}    ${text}    ${text}`, offset - width * 0.4, y)
  }
  ctx.restore()
}
