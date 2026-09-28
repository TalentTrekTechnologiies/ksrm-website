"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getProtectedDocMeta,
  protectedPageUrl,
  ProtectedDocMeta,
} from "@/lib/protected-docs-api"
import {
  CaptureEvent,
  ProtectionResponse,
  measurePaintLatency,
} from "@/lib/capture-protection"

/**
 * Reads a protected document without handing it over, and makes a capture of
 * it worth less than the document.
 *
 * Six layers, and it matters which are locks and which are friction:
 *
 *   1. Private storage. The file sits outside the web root and is read only
 *      through the backend's storage adapter. There is no public URL.
 *   2. Rendered pages. The PDF is rasterised server-side; the browser receives
 *      one flattened JPEG per page behind a signed link that expires. Nothing
 *      on the device is the document.
 *   3. Browser actions off. Right-click, selection, drag, copy, Ctrl+S/P/C/U,
 *      and printing. Friction, not a lock - devtools bypasses all of it.
 *   4. Capture degradation. A pattern drawn at +delta on one frame and -delta
 *      on the next: the eye integrates the pair to a flat veil, a single short
 *      exposure catches one polarity as stripes. Friction, and measurably weak
 *      at comfortable amplitudes - see docs/CAMERA-RESISTANCE.md, where OCR
 *      recovered 98% of words from the strongest readable setting.
 *   5. Forensic watermark. Burned into the page image by the server, and drawn
 *      again client-side over the top, drifting. This is the layer that
 *      actually survives a screenshot, an HDR photo and a video frame alike.
 *   6. Focus cover. Hidden the moment the window loses focus, which catches
 *      the capture tools that take focus when they open.
 *
 * Layers 1 and 2 are real controls. Layers 3, 4 and 6 are deterrence and are
 * described as such so nobody later mistakes them for guarantees. Layer 5 is
 * the one to rely on: it makes a leak attributable rather than impossible.
 */

export type ProtectionLevel = "standard" | "strong" | "experimental"

export interface ProtectedDocumentViewerProps {
  documentId: number
  title: string
  onClose: () => void
  /** Master switch. Off leaves layers 1 and 2 and drops the rest. */
  screenshotProtection?: boolean
  protectionLevel?: ProtectionLevel
  /** Shown in the moving watermark. Keep it to a role or a label, not a person's details. */
  viewerLabel?: string
  /** Tuning, for the lab. Anything set here overrides the level's preset. */
  modulationAmplitude?: number
  modulationFrequency?: number
  patternFrequency?: number
  noiseIntensity?: number
  watermarkOpacity?: number
  watermarkMotion?: boolean

  /* -------- capture response, layer 7 -------- */

  /** React to the browser events that sometimes accompany a capture. */
  captureProtection?: boolean
  /**
   * What reacting looks like.
   *
   *   hide      - opaque cover, document gone
   *   obscure   - blurred and darkened, watermark still legible over it
   *   watermark - document stays, pattern and watermark turned up hard
   */
  protectionResponse?: ProtectionResponse
  /** How long the response is held before the document returns. */
  captureHoldMs?: number
  /** Overlay strength while responding. Separate from the resting amplitude. */
  captureAmplitude?: number
  /** Watermark opacity while responding. */
  captureWatermarkOpacity?: number
  /** Every event, with the measured time to repaint. The lab records these. */
  onCaptureEvent?: (event: CaptureEvent) => void
}

interface Tuning {
  modulationAmplitude: number
  modulationFrequency: number
  patternFrequency: number
  noiseIntensity: number
  watermarkOpacity: number
  watermarkMotion: boolean
}

/**
 * Amplitudes are deliberately conservative.
 *
 * The sweep in docs/CAMERA-RESISTANCE.md found that separation only begins
 * around 0.4 - and at that strength a person sees pronounced flicker, which is
 * a comfort problem and a photosensitivity risk rather than a trade-off worth
 * making by default. "experimental" goes to 0.2 and no further; anything above
 * that belongs in the lab, on a willing tester, for a few seconds.
 */
