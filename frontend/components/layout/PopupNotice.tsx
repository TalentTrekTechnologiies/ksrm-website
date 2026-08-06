"use client"

import { useEffect, useRef, useState } from "react"
import { resolveFileUrl } from "@/lib/api-base";
import { usePathname } from "next/navigation"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { INTRO_DONE_EVENT } from "@/components/layout/IntroSplash"

/**
 * A dismissible poster modal for the homepage, driven entirely by Site Settings
 * (site.popupEnabled / popupImageUrl / popupLinkUrl / popupTitle) so an admin
 * can run it for any event with no code change. Shown on every visit to the
 * homepage, once per page load - deliberately not suppressed after the first
 * view, so it greets a visitor whenever they open the site, but it does not
 * reappear as they navigate around it. Appears only once the
 * intro logo has finished. Closes on the X, a click outside, or Esc.
 */
export default function PopupNotice() {
  const pathname = usePathname()
  const [poster, setPoster] = useState<{ imageUrl: string; linkUrl: string; title: string } | null>(null)
  const [visible, setVisible] = useState(false)

  // Read once on mount only - deliberately NOT re-run when the pathname
  // changes. Keying this on pathname meant clicking Home in the nav re-showed
  // the poster on every return to "/"; it should greet a visitor when they open
  // the site, not on in-site navigation. (Same reasoning as IntroSplash.)
  useEffect(() => {
    if (pathname !== "/") return
    let cancelled = false
    getPublicSiteSettings()
      .then((s) => {
        if (cancelled) return
        const enabled = s["site.popupEnabled"] === "true"
        const imageUrl = s["site.popupImageUrl"] || ""
        if (!enabled || !imageUrl) return
        setPoster({ imageUrl, linkUrl: s["site.popupLinkUrl"] || "", title: s["site.popupTitle"] || "" })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show only once the intro logo animation has finished, so the poster never
  // covers it. Guarded by a ref because the intro re-broadcasts on route
  // changes: without this, every nav click re-opened the poster.
  const revealedOnce = useRef(false)
  useEffect(() => {
    if (!poster) return
    const reveal = () => {
      if (revealedOnce.current) return
      revealedOnce.current = true
      setVisible(true)
    }
    window.addEventListener(INTRO_DONE_EVENT, reveal)
    // Fallback: if the intro never reports (e.g. it errored), show anyway.
    const t = setTimeout(reveal, 9500)
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, reveal)
      clearTimeout(t)
    }
  }, [poster])

  function close() {
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  if (!visible || !poster) return null

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary poster URL
    <img
      src={resolveFileUrl(poster.imageUrl)}
      alt={poster.title || "Announcement"}
      style={{ display: "block", width: "100%", height: "auto", borderRadius: 8 }}
      onError={close}
    />
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={poster.title || "Announcement"}
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "ksrm-popup-fade 0.25s ease",
      }}
    >
      <style>{`@keyframes ksrm-popup-fade { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", maxWidth: "min(860px, 92vw)", width: "100%", maxHeight: "90vh", overflow: "auto" }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: -14,
            right: -14,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            color: "#111",
            fontSize: 22,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          ×
        </button>
        {poster.linkUrl ? (
          <a href={poster.linkUrl} target="_blank" rel="noopener noreferrer" onClick={close}>
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    </div>
  )
}
