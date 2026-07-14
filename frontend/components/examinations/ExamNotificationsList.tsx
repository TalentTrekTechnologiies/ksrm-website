"use client"

import { useEffect, useState } from "react"
import { getExamNotificationsPublic, ExamNotification } from "@/lib/exam-notifications-api"

// Renders the CMS-managed exam notifications (Hall Ticket/Results/
// Registration/Exam Schedule/Important Notice, etc.) inside the
// Examinations page's existing "Latest Notifications" section - the public
// site is a static export with no server runtime, so this fetches
// client-side on mount rather than at build time.
export default function ExamNotificationsList() {
  const [items, setItems] = useState<ExamNotification[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getExamNotificationsPublic()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (items === null) {
    return <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Loading notifications...</p>
  }

  if (items.length === 0) {
    return <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>No active notifications right now.</p>
  }

  return (
    <>
      {items.map((n) => (
        <div className="exam-list-row" key={n.id}>
          <div style={{ minWidth: 90 }}>
            <div style={{ fontSize: 12, color: "#999" }}>{new Date(n.startDate).toLocaleDateString()}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "#2B3490", fontWeight: 500, lineHeight: 1.5 }}>{n.title}</div>
            {n.description && <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{n.description}</div>}
          </div>
          {n.buttonUrl && (
            <a
              href={n.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2B3490", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", padding: "4px 12px", background: "#f4f3ef", borderRadius: 4 }}
            >
              {n.buttonText || "View"} →
            </a>
          )}
        </div>
      ))}
    </>
  )
}
