"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  getLiveCount,
  getSiteStatsSummary,
  recordSiteHit,
  recordSiteVisit,
  sendHeartbeat,
  SiteStatsRange,
} from "@/lib/site-stats-api"

const SESSION_VISIT_FLAG = "ksrm:visit-recorded"
const PRESENCE_ID_KEY = "ksrm:presence-id"
const HEARTBEAT_MS = 20_000
const REFRESH_MS = 30_000

function presenceId(): string {
  let id = sessionStorage.getItem(PRESENCE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(PRESENCE_ID_KEY, id)
  }
  return id
}

const RANGE_LABEL: Record<SiteStatsRange, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "7d",
}

/**
 * A floating "N live · N visits · N hits" widget, matching the counters
 * several peer college sites show. Fixed-positioned (mounted once in
 * ChromeGate, alongside BackToTop) rather than living in the footer, so it's
 * visible on every page without scrolling.
 *
 * "Live" comes from a presence heartbeat (this tab pings every 20s; a tab
 * counts as live for ~90s after its last ping - see SiteStatsService).
 * "Visits" counts once per browser tab session; "hits" counts every page
 * load, tracked off the pathname since this component itself never
 * remounts during client-side navigation.
 */
export default function VisitorCounter() {
  const pathname = usePathname()
  const [range, setRange] = useState<SiteStatsRange>("today")
  const [summary, setSummary] = useState<{ visits: number; hits: number } | null>(null)
  const [live, setLive] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const rangeRef = useRef(range)
  rangeRef.current = range

  // Always visible - but the home page's hero banner has its "Apply Now"
  // button in the bottom-left of the hero's left column, so this sits on the
  // right instead while the hero is in view, then moves to the left once
  // scrolled past it (matching the college's stated preference for the
  // ordinary sections below, none of which have anything in that corner).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 500)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Visit: once per tab session. Hit: once per page load, including the
  // first. Both no-op their own error away rather than affecting the page.
  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_VISIT_FLAG)) {
      sessionStorage.setItem(SESSION_VISIT_FLAG, "1")
      recordSiteVisit().catch(() => {})
    }
    recordSiteHit()
      .then((s) => {
        if (rangeRef.current === "today") setSummary(s)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Heartbeat while this tab stays open.
  useEffect(() => {
    const id = presenceId()
    const ping = () => sendHeartbeat(id).then((r) => setLive(r.live)).catch(() => {})
    ping()
    const interval = setInterval(ping, HEARTBEAT_MS)
    return () => clearInterval(interval)
  }, [])

  // Selected-range summary, refreshed periodically for the "live" feel.
  useEffect(() => {
    let cancelled = false
    const load = () => {
      getSiteStatsSummary(range)
        .then((s) => {
          if (!cancelled) setSummary(s)
        })
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [range])

  useEffect(() => {
    const interval = setInterval(() => {
      getLiveCount().then((r) => setLive(r.live)).catch(() => {})
    }, REFRESH_MS)
    return () => clearInterval(interval)
  }, [])

  if (!summary) return null

  function toggleRange(next: SiteStatsRange) {
    setRange((prev) => (prev === next ? "today" : next))
  }

  return (
    <>
      <style>{`
        @keyframes ksrm-live-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6); }
          70% { box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
        }
        .visitor-counter-widget { animation: ksrm-fade-in 0.4s ease-out; }
        @keyframes ksrm-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .visitor-counter-widget { display: none; }
        }
      `}</style>
      <div
        className="visitor-counter-widget"
        style={{
          position: "fixed",
          left: scrolled ? "20px" : "auto",
          right: scrolled ? "auto" : "20px",
          bottom: "20px",
          zIndex: 998,
          transition: "left 0.3s ease, right 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "rgba(20, 22, 40, 0.88)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "999px",
          padding: "9px 16px",
          fontSize: "13px",
          color: "rgba(255,255,255,0.85)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#4ade80",
              animation: "ksrm-live-pulse 2s infinite",
              flexShrink: 0,
            }}
          />
          Live {live ?? "…"}
        </span>
        <span style={{ opacity: 0.6 }}>{summary.visits.toLocaleString("en-IN")} visits</span>
        <span style={{ opacity: 0.6 }}>{summary.hits.toLocaleString("en-IN")} hits</span>
        <span style={{ display: "inline-flex", gap: "6px" }}>
          {(["yesterday", "7d"] as SiteStatsRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleRange(r)}
              style={{
                border: "none",
                borderRadius: "999px",
                padding: "3px 9px",
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
                background: range === r ? "rgba(255,255,255,0.18)" : "transparent",
                color: range === r ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              ▲ {RANGE_LABEL[r]}
            </button>
          ))}
        </span>
      </div>
    </>
  )
}
