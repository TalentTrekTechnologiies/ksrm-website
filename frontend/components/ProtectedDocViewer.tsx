"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  getProtectedDocMeta,
  protectedPageUrl,
  ProtectedDocMeta,
} from "@/lib/protected-docs-api"

/**
 * Reads an accreditation document a page at a time, without ever handing the
 * document over.
 *
 * What this genuinely stops:
 *
 *   - Downloading. The PDF never leaves the server. Each page arrives as a
 *     flattened JPEG, so "Save image as" yields one picture of one page.
 *   - Copying text. There is no text - it is pixels.
 *   - Sharing a link to the file. There is no file URL to share.
 *   - Printing. Print styles blank the viewer.
 *
 * What it discourages but cannot stop, and the college should be told plainly:
 *
 *   - Screenshots. The capture happens in the operating system, which no web
 *     page can veto. The one exception on the web is DRM-protected video
 *     (Widevine/FairPlay - how Netflix blacks out a screenshot), which does not
 *     apply to images or documents and would need a paid licence service.
 *   - A photograph of the screen. Nothing in software reaches a camera.
 *
 * The blanking below raises the cost of a casual capture: the common Windows
 * and macOS capture tools take focus when they start, and the page hides
 * itself the moment it loses focus. It is a deterrent, not a lock, and the
 * real answer to both cases is the watermark burned into every page - a
 * screenshot and a phone photo both carry the address and the minute the page
 * was served, so a leak names its source.
 */
export default function ProtectedDocViewer({
  documentId,
  title,
  onClose,
}: {
  documentId: number
  title: string
  onClose: () => void
}) {
  const [meta, setMeta] = useState<ProtectedDocMeta | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  /** Hidden because the window lost focus - a capture tool is the usual cause. */
  const [hidden, setHidden] = useState(false)
  const [turning, setTurning] = useState<"next" | "prev" | null>(null)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    getProtectedDocMeta(documentId)
      .then((m) => !cancelled && setMeta(m))
      .catch(() => !cancelled && setError("This document could not be opened."))
    return () => {
      cancelled = true
    }
  }, [documentId])

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

  /* ---------------------------------------------------------------- */
  /* Deterrents                                                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    // Snipping Tool, Win+Shift+S, macOS's capture UI and most screen
    // recorders take focus when they open. Hiding on blur means the common
    // ones capture a covered page. Someone using the plain PrintScreen key,
    // or a phone, is unaffected - hence the watermark.
    const hide = () => setHidden(true)
    const show = () => setHidden(false)
    const onVisibility = () => setHidden(document.visibilityState !== "visible")

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        setHidden(true)
        setTimeout(() => setHidden(false), 1500)
      }
      // Ctrl/Cmd + P, S, C and the devtools shortcuts.
      const mod = e.ctrlKey || e.metaKey
      if (mod && ["p", "s", "c", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }

    const block = (e: Event) => e.preventDefault()

    window.addEventListener("blur", hide)
    window.addEventListener("focus", show)
    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("contextmenu", block)
    document.addEventListener("copy", block)
    document.addEventListener("dragstart", block)

    return () => {
      window.removeEventListener("blur", hide)
      window.removeEventListener("focus", show)
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("contextmenu", block)
      document.removeEventListener("copy", block)
      document.removeEventListener("dragstart", block)
    }
  }, [go, onClose])

  const pages = meta?.pages ?? 0

  return (
    <div className="pdv-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <style>{`
        .pdv-overlay {
          position: fixed; inset: 0; z-index: 9999; background: rgba(12,16,38,0.94);
          display: flex; flex-direction: column;
          -webkit-user-select: none; user-select: none;
        }
        .pdv-bar {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          padding: 12px 18px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .pdv-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 17px; flex: 1; min-width: 0; }
        .pdv-btn {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; border-radius: 8px; padding: 7px 14px; font-size: 14px;
          font-weight: 600; cursor: pointer;
        }
        .pdv-btn:disabled { opacity: 0.35; cursor: default; }
        .pdv-count { font-size: 14px; opacity: 0.8; min-width: 92px; text-align: center; }
        .pdv-stage {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 18px; overflow: auto; perspective: 1800px;
        }
        .pdv-page {
          max-width: min(900px, 100%); max-height: 100%; display: block;
          border-radius: 4px; box-shadow: 0 18px 50px rgba(0,0,0,0.55);
          background: #fff;
          -webkit-user-drag: none; pointer-events: none;
          transform-origin: left center;
        }
        /* The page-turn: the leaf swings on its spine rather than sliding, so
           it reads as a book being opened. */
        .pdv-page.turn-next { animation: pdv-turn-next 320ms ease-in; }
        .pdv-page.turn-prev { animation: pdv-turn-prev 320ms ease-out; }
        @keyframes pdv-turn-next {
          from { transform: rotateY(-38deg); opacity: 0.55; }
          to   { transform: rotateY(0deg);   opacity: 1; }
        }
        @keyframes pdv-turn-prev {
          from { transform: rotateY(38deg);  opacity: 0.55; }
          to   { transform: rotateY(0deg);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pdv-page.turn-next, .pdv-page.turn-prev { animation: none; }
        }
        .pdv-hidden {
          position: absolute; inset: 0; display: flex; align-items: center;
          justify-content: center; text-align: center; padding: 24px;
          background: #0c1026; color: rgba(255,255,255,0.75); font-size: 15px;
        }
        .pdv-note { font-size: 12.5px; opacity: 0.6; padding: 0 18px 12px; color: #fff; }
        /* Ctrl+P gets a blank sheet rather than the document. */
        @media print {
          .pdv-overlay { display: none !important; }
          body > *:not(.pdv-overlay) { display: none !important; }
        }
      `}</style>

      <div className="pdv-bar">
        <span className="pdv-title">{title}</span>
        <button type="button" className="pdv-btn" onClick={() => go(-1)} disabled={page <= 1}>
          ‹ Previous
        </button>
        <span className="pdv-count">{pages ? `${page} of ${pages}` : "…"}</span>
        <button type="button" className="pdv-btn" onClick={() => go(1)} disabled={!pages || page >= pages}>
          Next ›
        </button>
        <button type="button" className="pdv-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div
        className="pdv-stage"
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchX.current
          const end = e.changedTouches[0]?.clientX ?? null
          touchX.current = null
          if (start == null || end == null) return
          // A deliberate swipe, not a tap or a scroll nudge.
          if (Math.abs(end - start) < 45) return
          go(end < start ? 1 : -1)
        }}
      >
        {error ? (
          <p style={{ color: "rgba(255,255,255,0.8)" }}>{error}</p>
        ) : !meta ? (
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Opening…</p>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- watermarked page image, not a static asset */
          <img
            key={page}
            src={protectedPageUrl(documentId, page)}
            alt={`${title} — page ${page} of ${pages}`}
            className={`pdv-page${turning ? ` turn-${turning}` : ""}`}
            draggable={false}
            onError={() => setError("This page could not be loaded.")}
          />
        )}

        {hidden && (
          <div className="pdv-hidden">
            Hidden while this window is not in focus.
            <br />
            Return to this tab to keep reading.
          </div>
        )}
      </div>

      <p className="pdv-note">
        This document is displayed page by page and cannot be downloaded. Every page
        carries the address and time it was served.
      </p>
    </div>
  )
}
