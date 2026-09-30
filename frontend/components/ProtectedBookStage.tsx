"use client"

import { useEffect, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import { FigureBox, protectedPageUrl } from "@/lib/protected-docs-api"

/**
 * The page-turning surface, built on StPageFlip rather than by hand.
 *
 * The hand-written version was a CSS keyframe that rotated the whole image on
 * a hinge. It reads as a rectangle swinging, not as paper: a real leaf bends
 * as it lifts, and the shadow under it moves with the curl. That is what this
 * library does, and it is not worth reimplementing badly.
 *
 * Two things it changes, and the second is a trade rather than a win:
 *
 *   - Sizing is the library's. The book is given a page aspect ratio and the
 *     box it must fit inside, and it works out the rest - which is what the
 *     hand-rolled version kept getting wrong, because `max-height: 100%` on an
 *     image inside an auto-height wrapper resolves against nothing and does
 *     not constrain anything at all.
 *
 *   - Every page is in the DOM. A flipbook has to have the next leaf to turn
 *     to it, so the viewer no longer holds only the page being read. Only
 *     the leaves within two of the current one are given an image source, so
 *     a page is not FETCHED until it is close to being turned to, but a
 *     reader who turns to the end has pulled the whole document into the
 *     browser. Each page is still a watermarked JPEG behind
 *     the same expiring token, and there is still no PDF anywhere - but "the
 *     browser only ever has the page you are on" is no longer true.
 */

export interface ProtectedBookStageProps {
  documentId: number
  title: string
  pages: number
  token: string
  /** 1-based, controlled by the parent so the watermark and figures follow. */
  page: number
  onPageChange: (page: number) => void
  /** Boxes per page number. Empty when redaction is off. */
  figures: Record<number, FigureBox[]>
  redactFigures: boolean
  openFigure: string | null
  setOpenFigure: (key: string | null | ((c: string | null) => string | null)) => void
  onError: () => void
}

export default function ProtectedBookStage({
  documentId,
  title,
  pages,
  token,
  page,
  onPageChange,
  figures,
  redactFigures,
  openFigure,
  setOpenFigure,
  onError,
}: ProtectedBookStageProps) {
  const host = useRef<HTMLDivElement | null>(null)
  const book = useRef<{ pageFlip: () => { turnToPage: (n: number) => void } } | null>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  /**
   * Width / height of page 1, or null until the probe image has loaded.
   *
   * The book is not mounted until this is known. StPageFlip reads its size
   * once, when it is created, and ignores later changes - so starting at an
   * assumed A4 and correcting it afterwards left a landscape document drawn
   * into a portrait book, shrunk to a strip across the middle.
   */
  const [ratio, setRatio] = useState<number | null>(null)

  // The space the book has to fit inside. Measured rather than assumed,
  // because the toolbar and the note below it take a variable slice of the
  // viewport once the text wraps.
  useEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setBox({ w: r.width, h: r.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Follow the parent when it changes the page from the toolbar or the
  // keyboard, without fighting a flip the reader started themselves.
  useEffect(() => {
    const api = book.current?.pageFlip?.()
    if (!api) return
    try {
      api.turnToPage(page - 1)
    } catch {
      // The instance is not ready on the first render; the initial page is
      // passed as `startPage` anyway.
    }
  }, [page])

  // Absolutely filling the stage, not `height: 100%`.
  //
  // The stage centres its children, and a percentage height inside a centring
  // flex container resolves against an auto height - so the box measured a few
  // pixels tall and the book was sized to match. It came out postage-stamp
  // sized, which also made it look low quality: the page image was fine, there
  // was just almost none of it on screen.
  const fill: React.CSSProperties = { position: "absolute", inset: 0 }

  // Measured once, from page 1, so the book is shaped like the document
  // rather than assumed to be A4.
  const probe = (
    // eslint-disable-next-line @next/next/no-img-element -- probe, never displayed
    <img
      src={protectedPageUrl(documentId, 1, token)}
      alt=""
      aria-hidden="true"
      onLoad={(e) => {
        const el = e.currentTarget
        if (el.naturalWidth && el.naturalHeight) setRatio(el.naturalWidth / el.naturalHeight)
      }}
      onError={onError}
      style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
    />
  )

  if (!box || ratio === null) {
    return (
      <div ref={host} style={fill}>
        {probe}
      </div>
    )
  }

  // Fit inside the measured box at the page's own aspect ratio, so the whole
  // page is visible and nothing scrolls.
  const byHeight = { h: box.h, w: box.h * ratio }
  const byWidth = { w: box.w, h: box.w / ratio }
  const fit = byHeight.w <= box.w ? byHeight : byWidth
  const pw = Math.max(200, Math.floor(fit.w))
  const ph = Math.max(200, Math.floor(fit.h))

  return (
    <div ref={host} style={{ ...fill, display: "grid", placeItems: "center" }}>
      <HTMLFlipBook
        // Rebuilt when the size changes, for the same reason it waits for the
        // ratio: the library does not resize an existing book.
        key={`${pw}x${ph}`}
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- the wrapper's ref type is not exported */
        ref={book as any}
        width={pw}
        height={ph}
        size="fixed"
        // One leaf at a time: a spread halves an A4 page across the screen and
        // the reader zooms, which is what fitting the page exists to avoid.
        usePortrait
        showCover={false}
        maxShadowOpacity={0.5}
        mobileScrollSupport={false}
        startPage={page - 1}
        onFlip={(e: { data: number }) => onPageChange(e.data + 1)}
        className="pdv-book"
        style={{}}
        /* The library's type requires these; they are its own defaults. */
        minWidth={200}
        maxWidth={2000}
        minHeight={200}
        maxHeight={2400}
        drawShadow
        flippingTime={700}
        swipeDistance={30}
        clickEventForward={false}
        useMouseEvents
        renderOnlyPageLengthChange={false}
        autoSize={false}
        showPageCorners
        startZIndex={0}
        disableFlipByClick={false}
      >
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <div key={n} className="pdv-leaf" style={{ background: "#fff" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- watermarked page image behind an expiring link */}
            <img
              // Only the leaves either side of the one being read get a source.
              // `loading="lazy"` was not enough: the library stacks every leaf
              // in the same box, so the browser saw all of them as on screen
              // and fetched the whole document the moment it opened.
              src={Math.abs(n - page) <= 2 ? protectedPageUrl(documentId, n, token) : undefined}
              alt={`${title} — page ${n} of ${pages}`}
              draggable={false}
              onError={onError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                pointerEvents: "none",
              }}
            />
            {redactFigures &&
              (figures[n] ?? []).map((f, i) => {
                const key = `${n}:${i}`
                const open = openFigure === key
                return (
                  <span
                    key={key}
                    tabIndex={0}
                    role="button"
                    aria-label={open ? "Figure revealed" : "Hidden figure — hover or focus to reveal"}
                    className="pdv-figure"
                    onMouseEnter={() => setOpenFigure(key)}
                    onFocus={() => setOpenFigure(key)}
                    onMouseLeave={() => setOpenFigure((c) => (c === key ? null : c))}
                    onBlur={() => setOpenFigure((c) => (c === key ? null : c))}
                    style={{
                      left: `${f.x * 100}%`,
                      top: `${f.y * 100}%`,
                      width: `${f.w * 100}%`,
                      height: `${f.h * 100}%`,
                      opacity: open ? 0 : 1,
                    }}
                  />
                )
              })}
          </div>
        ))}
      </HTMLFlipBook>

      {probe}
    </div>
  )
}
