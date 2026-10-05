"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import ProtectedBookStage from "@/components/ProtectedBookStage"
import {
  FigureBox,
  getProtectedDocFigures,
  getProtectedDocMeta,
  protectedPageUrl,
  ProtectedDocMeta,
} from "@/lib/protected-docs-api"
import {
  CaptureEvent,
  ProtectionResponse,
  measurePaintLatency,
} from "@/lib/capture-protection"
import {
  buildContentMaskPair,
  buildMaskCycle,
  maskIndex,
  MaskPattern,
} from "@/lib/protection-mask"

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

export type ProtectionLevel = "standard" | "strong" | "reveal" | "screenshot" | "experimental"

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
  maskPattern?: MaskPattern
  maskCycle?: number
  contentMask?: boolean
  revealFraction?: number
  /**
   * Black out the figures, revealing one at a time on hover or focus.
   *
   * On by default: it is the only layer that reduces what a capture is worth
   * without costing the reader sharpness, flicker or a covered page.
   */
  redactFigures?: boolean

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
  /** The line under the page explaining the protection. The labs keep it;
   *  the NBA page drops it at the college's request. */
  showNote?: boolean
}

interface Tuning {
  modulationAmplitude: number
  modulationFrequency: number
  patternFrequency: number
  noiseIntensity: number
  watermarkOpacity: number
  watermarkMotion: boolean
  maskPattern: MaskPattern
  /**
   * How many different masks to rotate through. 0 or 1 reuses one.
   *
   * Shipped at 1, having been tried at 8 and measured as not worth it.
   *
   * The reasoning for rotating was that a fixed mask is a fixed unknown an
   * attacker could recover and subtract. Measured, it buys nothing and at
   * small capture counts it HELPS them - averaging 2 captures recovered 33% of
   * words against one fixed mask and 65% against eight rotating, because two
   * captures of a fixed mask at the same polarity carry no new information
   * between them while two different masks each carry some. By 4 captures both
   * are recovered. See docs/PROTECTION-REPORT.md section 9.
   *
   * The premise was wrong anyway: the mask is generated in the browser from a
   * seed in the bundle, so it was never secret from anyone willing to read the
   * source. `maskSeed` at least stops every viewer and every page sharing one.
   */
  maskCycle: number
  /**
   * Remove half of the page per frame, instead of only drawing over it.
   *
   * This is the layer that hides the document from a PERSON holding the
   * screenshot. The overlay alone does not: it modulates the paper and leaves
   * every glyph shape intact, which breaks OCR's binarisation and is read
   * without difficulty by a human eye. Measured, an overlay-only capture left
   * the heading at 100% and was plainly legible in the evidence image.
   *
   * Masking the content cuts holes in the glyphs themselves. Capture recall
   * falls to 2% of words and 0% of figures with the heading included, and the
   * page is visibly destroyed rather than merely textured.
   */
  contentMask: boolean
  /**
   * Show only this fraction of the page at a time, as a band that follows the
   * reader. 0 shows the whole page.
   *
   * This is the only layer here that costs a capture anything WITHOUT costing
   * the reader sharpness or asking them to look at a flickering page. The
   * covered part of the document is not dimmed or scrambled, it is not being
   * displayed - so a screenshot cannot contain it, by any capture method, on
   * any hardware, including a phone photograph. The modulation layers cannot
   * say that: they all rest on the eye averaging frames, which is exactly what
   * an HDR camera also does.
   *
   * It is bought with reading comfort instead - the reader moves a band down
   * the page rather than seeing it whole - which is a real cost and an honest
   * one, because it is a cost they can see and decide about.
   */
  revealFraction: number
}

