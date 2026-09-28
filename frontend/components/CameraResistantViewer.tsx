"use client"

import { useEffect, useRef, useState } from "react"

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
export type PatternType =
  | "none"
  | "horizontal"
  | "vertical"
  | "diagonal"
  | "checker"
  | "random"
  | "moire"

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

/**
 * Builds the mask once, as an offscreen canvas.
 *
 * Pre-rendered rather than drawn per frame: at 60fps a full-page pattern drawn
 * line by line is enough work to miss frames, and a dropped frame breaks the
 * +delta/-delta pairing that the whole effect depends on - the average stops
 * being neutral and the human sees it flicker.
 */
function buildMask(
  type: PatternType,
  period: number,
  width: number,
  height: number,
  ink: string,
): HTMLCanvasElement | null {
  if (type === "none" || period <= 0) return null
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.ceil(width))
  c.height = Math.max(1, Math.ceil(height))
  const ctx = c.getContext("2d")
  if (!ctx) return null

  // Every pixel is painted, not only the pattern's own cells: the pattern in
  // `ink` and the gaps in the opposite tone. Painting only the cells left the
  // gaps untouched, so averaging the two phases did not cancel - it left the
  // pattern behind as a permanent veil, which the measurement showed as a
  // still-visible checker in the averaged image.
  ctx.fillStyle = ink === "#ffffff" ? "#000000" : "#ffffff"
  ctx.fillRect(0, 0, c.width, c.height)

  ctx.fillStyle = ink
  const p = Math.max(1, Math.round(period))

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
  } else if (type === "random") {
    // A fixed pseudo-random mask, not new noise each frame: the pairing needs
    // the two frames to use the SAME mask at opposite polarity.
    const img = ctx.createImageData(c.width, c.height)
    let seed = 0x2545f491
    for (let i = 0; i < img.data.length; i += 4) {
      seed ^= seed << 13
      seed ^= seed >>> 17
      seed ^= seed << 5
      // Full coverage here too: the cell takes `ink`, the gap its opposite.
      const on = (seed & 0xff) > 127
      const level = on === (ink === "#ffffff") ? 255 : 0
      img.data[i] = img.data[i + 1] = img.data[i + 2] = level
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  } else if (type === "moire") {
    // Two gratings at a slight angle to each other. Their beat frequency is
    // what a sensor aliases into coarse fringes; to the eye it is a fine
    // texture.
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
}: CameraResistantViewerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
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
    let maskLight: HTMLCanvasElement | null = null
    let maskDark: HTMLCanvasElement | null = null
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
      maskLight = buildMask(cfg.patternType, cfg.patternFrequency, width, height, "#ffffff")
      maskDark = buildMask(cfg.patternType, cfg.patternFrequency, width, height, "#000000")
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
      const mask = phase === 0 ? maskLight : maskDark
      if (mask && cfg.opacity > 0) {
        ctx.save()
        ctx.globalAlpha = cfg.opacity
        // A stationary grating is easy for the eye to lock onto and ignore,
        // and easy for a burst to average away, so it creeps.
        const drift = cfg.patternType === "moire" ? 0 : (frame % 120) / 120
        ctx.translate(0, drift * cfg.patternFrequency * 2)
        ctx.drawImage(mask, 0, 0, width, height)
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
  ])

  return (
    <div ref={hostRef} style={{ position: "relative", isolation: "isolate" }}>
      {children}
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
