"use client"

import { useState } from "react"

/**
 * A YouTube video shown as its thumbnail until someone presses play.
 *
 * Each YouTube iframe downloads ~3 MB of player scripts as soon as the page
 * loads, played or not - the Gallery's three embeds cost ~9 MB on every visit.
 * The thumbnail is one small image; the real player loads on click and starts
 * playing straight away. A URL that is not YouTube falls back to a normal
 * iframe, so nothing that worked before stops working.
 *
 * Usage: <LiteYouTube url={video.url} title={video.title} />
 */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? m[1] : null
}

export default function LiteYouTube({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false)
  const id = youtubeId(url)
  const box: React.CSSProperties = { position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#000" }

  if (!id) {
    return (
      <div style={box}>
        <iframe src={url} title={title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen />
      </div>
    )
  }

  if (playing) {
    return (
      <div style={box}>
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      style={{ ...box, display: "block", padding: 0, border: 0, cursor: "pointer", overflow: "hidden" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 68, height: 48, borderRadius: 12, background: "rgba(220, 0, 0, 0.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: "18px solid #fff", marginLeft: 4 }} />
      </span>
    </button>
  )
}