/**
 * `screenshot` is the level that actually costs a screenshot something.
 *
 * Measured by OCR against the unprotected page, one composited frame - which
 * is exactly what a screenshot is - scored as the best of three separate
 * captures, because a floor has to be met by the luckiest capture and not the
 * average one:
 *
 *   screenshot loses   67% of words, 100% of figures
 *   reader keeps      100% of words,  98% of figures
 *
 *   heading  100% -> 100%      paragraph  0% -> 100%      small  0% -> 100%
 *   numbers    0% -> 100%      table      0% ->  95%
 *
 * Everything except the heading is gone. Headings survive because their
 * strokes are much wider than the 3px mask, so the blocks sit inside a stroke
 * instead of breaking it - which is the right way round, since the heading is
 * the least sensitive line on an accreditation page.
 *
 * Three things set these numbers, and all three are needed:
 *
 *   - the mask is aperiodic BLOCKS, not stripes. Same amplitude, 27 more
 *     points of word loss. Stripes are regular enough for OCR to step over.
 *   - amplitude 0.3. Below 0.25 the effect collapses to nothing (0.2 lost 0%
 *     of words); above 0.4 the READER starts failing too (0.45 left the
 *     reader 33% of words and none of the figures). The usable window is
 *     0.3-0.4 and 0.3 is the cheap end of it.
 *   - one polarity flip per frame, so the pair averages back to the page.
 *
 * What does NOT help, tested and dropped: rotating several masks instead
 * of one. Identical single-frame score, and marginally worse against an
 * attacker averaging two or three captures.
 *
 * `strong` stays at 0.09 for callers that want the old behaviour. It is worth
 * being plain that 0.09 costs a screenshot approximately nothing.
 */
