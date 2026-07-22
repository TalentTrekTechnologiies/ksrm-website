"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"

export default function IntroSplash() {
  const pathname = usePathname()

  // Starts hidden and is switched on after mount, so the server and client
  // render identical markup (no hydration mismatch) and the page itself paints
  // immediately rather than behind an overlay.
  //
  // Plays only when the site is FIRST opened on "/" - not on every visit to
  // the homepage. This component lives in the persistent root chrome, so it
  // survives client-side navigation; keying the effect on the pathname meant
  // clicking "Home" from another page replayed the whole 4s animation. Running
  // it once on mount, against the landing route, gives the intended behaviour:
  // an intro when someone arrives, and never an interruption while they browse.
  const [show, setShow] = useState(false)
  // The clip only starts playing once enough of it is buffered. Until then the
  // overlay would sit blank, which reads as a broken load - so the logo fades
  // in on `canplaythrough` and a quiet spinner covers the wait.
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    // Landing route only, read once on mount - deliberately NOT re-run when
    // the pathname changes, so navigating back to "/" never replays it.
    if (pathname !== "/") return
    setShow(true)
    // Safety net only - the splash normally closes on the video's `ended`
    // event, so the animation always plays to its natural end. A fixed timer
    // alone cut it off: the clip runs ~4.1s and the timer fired at 2.6s.
    // This just guarantees the overlay can never trap anyone if the video
    // stalls or never fires `ended`.
    const timer = setTimeout(() => setShow(false), 9000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Buffering indicator - shown only until the clip can play through,
            so the overlay is never just a blank cream screen. */}
        {!videoReady && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "3px solid rgba(43,52,144,0.18)",
                borderTopColor: "#2B3490",
                animation: "ksrm-intro-spin 0.8s linear infinite",
                display: "block",
              }}
            />
            <style>{`@keyframes ksrm-intro-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        <video
          autoPlay
          muted
          playsInline
          // Buffer the whole clip up front rather than the browser's default
          // metadata-only fetch, which left playback starting late on a cold
          // load - the "video hasn't loaded yet" gap.
          preload="auto"
          onCanPlayThrough={() => setVideoReady(true)}
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
            opacity: videoReady ? 1 : 0,
            transition: "opacity 0.35s ease",
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
