"use client"

import { useEffect, useRef, useState } from "react"

/**
 * A Google Maps embed that is not requested until someone can see it.
 *
 * The footer map already carried loading="lazy", and it still showed up in
 * every page load measured on the live site - 1.4 seconds on Syllabus, 2.3 on
 * the CSE department page - because the browser's lazy threshold reaches well
 * past the fold, and one iframe pulls in Google's own scripts and tiles behind
 * it. On a page nobody scrolls to the bottom of, that is paid for nothing.
 *
 * An IntersectionObserver is the difference between "probably soon" and "when
 * it is actually needed". Until then the space is held by a plain box, so the
 * footer does not jump when the map arrives.
 */
export default function LazyMapEmbed({
  src,
  title = "Campus location map",
  height = 150,
  style,
}: {
  src: string
  title?: string
  height?: number
  style?: React.CSSProperties
}) {
  const holder = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = holder.current
    if (!el) return
    // No observer (very old browser) means show it rather than hide the map
    // from someone forever.
    if (typeof IntersectionObserver === "undefined") {
      setShow(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true)
          observer.disconnect()
        }
      },
      // A little ahead of the viewport, so it is loading by the time it is
      // scrolled to rather than starting from blank at that moment.
      { rootMargin: "200px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={holder}
      style={{
        width: "100%",
        height,
        borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,255,255,0.06)",
        ...style,
      }}
    >
      {show && (
        <iframe
          src={src}
          title={title}
          width="100%"
          height={height}
          style={{ border: "none", display: "block", opacity: 0.9 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  )
}