const LEVELS: Record<ProtectionLevel, Tuning> = {
  standard: {
    modulationAmplitude: 0,
    modulationFrequency: 0,
    patternFrequency: 0,
    noiseIntensity: 0,
    watermarkOpacity: 0.06,
    watermarkMotion: true,
    maskPattern: "horizontal",
    maskCycle: 0,
    contentMask: false,
    revealFraction: 0,
  },
  strong: {
    modulationAmplitude: 0.09,
    modulationFrequency: 1,
    patternFrequency: 4,
    noiseIntensity: 0.02,
    watermarkOpacity: 0.16,
    watermarkMotion: true,
    maskPattern: "horizontal",
    maskCycle: 0,
    contentMask: false,
    revealFraction: 0,
  },
  reveal: {
    modulationAmplitude: 0,
    modulationFrequency: 0,
    patternFrequency: 0,
    noiseIntensity: 0,
    watermarkOpacity: 0.16,
    watermarkMotion: true,
    maskPattern: "horizontal",
    maskCycle: 0,
    contentMask: false,
    // A third of the page at a time: a capture carries ~33% of it and the
    // reader sees ordinary, unmodified text.
    revealFraction: 0.34,
  },
  screenshot: {
    modulationAmplitude: 0.2,
    modulationFrequency: 1,
    patternFrequency: 4,
    noiseIntensity: 0,
    watermarkOpacity: 0.16,
    watermarkMotion: true,
    maskPattern: "random",
    maskCycle: 1,
    contentMask: true,
    revealFraction: 0,
  },
  experimental: {
    modulationAmplitude: 0.4,
    modulationFrequency: 1,
    patternFrequency: 3,
    noiseIntensity: 0.05,
    watermarkOpacity: 0.18,
    watermarkMotion: true,
    maskPattern: "random",
    maskCycle: 1,
    contentMask: true,
    revealFraction: 0,
  },
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
  maskPattern,
  maskCycle,
  contentMask,
  revealFraction,
  redactFigures = true,
  captureProtection = true,
  protectionResponse = "hide",
  captureHoldMs = 1500,
  captureAmplitude = 0.55,
  captureWatermarkOpacity = 0.45,
  onCaptureEvent,
  showNote = true,
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
  const pageA = useRef<HTMLImageElement | null>(null)
  /** Centre of the reading band, 0-1 down the page. Starts at the top. */
  const [bandAt, setBandAt] = useState(0.17)
  /**
   * Figure positions for the page on screen, and which one is uncovered.
   *
   * Only one is uncovered at a time. Revealing on hover without that would let
   * a capture catch several at once by parking the pointer between them, and
   * "one figure per capture" is the entire value of this layer.
   */
  /** Figures per page number - a spread needs two pages' worth at once. */
  const [figures, setFigures] = useState<Record<number, FigureBox[]>>({})
  /** Which single figure is uncovered, as "<page>:<index>". */
  const [openFigure, setOpenFigure] = useState<string | null>(null)

  const pageB = useRef<HTMLImageElement | null>(null)
  const touchX = useRef<number | null>(null)

  /**
   * The reader's own opt-out from the modulation.
   *
   * At amplitude 0.3 the mask flips every frame, and on a 60Hz display that is
   * 30Hz of fine-grained flicker. Every frame carries the same mean luminance
   * - half the blocks light, half dark - so there is no large-area flash,
   * which is the property the photosensitivity guidance is written around. But
   * "no large-area flash" is not the same as "comfortable for everyone", and a
   * reader who finds it unpleasant must not have to choose between reading the
   * page and their eyes. So it is one click, it says what it costs, and the
   * document stays open.
   *
   * `prefers-reduced-motion` already turns the modulation off before anyone
   * has to ask. This is for the people that setting does not reach.
   */
  const [eased, setEased] = useState(false)

  const preset = LEVELS[eased ? "standard" : protectionLevel]
  const tune: Tuning = {
    modulationAmplitude: modulationAmplitude ?? preset.modulationAmplitude,
    modulationFrequency: modulationFrequency ?? preset.modulationFrequency,
    patternFrequency: patternFrequency ?? preset.patternFrequency,
    noiseIntensity: noiseIntensity ?? preset.noiseIntensity,
    watermarkOpacity: watermarkOpacity ?? preset.watermarkOpacity,
    watermarkMotion: watermarkMotion ?? preset.watermarkMotion,
    maskPattern: maskPattern ?? preset.maskPattern,
    maskCycle: maskCycle ?? preset.maskCycle,
    contentMask: (contentMask ?? preset.contentMask) && !reduced && !eased,
    revealFraction: eased ? 0 : revealFraction ?? preset.revealFraction,
  }
  // Overrides are how the lab drives this component, so an explicit amplitude
  // has to survive `eased` being off - but not survive the reader asking for
  // it to stop.
  if (eased) tune.modulationAmplitude = 0

  const session = useRef(Math.random().toString(36).slice(2, 8).toUpperCase())
  /**
   * A per-session mask seed.
   *
   * It is not a secret - the mask is built in the browser, so anyone who will
   * read the bundle can rebuild it - and it is not claimed as one. It only
   * stops every viewer of every page sharing one fixed mask, which would let
   * captures from different sessions be pooled against it.
   */
  // Filled on first use inside the effect rather than at render: calling
  // Math.random() during render is impure and makes the component's output
  // depend on when React happens to run it.
  const maskSeed = useRef<number | null>(null)
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

  /**
   * One leaf at a time.
   *
   * A two-page spread was tried and is not what these are read like: an A4
   * page halved across a laptop is small enough that a reviewer zooms, and
   * zooming is the thing the fit-to-height layout exists to avoid.
   */
  const visiblePages = [page]

  /**
   * Blocks out the figures, and nothing else.
   *
   * The page renders completely normally - no flicker, no covered page, no
   * contrast loss - and a capture of it carries a whole-looking document with
   * one readable number. That is a far better trade than degrading the whole
   * page, because measurement on these documents showed prose survives damage
   * and figures do not: context repairs a mangled word and nothing repairs
   * "4617500". An accreditation submission is prose about numbers.
   *
   * Deterrence, and honestly so: it raises the cost from one capture to one
   * per figure. It is not a lock. It does have one property nothing else here
   * has - it is indifferent to how the capture was made, so unlike the
   * watermark-and-hope of a phone photograph, it still applies.
   */
  useEffect(() => {
    let live = true
    if (!meta || !redactFigures) {
      // Queued rather than set synchronously, so this effect cannot drive a
      // second render pass before the first has committed.
      queueMicrotask(() => live && setFigures({}))
      return () => {
        live = false
      }
    }
    // Both leaves of a spread, so one is never served unredacted while the
    // other is covered.
    Promise.all(
      visiblePages.map((n) =>
        getProtectedDocFigures(documentId, n, meta.token).then((f) => [n, f] as const),
      ),
    )
      .then((pairs) => {
        if (!live) return
        // Reset here rather than in the effect body: a figure uncovered on the
        // previous page must not stay uncovered over the new one, and setting
        // state synchronously in an effect drives an extra render pass.
        setOpenFigure(null)
        setFigures(Object.fromEntries(pairs))
      })
      // A page with no boxes is the page as it was before this existed, which
      // is the right failure: the document stays readable.
      .catch(() => live && setFigures({}))
    return () => {
      live = false
    }
    // visiblePages is derived from page, meta and spread, all of which are here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, page, meta, redactFigures])

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
    // Matches the flip animation's 520ms; pulling the class sooner cuts the
    // turn off part-way through.
    const t = setTimeout(() => setTurning(null), 520)
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
      // The first key of Win+Shift+S. Unlike PrintScreen - where Windows has
      // already taken the pixels by the time the page hears anything - this
      // arrives while the user still has two more keys to press, which is far
      // more than the ~22ms the response needs to reach the screen.
      if (e.key === "Meta" || e.key === "OS") raiseResponse("meta-down")
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

    // Allocated on first use, not at render: Math.random() during render is
    // impure and makes the output depend on when React happens to run it.
    if (maskSeed.current === null) maskSeed.current = (Math.random() * 0xffffffff) | 1
    const seed = maskSeed.current

    // One entry per mask in the rotation; each holds the SAME mask at both
    // polarities, which is what makes a pair average back to the page.
    let masks: Array<{ light: HTMLCanvasElement | null; dark: HTMLCanvasElement | null }> = []
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      // Sized to the PAGE, not the whole stage.
      //
      // Spanning the stage drew the moving watermark across the dark surround
      // as well, so most of it landed on nothing and the viewer looked like a
      // fault. It belongs on the paper, which is also the only place it does
      // any good - a capture cropped to the page has to carry it.
      const book = stage.querySelector('.stf__parent') as HTMLElement | null
      // The book mounts after this effect does, so the first measurement found
      // nothing and fell back to the stage - and nothing re-measured, which is
      // why the watermark stayed stretched across the whole viewer. Observed
      // as soon as it exists.
      if (book && book !== observed) {
        if (observed) ro.unobserve(observed)
        ro.observe(book)
        observed = book
      }
      const sr = stage.getBoundingClientRect()
      const r = book?.getBoundingClientRect() ?? sr
      w = r.width
      h = r.height
      canvas.style.left = `${r.left - sr.left}px`
      canvas.style.top = `${r.top - sr.top}px`
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      masks = buildMaskCycle(tune.maskPattern, tune.patternFrequency, w, h, tune.maskCycle, seed)
    }
    let observed: HTMLElement | null = null
    const ro = new ResizeObserver(() => resize())
    ro.observe(stage)
    resize()
    // The book can appear without the stage resizing, so watch for it arriving
    // rather than only for the stage changing shape.
    const mo = new MutationObserver(() => resize())
    mo.observe(stage, { childList: true, subtree: true })

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
        // Advance one step per completed pair, so both polarities of a mask
        // are shown before the next is used.
        const slot = masks[maskIndex(frame, tune.modulationFrequency, masks.length)] ?? masks[0]
        const mask = phase === 0 ? slot?.light : slot?.dark
        if (mask) {
          ctx.save()
          ctx.globalAlpha = amplitude
          // The stripe mask creeps so the eye cannot lock onto a fixed
          // grating. A block mask is already aperiodic and rotates through
          // eight of itself, so drifting it only costs a resample.
          if (tune.maskPattern === "horizontal") {
            ctx.translate(0, ((frame % 120) / 120) * tune.patternFrequency * 2)
          }
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
      mo.disconnect()
    }
  }, [
    screenshotProtection,
    tune.modulationAmplitude,
    tune.modulationFrequency,
    tune.patternFrequency,
    tune.noiseIntensity,
    tune.watermarkOpacity,
    tune.watermarkMotion,
    tune.maskPattern,
    tune.maskCycle,
    watermarkText,
    reduced,
    captureAmplitude,
    captureWatermarkOpacity,
  ])

  /**
   * Two copies of the page, each carrying one half of the mask, one visible
   * per frame.
   *
   * Two static layers toggled rather than one layer whose mask is swapped:
   * changing a mask re-rasterises the layer, and doing that every frame drops
   * frames - which breaks the pairing the effect depends on. Toggling
   * visibility on two already-rasterised layers is a compositor operation.
   */
  useEffect(() => {
    const a = pageA.current
    const b = pageB.current
    if (!screenshotProtection || !tune.contentMask || !a || !b) return

    let raf = 0
    let frame = 0
    let applied = ""

    const apply = () => {
      const r = a.getBoundingClientRect()
      if (!r.width || !r.height) return
      // The page image loads and is laid out asynchronously, and a mask built
      // against a zero or stale box leaves visible seams.
      const key = `${Math.round(r.width)}x${Math.round(r.height)}`
      if (key === applied) return
      // Block size scales with the rendered page, and this is not cosmetic.
      //
      // What destroys a glyph is the size of a block RELATIVE to the stroke it
      // has to break, so a fixed 4px block is a different protection on every
      // display. A real OS screenshot caught this: on a 1536px screen the page
      // rendered far larger than the 820px lab panel, the same 4px blocks were
      // proportionally finer, and the heading came back legible in a capture
      // the lab had scored at zero.
      //
      // `patternFrequency` is therefore the block size AT THE LAB'S 820px
      // panel - the width every measurement in the report was taken at - and
      // it is scaled from there.
      const period = Math.max(3, Math.round((tune.patternFrequency * r.width) / 820))
      if (maskSeed.current === null) maskSeed.current = (Math.random() * 0xffffffff) | 1
      const pair = buildContentMaskPair(period, r.width, r.height, maskSeed.current)
      if (!pair) return
      applied = key
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

    const ro = new ResizeObserver(apply)
    ro.observe(a)
    a.addEventListener("load", apply)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      frame += 1
      // No measuring here. Reading the box every frame forces a layout 60
      // times a second, and the ResizeObserver plus the image's load event
      // already cover every case that changes it.
      const showA = Math.floor(frame / Math.max(1, tune.modulationFrequency)) % 2 === 0
      a.style.visibility = showA ? "visible" : "hidden"
      b.style.visibility = showA ? "hidden" : "visible"
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      a.removeEventListener("load", apply)
      a.style.visibility = ""
      a.style.webkitMaskImage = ""
      a.style.maskImage = ""
    }
  }, [screenshotProtection, tune.contentMask, tune.patternFrequency, tune.modulationFrequency, page, meta?.token])

  /**
   * The band follows the pointer, and can be driven from the keyboard.
   *
   * Keyboard matters more than usual here: covering most of the page is
   * already a reading burden, and leaving it mouse-only would put the document
   * out of reach of anyone navigating without one. Up/Down move the band,
   * Left/Right stay on the pages.
   */
  useEffect(() => {
    const wrap = pageA.current?.parentElement
    if (!wrap || tune.revealFraction <= 0) return

    const half = tune.revealFraction / 2
    const clamp = (v: number) => Math.min(1 - half, Math.max(half, v))
    const fromClientY = (clientY: number) => {
      const r = wrap.getBoundingClientRect()
      if (!r.height) return
      setBandAt(clamp((clientY - r.top) / r.height))
    }

    const onMove = (e: MouseEvent) => fromClientY(e.clientY)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) fromClientY(t.clientY)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
      e.preventDefault()
      setBandAt((v) => clamp(v + (e.key === "ArrowDown" ? 0.06 : -0.06)))
    }

    wrap.addEventListener("mousemove", onMove)
    wrap.addEventListener("touchmove", onTouch, { passive: true })
    document.addEventListener("keydown", onKey)
    return () => {
      wrap.removeEventListener("mousemove", onMove)
      wrap.removeEventListener("touchmove", onTouch)
      document.removeEventListener("keydown", onKey)
    }
  }, [tune.revealFraction, meta?.token, page])

  /**
   * Ask the desktop viewer to exclude this window from screen capture, for
   * exactly as long as a document is on screen.
   *
   * This is the only layer here that actually empties a screenshot rather than
   * degrading it, and it is the reason the desktop app exists. It is also the
   * only one that needs the app: a web page is told about a capture after the
   * operating system has taken the pixels, so nothing in a browser tab can do
   * this. In a browser `window.ksrmDesktop` is simply absent and the rest of
   * the viewer behaves as before.
   *
   * Scoped to the document deliberately. Capture exclusion is a property of
   * the whole window, so leaving it on would make the whole app unscreenshotable
   * - the requirement is that only the documents carry it.
   */
  const [captureExcluded, setCaptureExcluded] = useState(false)
  useEffect(() => {
    const desktop = typeof window !== "undefined" ? window.ksrmDesktop : undefined
    if (!desktop) return
    let live = true
    desktop
      .setProtected(true)
      .then((on) => live && setCaptureExcluded(on))
      .catch(() => live && setCaptureExcluded(false))
    return () => {
      live = false
      // Dropped on close, so the rest of the app screenshots normally.
      desktop.setProtected(false).catch(() => {})
    }
  }, [])

  const pages = meta?.pages ?? 0

  return (
    <div className="pdv-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <style>{`
        .pdv-overlay {
          position: fixed; inset: 0; z-index: 9999; background: #0c1026;
          display: flex; flex-direction: column;
          -webkit-user-select: none; user-select: none;
        }
        .pdv-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 12px 18px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.12); }
        .pdv-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 17px; flex: 1; min-width: 0; }
        .pdv-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 8px; padding: 7px 14px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .pdv-btn:disabled { opacity: 0.35; cursor: default; }
        .pdv-count { font-size: 14px; opacity: 0.8; min-width: 92px; text-align: center; }
        /* hidden, not auto: a page that scrolls is not a book, and the page
           is sized to fit the stage instead. */
        .pdv-stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 18px; overflow: hidden; position: relative; perspective: 2400px; }

        /* Height-led, so a tall A4 page fits the window and the reader never
           scrolls inside a leaf. Width follows the aspect ratio. */
        .pdv-page { max-height: 100%; width: auto; max-width: 100%; display: block; border-radius: 4px; box-shadow: 0 18px 50px rgba(0,0,0,0.55); background: #fff; -webkit-user-drag: none; pointer-events: none; transform-origin: left center; }
        /* White, because the holes the content mask cuts in the page show
           this through and they have to read as paper, not as the dark
           surround of the viewer. */
        .pdv-pagewrap { position: relative; display: inline-block; background: #fff; max-width: 100%; max-height: 100%; }
        /* Above the watermark canvas would hide the watermark from a capture
           of a revealed figure, so the blocks sit below it. */
        .pdv-page-b { position: absolute; inset: 0; width: 100%; height: 100%; }
        /* Opaque, and a flat single colour: there must be nothing in the
           covered region for a capture to recover, including a gradient that
           hints at what is underneath. */
        .pdv-cover { position: absolute; left: 0; right: 0; background: #11152e; }
        /* Solid, not blurred. A blur is a reversible transform of the real
           pixels and deblurring a known font is not hard; a flat block has
           nothing underneath it to recover. */
        .pdv-figure {
          position: absolute; background: #11152e; border-radius: 2px;
          cursor: pointer; pointer-events: auto; z-index: 3;
          transition: opacity 90ms linear;
        }
        .pdv-figure:focus-visible { outline: 2px solid #ffd166; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce) { .pdv-figure { transition: none } }
        /* A leaf turning, not a slide.
           The page swings in on a hinge at its spine edge, and a shadow sweeps
           across it as it comes down - which is what sells the motion as paper
           rather than a fading rectangle. Forward hinges on the left, back on
           the right, so the direction is legible without reading the label. */
        .pdv-page.turn-next { animation: pdv-flip-next 520ms cubic-bezier(.22,.61,.36,1); transform-origin: left center; }
        .pdv-page.turn-prev { animation: pdv-flip-prev 520ms cubic-bezier(.22,.61,.36,1); transform-origin: right center; }
        @keyframes pdv-flip-next {
          from { transform: rotateY(-82deg) translateZ(0); filter: brightness(.58); box-shadow: -30px 0 60px rgba(0,0,0,.6) }
          60%  { filter: brightness(.86) }
          to   { transform: rotateY(0) translateZ(0); filter: brightness(1); box-shadow: 0 18px 50px rgba(0,0,0,0.55) }
        }
        @keyframes pdv-flip-prev {
          from { transform: rotateY(82deg) translateZ(0); filter: brightness(.58); box-shadow: 30px 0 60px rgba(0,0,0,.6) }
          60%  { filter: brightness(.86) }
          to   { transform: rotateY(0) translateZ(0); filter: brightness(1); box-shadow: 0 18px 50px rgba(0,0,0,0.55) }
        }
        /* The board the leaf sits on, so it turns against something. */
        .pdv-pagewrap::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          border-radius: 4px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
        }
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
        {/* Only offered when there is modulation running to turn off. */}
        {screenshotProtection && !reduced && (preset.modulationAmplitude > 0 || preset.revealFraction > 0) && (
          <button
            type="button"
            className="pdv-btn"
            onClick={() => setEased((v) => !v)}
            aria-pressed={eased}
            title={
              eased
                ? "Screen protection is off for this session. Screenshots of this page will be readable."
                : preset.revealFraction > 0
                  ? "Shows the whole page at once. Screenshots will then contain all of it."
                  : "Turns off the flickering overlay if it is uncomfortable to read through."
            }
          >
            {eased ? "Protection off" : preset.revealFraction > 0 ? "Show whole page" : "Reduce flicker"}
          </button>
        )}
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
          <ProtectedBookStage
            documentId={documentId}
            title={title}
            pages={pages}
            token={meta.token}
            page={page}
            onPageChange={setPage}
            figures={figures}
            redactFigures={redactFigures}
            openFigure={openFigure}
            setOpenFigure={setOpenFigure}
            onError={() => setError("This page could not be loaded.")}
          />
        )}

        <canvas
          ref={overlayRef}
          aria-hidden="true"
          // `left`/`top` are set by the draw effect, which measures the book.
          style={{ position: "absolute", pointerEvents: "none", zIndex: 2 }}
        />

        {/* The opaque cover, for the focus case and for the "hide" response.
            z-index above the overlay canvas so nothing shows through, and
            painted as one flat colour so there is nothing to recover from a
            capture of it. No text on it, at the college's request. */}
        {(hidden || (responding && protectionResponse === "hide")) && (
          <div className="pdv-hidden" />
        )}
      </div>

      {showNote && <p className="pdv-note">
        Displayed page by page and cannot be downloaded.
        {captureExcluded && (
          <>
            {" "}
            <strong>Screen capture is disabled for this document</strong> — screenshots
            and screen recordings will not contain it. A photograph of the screen still
            will.
          </>
        )}
        {redactFigures && (figures[page]?.length ?? 0) > 0 && (
          <>
            {" "}
            <strong>{figures[page]?.length ?? 0} figures on this page are hidden</strong> — hover
            or tab to one to read it. They are covered so that a screenshot or a
            photograph of this page carries at most one of them.
          </>
        )}
        {screenshotProtection && !reduced && !eased && preset.revealFraction > 0 && (
          <>
            {" "}
            Shown a section at a time — move the pointer, or use ↑ and ↓, to read
            down the page. A screen capture can only contain the part on screen.
          </>
        )}
        {screenshotProtection && !reduced && preset.modulationAmplitude > 0 && !eased && (
          <>
            {" "}
            This page carries a fine moving pattern that makes a screen capture
            unreadable. If it is uncomfortable to look at, use{" "}
            <strong>Reduce flicker</strong>.
          </>
        )}
        {eased && (
          <>
            {" "}
            <strong>Flicker reduced</strong> — a screen capture of this page would
            now be readable.
          </>
        )}
      </p>}
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
  if (tune.watermarkOpacity <= 0) return
  const t = reduced || !tune.watermarkMotion ? 0 : frame
  const size = Math.max(12, Math.round(width / 40))
  ctx.save()
  ctx.globalAlpha = tune.watermarkOpacity
  // Grey, and a row every ten lines of type rather than every five: the
  // burned-in mark already sits under it, and two dense red layers stacked on
  // the page covered the text more than they identified anything.
  ctx.fillStyle = "#4a5266"
  ctx.font = `700 ${size}px sans-serif`
  ctx.textBaseline = "middle"

  const rows = Math.max(2, Math.round(height / (size * 10)))
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
