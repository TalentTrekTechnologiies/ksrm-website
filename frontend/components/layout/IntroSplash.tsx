"use client"

import { useEffect, useRef, useState } from "react"
import { IS_DEMO, DEMO_BRAND } from "@/lib/demo-mode"
import { usePathname } from "next/navigation"
import Image from "next/image"

/** Fired when the intro finishes (or is skipped), so later overlays can queue
 *  behind it. Kept in this module because the splash owns the moment. */
export const INTRO_DONE_EVENT = "ksrm:intro-done"

/**
 * The URL the visitor actually landed on, captured once when this module is
 * first evaluated. `null` during prerender (there is no window on the server).
 *
 * This is what distinguishes "someone just arrived on the homepage" from
 * "someone clicked Home while browsing" without waiting for an effect to run -
 * and doing it without an effect is the whole point (see `show` below).
 */
const LANDING_PATH = typeof window === "undefined" ? null : window.location.pathname

/** "/about/" -> "/about"; "/" stays "/". The site runs with trailingSlash: true. */
function normalizePath(p: string): string {
  return p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p
}

/** Set once the intro has played, so it never replays within the same session. */
let introConsumed = false

export default function IntroSplash() {
  const pathname = usePathname()

  // Rendered from the FIRST paint, not switched on after mount.
  //
  // This used to start `false` and flip to `true` in an effect. That is why the
  // site flashed before the logo: the static HTML contained no overlay, so the
  // browser painted the whole homepage, and only once React had hydrated did
  // the splash drop over the top of it. The intro was chasing the page instead
  // of preceding it.
  //
  // Deciding it during render instead means the overlay is in the exported HTML
  // and covers the page from the very first frame. Both sides agree on the
  // value, so there is still no hydration mismatch:
  //   - prerender: LANDING_PATH is null, so it falls back to the route being
  //     built - true only for out/index.html.
  //   - hydration: LANDING_PATH is the URL just loaded - true only if that was
  //     the homepage.
  // Requiring `pathname === "/"` as well means navigating away hides it, and
  // `introConsumed` stops it replaying if the visitor comes back to "/".
  const landedOnHome =
    LANDING_PATH === null ? pathname === "/" : normalizePath(LANDING_PATH) === "/"

  const [dismissed, setDismissed] = useState(false)
  const show = landedOnHome && pathname === "/" && !introConsumed && !dismissed

  const close = () => {
    introConsumed = true
    setDismissed(true)
  }

  // The clip only starts playing once enough of it is buffered. Until then the
  // overlay would sit blank, which reads as a broken load - so the logo fades
  // in on `canplaythrough` and a quiet spinner covers the wait.
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    if (!show) return
    // Safety net only - the splash normally closes on the video's `ended`
    // event, so the animation always plays to its natural end. A fixed timer
    // alone cut it off: the clip runs ~4.1s and the timer fired at 2.6s.
    // This just guarantees the overlay can never trap anyone if the video
    // stalls or never fires `ended`.
    // The demo shows a still logo rather than a clip, so it does not need
    // the full nine seconds a video might run to.
    const timer = setTimeout(close, IS_DEMO ? 2600 : 9000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  // Announce the end of the intro so the homepage popup can queue behind it.
  // Only on the true->false transition (the splash actually finishing), plus
  // immediately on mount when the intro isn't going to play at all - otherwise
  // the initial show=false would fire "done" before the intro even starts.
  const wasShown = useRef(false)
  const announced = useRef(false)
  useEffect(() => {
    if (show) {
      wasShown.current = true
      return
    }
    // At most once per page load. The effect also runs on route changes, and
    // re-announcing there made anything listening (the popup notice) reopen on
    // every nav click.
    if (announced.current) return
    if (wasShown.current || pathname !== "/") {
      announced.current = true
      window.dispatchEvent(new CustomEvent(INTRO_DONE_EVENT))
    }
  }, [show, pathname])

  if (!show) return null

  return (
    // Clicking (or pressing a key) dismisses it - nobody should be held on a
    // splash they've already seen enough of, and if the video ever fails to
    // paint, the visitor isn't stuck staring at a blank screen.
    <div
      className="ksrm-intro"
      onClick={close}
      role="button"
      tabIndex={0}
      aria-label="Skip intro"
      onKeyDown={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#f4f3ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        cursor: "pointer",
      }}
    >
      <style>{`
        /* The overlay now ships in the static HTML so it precedes the page
           rather than dropping over it. That makes a CSS-only exit essential:
           React normally unmounts this on the video's 'ended' event, but if the
           bundle fails, is blocked, or is simply slow, nothing else would ever
           remove a full-screen opaque layer. This guarantees it clears itself
           even with JavaScript entirely disabled - which also means a crawler
           rendering the page never sees the content covered. */
        .ksrm-intro { animation: ksrm-intro-out 0s linear 5.2s forwards; }
        @keyframes ksrm-intro-out {
          to { opacity: 0; visibility: hidden; pointer-events: none; }
        }

        /* Fade the logo in when the clip is ready. The delayed keyframe is a
           floor, not the mechanism: it reveals the video by 1.4s even if
           hydration is slow and the React 'canplaythrough' handler is not
           attached yet, so the logo can never sit invisible behind the spinner. */
        .ksrm-intro-video { opacity: 0; animation: ksrm-intro-in 0.35s ease 1.4s forwards; }
        .ksrm-intro-video.is-ready { opacity: 1; animation: none; transition: opacity 0.35s ease; }
        @keyframes ksrm-intro-in { to { opacity: 1; } }

        /* Anyone who has asked for less motion gets the site, not a video. */
        @media (prefers-reduced-motion: reduce) {
          .ksrm-intro { display: none; }
        }
      `}</style>
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
            <style>{`@keyframes ksrm-intro-spin { to { transform: rotate(360deg); } } @keyframes ksrm-intro-demo-in { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } } .ksrm-intro-demo { animation: ksrm-intro-demo-in 900ms ease-out both; }`}</style>
          </div>
        )}
        {/* The specimen has no college logo animation to play - that clip is
            the client's. It shows the agency's own logo with the same timing
            instead, so the intro is still demonstrated rather than skipped.
            Without this the missing file would fire onError and close the
            splash instantly, and the feature would never be seen. */}
        {IS_DEMO ? (
          <img
            src={DEMO_BRAND.logo}
            alt={DEMO_BRAND.company}
            className="ksrm-intro-video is-ready ksrm-intro-demo"
            style={{ width: "100%", height: "auto", maxHeight: "60vh", objectFit: "contain", display: "block" }}
          />
        ) : (
        <video
          autoPlay
          muted
          playsInline
          // Buffer the whole clip up front rather than the browser's default
          // metadata-only fetch, which left playback starting late on a cold
          // load - the "video hasn't loaded yet" gap.
          preload="auto"
          className={`ksrm-intro-video${videoReady ? " is-ready" : ""}`}
          onCanPlayThrough={() => setVideoReady(true)}
          // Close on the clip's own `ended` event so the animation always
          // finishes, whatever its length - a hard-coded timer had to guess,
          // and guessed short. If the file can't load at all, don't sit on a
          // blank overlay waiting for the safety timeout.
          onEnded={close}
          onError={close}
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
        )}
      </div>
    </div>
  )
}