const LEVELS: Record<ProtectionLevel, Tuning> = {
  standard: {
    modulationAmplitude: 0,
    modulationFrequency: 0,
    patternFrequency: 0,
    noiseIntensity: 0,
    watermarkOpacity: 0.14,
    watermarkMotion: true,
  },
  strong: {
    modulationAmplitude: 0.09,
    modulationFrequency: 1,
    patternFrequency: 4,
    noiseIntensity: 0.02,
    watermarkOpacity: 0.16,
    watermarkMotion: true,
  },
  experimental: {
    modulationAmplitude: 0.2,
    modulationFrequency: 1,
    patternFrequency: 3,
    noiseIntensity: 0.05,
    watermarkOpacity: 0.18,
    watermarkMotion: true,
  },
}

/** Both phases cover every pixel, so averaging them cancels to a flat veil. */
function buildPhase(period: number, w: number, h: number, light: boolean): HTMLCanvasElement | null {
  if (period <= 0) return null
  const c = document.createElement("canvas")
  c.width = Math.max(1, Math.ceil(w))
  c.height = Math.max(1, Math.ceil(h))
  const ctx = c.getContext("2d")
  if (!ctx) return null
  const p = Math.max(1, Math.round(period))
  ctx.fillStyle = light ? "#000000" : "#ffffff"
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = light ? "#ffffff" : "#000000"
  for (let y = 0; y < c.height; y += p * 2) ctx.fillRect(0, y, c.width, p)
  return c
}

