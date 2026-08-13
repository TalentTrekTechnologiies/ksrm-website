"use client"

import { useEffect, useState } from "react"
import { Megaphone } from "lucide-react"
import { getAnnouncementsPublic, Announcement, AnnouncementLocation, AnnouncementPriority } from "@/lib/announcements-api"
import { getExamNotificationsPublic } from "@/lib/exam-notifications-api"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"

// Normalized ticker row - the ticker shows both Announcements and Exam
// Notifications (on the site-wide header only), so both map to this shape.
interface TickerItem {
  id: string
  badge?: string | null
  text: string
  linkUrl?: string | null
  openInNewTab?: boolean
  priority: AnnouncementPriority
  when: number
}

function announcementToTicker(a: Announcement): TickerItem {
  return {
    id: `ann-${a.id}`,
    badge: a.badge,
    text: a.shortText || a.title,
    linkUrl: a.linkUrl,
    openInNewTab: a.openInNewTab,
    priority: a.priority,
    when: new Date(a.createdAt).getTime(),
  }
}

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
  // The site-wide header ticker also folds in Exam Notifications so they scroll
  // alongside announcements; department tickers stay announcements-only.
  const all = useLiveData<TickerItem[]>(async () => {
    // These used to be `.catch(() => [])`, which quietly turned a FAILED
    // request into a SUCCESSFUL empty result. useLiveData deliberately keeps
    // the last good value when a fetcher rejects - but it never saw a
    // rejection, so it stored [], and `all.length === 0` below unmounts the
    // whole bar. One dropped request and the ticker vanished until the next
    // poll succeeded, which in production is up to 120s away. That is the
    // "notices sometimes come, sometimes don't" report.
    //
    // Now a failure stays a failure. Settled results are inspected so a
    // partial outage still shows what did load: if exam notifications fail,
    // announcements alone are fine, and vice versa. Only when EVERY source
    // fails do we throw, so the previously-loaded items stay on screen.
    const annResult = await getAnnouncementsPublic(location, departmentId).then(
      (v) => ({ ok: true as const, v }),
      () => ({ ok: false as const, v: [] }),
    )

    if (location !== "HEADER_TICKER") {
      if (!annResult.ok) throw new Error("announcements unavailable")
      return annResult.v.map(announcementToTicker)
    }

    const examResult = await getExamNotificationsPublic().then(
      (v) => ({ ok: true as const, v }),
      () => ({ ok: false as const, v: [] }),
    )

    if (!annResult.ok && !examResult.ok) throw new Error("ticker sources unavailable")

    const announcements = annResult.v.map(announcementToTicker)
    const exams = examResult.v.map((n) => ({
      id: `exam-${n.id}`,
      badge: "Exam",
      text: n.title,
      linkUrl: n.buttonUrl,
      openInNewTab: true,
      priority: "NORMAL" as AnnouncementPriority,
      when: new Date(n.startDate).getTime(),
    }))
    return [...announcements, ...exams].sort((a, b) => b.when - a.when)
  }, [location, departmentId])
  const cfg = useTickerSettings(location)

  if (!cfg.enabled) return null
  if (all === null || all.length === 0) return null

  const items = all.slice(0, cfg.maxVisible)

  /**
   * The bar's colour comes from the highest priority present - and it is
   * computed from EVERY item, not just the `maxVisible` slice shown.
   *
   * It used to read the slice, which made the colour move on its own. The list
   * is sorted newest-first and mixes announcements with exam notifications, so
   * publishing a few exam notifications pushed older announcements past the
   * cut-off - and a CRITICAL notice dropping out of the window silently turned
   * the bar from red to amber or navy, even though that notice was still live.
   * Exam notifications have no priority of their own (they are mapped to
   * NORMAL above), so they were changing the colour purely by existing.
   *
   * Reading the whole list means the colour reflects what is actually
   * published, and only changes when a priority does.
   */
  const topPriority = all.reduce<AnnouncementPriority>((top, item) => {
    const order: AnnouncementPriority[] = ["CRITICAL", "HIGH", "NORMAL", "LOW"]
    return order.indexOf(item.priority) < order.indexOf(top) ? item.priority : top
  }, "LOW")

  return (
    <div
      style={{ background: PRIORITY_COLORS[topPriority] }}
      className="relative flex min-h-[24px] items-stretch overflow-hidden text-white"
    >
      <style>{`
        /* Paced per item, not per loop.
           cfg.speedSeconds was applied to the entire loop, so the bar's actual
           reading speed depended on how many notices were published: publish
           three more and every existing one sped up. The Site Settings slider
           now sets how long ONE notice takes to cross, and the loop length
           follows from the count - so the setting means the same thing whatever
           is published. Divided by 10 because the slider's 10-90 range was
           written as whole-loop seconds against a default of ~10 visible items,
           which keeps existing saved values behaving as they do today. */
        .ann-track { animation: ann-scroll ${Math.max((cfg.speedSeconds / 10) * items.length, 8).toFixed(1)}s linear infinite; }
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
                <span className="ann-item-text">{item.text}</span>
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
