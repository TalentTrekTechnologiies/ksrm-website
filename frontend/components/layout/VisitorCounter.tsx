"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { getSiteVisitStats, recordSiteVisit, SiteVisitStats } from "@/lib/site-stats-api"

const SESSION_FLAG = "ksrm:visit-recorded"
const REFRESH_MS = 30_000

/**
 * The small "visitors" line in the footer, matching what several sister/peer
 * college sites show. Counts once per browser tab session (guarded by
 * sessionStorage, not per page navigation - a visitor reading five pages is
 * one visit), then polls read-only so the number keeps ticking for anyone
 * who leaves the tab open, without inflating the count itself.
 */
export default function VisitorCounter() {
  const [stats, setStats] = useState<SiteVisitStats | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const already = sessionStorage.getItem(SESSION_FLAG)
        const result = already ? await getSiteVisitStats() : await recordSiteVisit()
        if (!already) sessionStorage.setItem(SESSION_FLAG, "1")
        if (!cancelled) setStats(result)
      } catch {
        // A stats widget failing silently is preferable to it breaking the footer.
      }
    }

    init()
    const interval = setInterval(() => {
      getSiteVisitStats()
        .then((result) => {
          if (!cancelled) setStats(result)
        })
        .catch(() => {})
    }, REFRESH_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!stats) return null

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "rgba(255,255,255,0.5)" }}>
      <Eye size={13} style={{ flexShrink: 0 }} />
      {stats.total.toLocaleString("en-IN")} visits · {stats.today.toLocaleString("en-IN")} today
    </span>
  )
}
