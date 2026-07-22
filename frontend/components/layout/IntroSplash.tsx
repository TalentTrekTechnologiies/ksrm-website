"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const SEEN_KEY = "ksrm_intro_seen"

export default function IntroSplash() {
  // Starts hidden and is switched on after mount only if this tab hasn't seen
  // it. Previously it rendered `true` on the server and blocked the whole site
  // for 4.5s on EVERY page load and refresh - which reads as the site being
  // stuck loading. Starting false also keeps the server and client markup
  // identical, so there's no hydration mismatch.
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return
    sessionStorage.setItem(SEEN_KEY, "1")
    setShow(true)
    // Safety net only - the splash normally closes on the video's `ended`
    // event, so the animation always plays to its natural end. A fixed timer
    // alone cut it off: the clip runs ~4.1s and the timer fired at 2.6s.
    // This just guarantees the overlay can never trap anyone if the video
    // stalls or never fires `ended`.
    const timer = setTimeout(() => setShow(false), 9000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    // Clicking (or pressing a key) dismisses it - nobody should be held on a
    // splash they've already seen enough of, and if the video ever fails to
    // paint, the visitor isn't stuck staring at a blank screen.
    <div
      onClick={() => setShow(false)}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onKeyDown={() => setShow(false)}
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
        cursor: "pointer",
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
          // Close on the clip's own `ended` event so the animation always
          // finishes, whatever its length - a hard-coded timer had to guess,
          // and guessed short. If the file can't load at all, don't sit on a
          // blank overlay waiting for the safety timeout.
          onEnded={() => setShow(false)}
          onError={() => setShow(false)}
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
