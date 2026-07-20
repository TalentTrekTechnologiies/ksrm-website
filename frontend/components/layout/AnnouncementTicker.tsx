"use client"

import { useEffect, useState } from "react"
import { Megaphone } from "lucide-react"
import { getAnnouncementsPublic, Announcement, AnnouncementLocation, AnnouncementPriority } from "@/lib/announcements-api"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"

// Defaults used until Site Settings load (and if the fetch fails), so the
// ticker always renders with sane behaviour rather than nothing.
const DEFAULTS = { speedSeconds: 35, maxVisible: 10, pauseOnHover: true }

/** Site Settings that control this ticker (previously stored but never read). */
function useTickerSettings(location: AnnouncementLocation) {
  const [cfg, setCfg] = useState({ ...DEFAULTS, enabled: true })

  useEffect(() => {
    let cancelled = false
    getPublicSiteSettings()
      .then((v) => {
        if (cancelled) return
        const num = (key: string, fallback: number) => {
          const n = Number(v[key])
          return Number.isFinite(n) && n > 0 ? n : fallback
        }
        const bool = (key: string, fallback: boolean) =>
          v[key] === undefined || v[key] === "" ? fallback : v[key] === "true"

        setCfg({
          speedSeconds: num("site.announcementTickerSpeedSeconds", DEFAULTS.speedSeconds),
          maxVisible: num("site.announcementMaxVisible", DEFAULTS.maxVisible),
          pauseOnHover: bool("site.announcementPauseOnHover", DEFAULTS.pauseOnHover),
          enabled: bool(
            location === "HEADER_TICKER"
              ? "site.announcementHeaderTickerEnabled"
              : "site.announcementHeroTickerEnabled",
            true,
          ),
        })
      })
      .catch(() => { /* defaults stay */ })
    return () => { cancelled = true }
  }, [location])

  return cfg
}

// Gradient (not flat) per priority - a subtle depth cue rather than a
// solid color bar, applied to the ticker's background.
const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  CRITICAL: "linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)",
  HIGH: "linear-gradient(90deg, #D97706 0%, #B45309 100%)",
  NORMAL: "linear-gradient(90deg, #1E3A8A 0%, #1E293B 100%)",
  LOW: "linear-gradient(90deg, #475569 0%, #334155 100%)",
}

/**
 * Single scrolling marquee, mounted once in ChromeGate directly under the
 * Header - the one and only ticker instance on the site (there used to be
 * duplicates in Hero and the homepage section; those were removed).
 */
export default function AnnouncementTicker({
  location,
  departmentId,
}: {
  location: AnnouncementLocation
  departmentId?: number
  /** Accepted for call-site compatibility; the bar's height is now uniform
   * regardless, so this no longer changes the vertical rhythm. */
  compact?: boolean
}) {
  const all = useLiveData(() => getAnnouncementsPublic(location, departmentId), [location, departmentId])
  const cfg = useTickerSettings(location)

  if (!cfg.enabled) return null
  if (all === null || all.length === 0) return null

  const items = all.slice(0, cfg.maxVisible)

  const topPriority = items.reduce<AnnouncementPriority>((top, item) => {
    const order: AnnouncementPriority[] = ["CRITICAL", "HIGH", "NORMAL", "LOW"]
    return order.indexOf(item.priority) < order.indexOf(top) ? item.priority : top
  }, "LOW")

  return (
    <div
      style={{ background: PRIORITY_COLORS[topPriority] }}
      className="relative flex min-h-[24px] items-stretch overflow-hidden text-white"
    >
      <style>{`
        .ann-track { animation: ann-scroll ${cfg.speedSeconds}s linear infinite; }
        ${cfg.pauseOnHover ? ".ann-track-wrap:hover .ann-track { animation-play-state: paused; }" : ""}
        @keyframes ann-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .ann-item[href] { cursor: pointer; text-decoration: none; border-radius: 4px; transition: background-color 0.15s ease; }
        .ann-item[href]:hover { background-color: rgba(255,255,255,0.16); }
        .ann-item[href]:hover .ann-item-text { text-decoration: underline; }
      `}</style>
      {/* Both halves share the same vertical padding (py-1) inside one
          min-h bar, so the "Notices" chip and the scrolling text are always
          the same height - previously the chip (py-2) and the track (py-1.5)
          differed, making the bar look uneven. `compact` no longer changes
          the vertical rhythm; the fixed bar height governs it uniformly. */}
      <div className="ann-label flex shrink-0 items-center gap-2 bg-black/15 px-3.5 py-0.5 text-xs font-bold uppercase tracking-wide">
        <Megaphone className="h-3.5 w-3.5" />
        <span>Notices</span>
      </div>
      <div className="ann-track-wrap flex flex-1 items-center overflow-hidden py-0.5">
        <div className="ann-track flex w-max items-center gap-8 whitespace-nowrap">
          {[...items, ...items].map((item, i) => {
            const content = (
              <>
                {item.badge && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
                <span className="ann-item-text">{item.shortText || item.title}</span>
              </>
            )
            return (
              <span key={`${item.id}-${i}`} className="flex items-center gap-2">
                {item.linkUrl ? (
                  <a
                    href={item.linkUrl}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="ann-item flex items-center gap-2 px-1.5 py-0.5 text-sm font-medium text-white"
                  >
                    {content}
                  </a>
                ) : (
                  <span className="flex items-center gap-2 px-1.5 py-0.5 text-sm font-medium">{content}</span>
                )}
                <span className="ann-sep h-1 w-1 rounded-full bg-admin-gold" />
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