export default function ProtectedDocumentViewer({
  documentId,
  title,
  onClose,
  screenshotProtection = true,
  protectionLevel = "strong",
  viewerLabel = "VIEW ONLY",
  modulationAmplitude,
  modulationFrequency,
  patternFrequency,
  noiseIntensity,
  watermarkOpacity,
  watermarkMotion,
  captureProtection = true,
  protectionResponse = "hide",
  captureHoldMs = 1500,
  captureAmplitude = 0.55,
  captureWatermarkOpacity = 0.45,
  onCaptureEvent,
}: ProtectedDocumentViewerProps) {
  const [meta, setMeta] = useState<ProtectedDocMeta | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  /**
   * Responding to a possible capture.
   *
   * Separate from `hidden` because the two have different causes and different
   * cures: `hidden` is the window not being in front, which ends when focus
   * returns; this ends on a timer, because the event that triggered it - a
   * PrintScreen keyup, say - carries no "finished" to wait for.
   */
  const [hidden, setHidden] = useState(false)
  const [responding, setResponding] = useState(false)
  const respondingRef = useRef(false)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [turning, setTurning] = useState<"next" | "prev" | null>(null)
  const [reduced, setReduced] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)
  const touchX = useRef<number | null>(null)

  const preset = LEVELS[protectionLevel]
  const tune: Tuning = {
    modulationAmplitude: modulationAmplitude ?? preset.modulationAmplitude,
    modulationFrequency: modulationFrequency ?? preset.modulationFrequency,
    patternFrequency: patternFrequency ?? preset.patternFrequency,
    noiseIntensity: noiseIntensity ?? preset.noiseIntensity,
    watermarkOpacity: watermarkOpacity ?? preset.watermarkOpacity,
    watermarkMotion: watermarkMotion ?? preset.watermarkMotion,
  }

  const session = useRef(Math.random().toString(36).slice(2, 8).toUpperCase())
  const [stamp, setStamp] = useState("")
  useEffect(() => {
    const tick = () =>
      setStamp(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", timeStyle: "short", dateStyle: "medium" }))
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  /* -------- Layer 1 + 2: private storage, rendered pages, expiring link ---- */

  useEffect(() => {
    let cancelled = false
    getProtectedDocMeta(documentId)
      .then((m) => !cancelled && setMeta(m))
      .catch(() => !cancelled && setError("This document could not be opened."))
    return () => {
      cancelled = true
    }
  }, [documentId])

  // The permit expires; renewing it before it does keeps a long read from
  // dying mid-document.
  useEffect(() => {
    if (!meta) return
    const id = setTimeout(
      () => {
        getProtectedDocMeta(documentId)
          .then(setMeta)
          .catch(() => setError("This document's link expired and could not be renewed."))
      },
      Math.max(30_000, meta.expiresInMs - 60_000),
    )
    return () => clearTimeout(id)
  }, [meta, documentId])

  const go = useCallback(
    (delta: number) => {
      if (!meta) return
      setPage((p) => {
        const next = Math.min(Math.max(p + delta, 1), meta.pages)
        if (next !== p) setTurning(delta > 0 ? "next" : "prev")
        return next
      })
    },
    [meta],
  )

  useEffect(() => {
    if (!turning) return
    const t = setTimeout(() => setTurning(null), 320)
    return () => clearTimeout(t)
  }, [turning, page])

  /**
   * Raises the response and measures how long it took to be painted.
   *
   * The latency is the whole point of recording it: reacting to an event is
   * only worth anything if the new pixels are on screen before the operating
   * system grabs the old ones, and for most capture methods they are not.
   */
  const raiseResponse = useCallback(
    (kind: CaptureEvent["kind"]) => {
      if (!captureProtection) return
      const at = performance.now()
      respondingRef.current = true
      setResponding(true)
      measurePaintLatency(at, (paintLatencyMs) =>
        onCaptureEvent?.({ kind, at, paintLatencyMs }),
      )
      if (holdTimer.current) clearTimeout(holdTimer.current)
      holdTimer.current = setTimeout(() => {
        respondingRef.current = false
        setResponding(false)
      }, captureHoldMs)
    },
    [captureProtection, captureHoldMs, onCaptureEvent],
  )

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current)
    },
    [],
  )

  /* -------- Layer 3 + 6: browser actions, and the focus cover ------------- */

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose()
      if (e.key === "ArrowRight") return go(1)
      if (e.key === "ArrowLeft") return go(-1)
      if (!screenshotProtection) return
      // Both, because Windows delivers keyup for this key and frequently not
      // keydown - and keyup arrives after the framebuffer has been taken, so
      // this protects the next capture rather than the one just made.
      if (e.key === "PrintScreen") raiseResponse("printscreen-down")
      const mod = e.ctrlKey || e.metaKey
      if (mod && ["p", "s", "c", "u"].includes(e.key.toLowerCase())) e.preventDefault()
    }
    document.addEventListener("keydown", onKeyDown)

    if (!screenshotProtection) return () => document.removeEventListener("keydown", onKeyDown)

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") raiseResponse("printscreen-up")
    }
    const hide = () => {
      setHidden(true)
      raiseResponse("blur")
    }
    const show = () => setHidden(false)
    const onVisibility = () => {
      const gone = document.visibilityState !== "visible"
      setHidden(gone)
      if (gone) raiseResponse("visibility")
    }
    const block = (e: Event) => e.preventDefault()

    document.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", hide)
    window.addEventListener("focus", show)
    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("contextmenu", block)
    document.addEventListener("copy", block)
    document.addEventListener("dragstart", block)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", hide)
      window.removeEventListener("focus", show)
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("contextmenu", block)
      document.removeEventListener("copy", block)
      document.removeEventListener("dragstart", block)
    }
  }, [go, onClose, screenshotProtection, raiseResponse])

  /* -------- Layer 4 + 5: modulation, noise, and the moving watermark ------ */

  const watermarkText = `KSRM COLLEGE · VIEW ONLY · ${viewerLabel} · ${session.current} · ${stamp}`

  useEffect(() => {
    const stage = stageRef.current
    const canvas = overlayRef.current
    if (!stage || !canvas || !screenshotProtection) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let light: HTMLCanvasElement | null = null
    let dark: HTMLCanvasElement | null = null
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const r = stage.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      light = buildPhase(tune.patternFrequency, w, h, true)
      dark = buildPhase(tune.patternFrequency, w, h, false)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(stage)

    let frame = 0
    let raf = 0
    const draw = () => {
      raf = requestAnimationFrame(draw)
      frame += 1
      ctx.clearRect(0, 0, w, h)

      // Read through the ref, not through state: raising the response has to
      // reach the very next frame, and waiting for a re-render would add one.
      const escalated = respondingRef.current
      const amplitude = escalated ? captureAmplitude : tune.modulationAmplitude
      const modulating = tune.modulationFrequency > 0 && amplitude > 0 && !reduced
      if (modulating) {
        const phase = Math.floor(frame / tune.modulationFrequency) % 2
        const mask = phase === 0 ? light : dark
        if (mask) {
          ctx.save()
          ctx.globalAlpha = amplitude
          ctx.translate(0, ((frame % 120) / 120) * tune.patternFrequency * 2)
          ctx.drawImage(mask, 0, 0, w, h)
          ctx.restore()
        }
      }

      if (tune.noiseIntensity > 0 && !reduced) {
        // Sparse dots rather than full-frame noise: a per-pixel pass at 60fps
        // costs more than it degrades, and the dots are what interfere with
        // glyph edges in a single capture.
        ctx.save()
        ctx.globalAlpha = tune.noiseIntensity
        ctx.fillStyle = frame % 2 === 0 ? "#000" : "#fff"
        const dots = Math.round((w * h) / 4000)
        for (let i = 0; i < dots; i++) {
          ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
        }
        ctx.restore()
      }

      drawWatermark(
        ctx,
        w,
        h,
        frame,
        watermarkText,
        escalated ? { ...tune, watermarkOpacity: captureWatermarkOpacity } : tune,
        reduced,
      )
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [
    screenshotProtection,
    tune.modulationAmplitude,
    tune.modulationFrequency,
    tune.patternFrequency,
    tune.noiseIntensity,
    tune.watermarkOpacity,
    tune.watermarkMotion,
    watermarkText,
    reduced,
    captureAmplitude,
    captureWatermarkOpacity,
  ])

  const pages = meta?.pages ?? 0

  return (
    <div className="pdv-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <style>{`
        .pdv-overlay {
          position: fixed; inset: 0; z-index: 9999; background: rgba(12,16,38,0.94);
          display: flex; flex-direction: column;
          -webkit-user-select: none; user-select: none;
        }
        .pdv-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 18px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.12); }
        .pdv-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 17px; flex: 1; min-width: 0; }
        .pdv-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; padding: 7px 14px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .pdv-btn:disabled { opacity: 0.35; cursor: default; }
        .pdv-count { font-size: 14px; opacity: 0.8; min-width: 92px; text-align: center; }
        .pdv-stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 18px; overflow: auto; position: relative; perspective: 1800px; }
        .pdv-page { max-width: min(900px, 100%); max-height: 100%; display: block; border-radius: 4px; box-shadow: 0 18px 50px rgba(0,0,0,0.55); background: #fff; -webkit-user-drag: none; pointer-events: none; transform-origin: left center; }
        .pdv-page.turn-next { animation: pdv-turn-next 320ms ease-in; }
        .pdv-page.turn-prev { animation: pdv-turn-prev 320ms ease-out; }
        @keyframes pdv-turn-next { from { transform: rotateY(-38deg); opacity: .55 } to { transform: rotateY(0); opacity: 1 } }
        @keyframes pdv-turn-prev { from { transform: rotateY(38deg); opacity: .55 } to { transform: rotateY(0); opacity: 1 } }
        @media (prefers-reduced-motion: reduce) { .pdv-page.turn-next, .pdv-page.turn-prev { animation: none } }
        .pdv-hidden { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; background: #0c1026; color: rgba(255,255,255,0.75); font-size: 15px; z-index: 4; }
        .pdv-note { font-size: 12.5px; opacity: 0.6; padding: 0 18px 12px; color: #fff; }
        @media print { .pdv-overlay { display: none !important } body > *:not(.pdv-overlay) { display: none !important } }
      `}</style>

      <div className="pdv-bar">
        <span className="pdv-title">{title}</span>
        <button type="button" className="pdv-btn" onClick={() => go(-1)} disabled={page <= 1}>‹ Previous</button>
        <span className="pdv-count">{pages ? `${page} of ${pages}` : "…"}</span>
        <button type="button" className="pdv-btn" onClick={() => go(1)} disabled={!pages || page >= pages}>Next ›</button>
        <button type="button" className="pdv-btn" onClick={onClose}>Close</button>
      </div>

      <div
        ref={stageRef}
        className="pdv-stage"
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null }}
        onTouchEnd={(e) => {
          const start = touchX.current
          const end = e.changedTouches[0]?.clientX ?? null
          touchX.current = null
          if (start == null || end == null || Math.abs(end - start) < 45) return
          go(end < start ? 1 : -1)
        }}
      >
        {error ? (
          <p style={{ color: "rgba(255,255,255,0.8)" }}>{error}</p>
        ) : !meta ? (
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Opening…</p>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- watermarked page image behind an expiring link */
          <img
            key={`${page}-${meta.token}`}
            src={protectedPageUrl(documentId, page, meta.token)}
            alt={`${title} — page ${page} of ${pages}`}
            className={`pdv-page${turning ? ` turn-${turning}` : ""}`}
            draggable={false}
            // CSS filters on the element, not the physical display. Nothing
            // here touches monitor brightness, and nothing can.
            style={
              responding && protectionResponse === "obscure"
                ? { filter: "blur(14px) brightness(0.45)" }
                : undefined
            }
            onError={() => setError("This page could not be loaded.")}
          />
        )}

        <canvas
          ref={overlayRef}
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
        />

        {/* The opaque cover, for the focus case and for the "hide" response.
            z-index above the overlay canvas so nothing shows through, and
            painted as one flat colour so there is nothing to recover from a
            capture of it. */}
        {(hidden || (responding && protectionResponse === "hide")) && (
          <div className="pdv-hidden">
            <div>
              <strong style={{ display: "block", fontSize: 17, marginBottom: 6 }}>
                Protected content
              </strong>
              {hidden
                ? "Hidden while this window is not in focus. Return to this tab to keep reading."
                : "Hidden briefly after a possible screen capture."}
            </div>
          </div>
        )}
      </div>

      <p className="pdv-note">
        Displayed page by page and cannot be downloaded. Every page carries the address,
        session and time it was served.
      </p>
    </div>
  )
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  text: string,
  tune: Tuning,
  reduced: boolean,
) {
  const t = reduced || !tune.watermarkMotion ? 0 : frame
  const size = Math.max(12, Math.round(width / 40))
  ctx.save()
  ctx.globalAlpha = tune.watermarkOpacity
  ctx.fillStyle = "#b00020"
  ctx.font = `700 ${size}px sans-serif`
  ctx.textBaseline = "middle"

  const rows = Math.max(3, Math.round(height / (size * 5)))
  const spacing = height / rows
  const drift = (t * 0.25) % (width + 400)
  const wander = Math.sin(t / 400) * 40

  ctx.translate(width / 2, height / 2)
  ctx.rotate(-0.42)
  ctx.translate(-width / 2, -height / 2)
  for (let i = 0; i < rows; i++) {
    const y = spacing * (i + 0.5) + wander
    const offset = ((i % 2 === 0 ? drift : -drift) % (width + 400)) - 200
    ctx.fillText(`${text}    ${text}`, offset - width * 0.4, y)
  }
  ctx.restore()
}
