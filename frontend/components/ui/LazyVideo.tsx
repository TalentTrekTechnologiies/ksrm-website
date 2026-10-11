"use client"

import { useEffect, useRef } from "react"

/**
 * A muted, looping background video that is not downloaded until it is about
 * to be seen.
 *
 * These clips were plain <video autoPlay>, which starts downloading the whole
 * file on page load wherever it sits on the page: the Cultural page pulled
 * 8.7 MB of video for two clips most visitors never scroll to. The box keeps
 * its 16:9 shape from the start, so nothing moves when the clip arrives.
 *
 * Usage: <LazyVideo src="/videos/flash-mob.mp4" />
 */
export default function LazyVideo({ src, style }: { src: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Set on the element itself: the source is only ever attached once.
    const start = () => {
      if (el.getAttribute("src")) return
      el.src = src
      el.play().catch(() => {})
    }
    if (typeof IntersectionObserver === "undefined") {
      start()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { rootMargin: "300px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block", background: "#e9ecf2", ...style }}
    />
  )
}
