"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function IntroSplash() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Show splash for 4.5 seconds
    const timer = setTimeout(() => setShow(false), 4500)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#f4f3ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      {/* The wrapper sized itself with height:auto while the video asked for
          height:100% of it - a circular constraint, so on a wide desktop the
          video overflowed the box and rendered clipped ("half the logo"). The
          video now drives its own height and is capped by maxHeight, and the
          desktop width is smaller so the splash doesn't dominate the screen. */}
      <div
        style={{
          position: "relative",
          width: "clamp(300px, 68vw, 760px)",
          maxWidth: "92vw",
        }}
      >
        <video
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "82vh",
            objectFit: "contain",
            display: "block",
          }}
        >
          {/* WebM (VP8/VP9 with alpha) carries the background-removed logo, so
              the splash's cream backdrop shows through it. It replaced the old
              ksrm-logo.mp4, which no longer exists - the code still pointed at
              that deleted file, which left the splash blank. */}
          <source src="/ksrm-logo.webm" type="video/webm" />
        </video>
      </div>
    </div>
  )
}
