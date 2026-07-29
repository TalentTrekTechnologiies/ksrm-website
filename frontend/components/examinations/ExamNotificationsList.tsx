"use client"

import PublicDocumentList from "@/components/PublicDocumentList"
import { getAnnouncementsPublic, Announcement } from "@/lib/announcements-api"
import { getExamNotificationsPublic, ExamNotification } from "@/lib/exam-notifications-api"
import { useLiveData } from "@/lib/use-live-data"

type ExamNoticeItem =
  | { kind: "exam"; id: number; date: string; title: string; description: string | null; linkUrl: string | null; buttonText: string }
  | { kind: "announcement"; id: number; date: string; title: string; description: string | null; linkUrl: string | null; buttonText: string }

function fromExamNotification(n: ExamNotification): ExamNoticeItem {
  return {
    kind: "exam",
    id: n.id,
    date: n.startDate,
    title: n.title,
    description: n.description,
    linkUrl: n.buttonUrl,
    buttonText: n.buttonText || "View",
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
  }
}

// Shows both dedicated Exam Notifications and Announcement Engine items that
// are placed on EXAM_NOTIFICATIONS_PAGE. This makes a single Announcement
// reusable across the header ticker, homepage latest updates, and this list.
export default function ExamNotificationsList() {
  const items = useLiveData<ExamNoticeItem[]>(
    async () => {
      const [examNotifications, examAnnouncements] = await Promise.all([
        getExamNotificationsPublic().catch(() => [] as ExamNotification[]),
        getAnnouncementsPublic("EXAM_NOTIFICATIONS_PAGE").catch(() => [] as Announcement[]),
      ])

      return [
        ...examNotifications.map(fromExamNotification),
        ...examAnnouncements.map(fromAnnouncement),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    [],
  )

  if (items === null) {
    return <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Loading notifications...</p>
  }

  if (items.length === 0) {
    return <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: "24px 0" }}>No active notifications right now.</p>
  }

  return (
    <PublicDocumentList
      items={items.map((n) => ({
        id: `${n.kind}-${n.id}`,
        title: n.title,
        description: n.description,
        meta: new Date(n.date).toLocaleDateString(),
        href: n.linkUrl,
        actionLabel: n.buttonText,
      }))}
    />
  )
}
