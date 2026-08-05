"use client"

import PublicDocumentList from "@/components/PublicDocumentList"
import { getAnnouncementsPublic, Announcement } from "@/lib/announcements-api"
import { getExamNotificationsPublic, ExamNotification, ExamNotificationType } from "@/lib/exam-notifications-api"
import { useLiveData } from "@/lib/use-live-data"

type ExamNoticeItem =
  | { kind: "exam"; id: number; date: string; title: string; description: string | null; linkUrl: string | null; buttonText: string; academicYear: string | null }
  | { kind: "announcement"; id: number; date: string; title: string; description: string | null; linkUrl: string | null; buttonText: string; academicYear: string | null }

function fromExamNotification(n: ExamNotification): ExamNoticeItem {
  return {
    kind: "exam",
    id: n.id,
    date: n.startDate,
    title: n.title,
    description: n.description,
    linkUrl: n.buttonUrl,
    buttonText: n.buttonText || "View",
    academicYear: n.academicYear,
  }
}

function fromAnnouncement(n: Announcement): ExamNoticeItem {
  return {
    kind: "announcement",
    id: n.id,
    date: n.createdAt,
    title: n.shortText || n.title,
    description: n.description,
    linkUrl: n.linkUrl,
    buttonText: "View",
    academicYear: null,
  }
}

// Shows both dedicated Exam Notifications and Announcement Engine items that
// are placed on EXAM_NOTIFICATIONS_PAGE. This makes a single Announcement
// reusable across the header ticker, homepage latest updates, and this list.
export default function ExamNotificationsList({
  /**
   * Which list this is - results, timetables, question papers and so on.
   * Omitted means the notifications block, which also carries the exam
   * announcements so a notice written once appears here too.
   */
  type,
  emptyText,
}: {
  type?: ExamNotificationType
  emptyText?: string
} = {}) {
  const items = useLiveData<ExamNoticeItem[]>(
    async () => {
      const [examNotifications, examAnnouncements] = await Promise.all([
        getExamNotificationsPublic(type).catch(() => [] as ExamNotification[]),
        // Announcements have no type of their own, so they belong with the
        // notifications block only - never duplicated into every section.
        type && type !== "NOTIFICATION"
          ? Promise.resolve([] as Announcement[])
          : getAnnouncementsPublic("EXAM_NOTIFICATIONS_PAGE").catch(() => [] as Announcement[]),
      ])

      return [
        ...examNotifications.map(fromExamNotification),
        ...examAnnouncements.map(fromAnnouncement),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    [type],
  )

  if (items === null) {
    return <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Loading notifications...</p>
  }

  if (items.length === 0) {
    return <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>{emptyText ?? "No active notifications right now."}</p>
  }

  // Group by academic year, newest first, so the current year sits on top and
  // previous years collect underneath. Items with no year (e.g. announcements)
  // fall into a trailing ungrouped block.
  const byYear = new Map<string, ExamNoticeItem[]>()
  const ungrouped: ExamNoticeItem[] = []
  for (const n of items) {
    const y = n.academicYear?.trim()
    if (!y) {
      ungrouped.push(n)
      continue
    }
    if (!byYear.has(y)) byYear.set(y, [])
    byYear.get(y)!.push(n)
  }
  // Descending by the first number in the label ("AY 2026-27" -> 2026), so a
  // new year automatically lands above the previous ones.
  const years = [...byYear.keys()].sort((a, b) => {
    const na = Number(a.match(/\d{4}/)?.[0] ?? 0)
    const nb = Number(b.match(/\d{4}/)?.[0] ?? 0)
    return nb - na
  })

  const toRows = (list: ExamNoticeItem[]) =>
    list.map((n) => ({
      id: `${n.kind}-${n.id}`,
      title: n.title,
      description: n.description,
      meta: new Date(n.date).toLocaleDateString(),
      href: n.linkUrl,
      actionLabel: n.buttonText,
    }))

  // No academic years set at all - render the flat list exactly as before.
  if (years.length === 0) return <PublicDocumentList items={toRows(items)} />

  return (
    <div>
      {years.map((y) => (
        <div key={y} style={{ marginBottom: 28 }}>
          <h3
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#2B3490",
              borderLeft: "4px solid #D4A500",
              paddingLeft: 14,
              margin: "0 0 14px",
            }}
          >
            {y}
          </h3>
          <PublicDocumentList items={toRows(byYear.get(y)!)} />
        </div>
      ))}
      {ungrouped.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <PublicDocumentList items={toRows(ungrouped)} />
        </div>
      )}
    </div>
  )
}
