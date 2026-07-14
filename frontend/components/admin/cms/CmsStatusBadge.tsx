import { Circle } from "lucide-react"

export type CmsStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED"

const STATUS_STYLES: Record<CmsStatus, { bg: string; text: string; dot: string; label: string }> = {
  DRAFT: { bg: "bg-slate-100", text: "text-slate-600", dot: "text-slate-400", label: "Draft" },
  PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "text-emerald-500", label: "Published" },
  SCHEDULED: { bg: "bg-amber-50", text: "text-amber-700", dot: "text-amber-500", label: "Scheduled" },
}

export default function CmsStatusBadge({ status }: { status: CmsStatus }) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <Circle className={`h-2 w-2 fill-current ${style.dot}`} />
      {style.label}
    </span>
  )
}

/**
 * The Careers Application pipeline's status set (`backend/prisma/schema.prisma`'s
 * `ApplicationStatus` enum, mirrored in `lib/career-applications-api.ts`) -
 * a sibling to `CmsStatusBadge` rather than an extension of it, since it's a
 * distinct vocabulary (an 8-stage pipeline, not draft/published/scheduled).
 * Same pill+dot shape/sizing so the two read as one visual language.
 */
export type CmsApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "SELECTED"
  | "REJECTED"
  | "JOINED"

const APPLICATION_STATUS_STYLES: Record<CmsApplicationStatus, { bg: string; text: string; dot: string; label: string }> = {
  APPLIED: { bg: "bg-slate-100", text: "text-slate-600", dot: "text-slate-400", label: "Applied" },
  UNDER_REVIEW: { bg: "bg-blue-50", text: "text-blue-700", dot: "text-blue-500", label: "Under Review" },
  SHORTLISTED: { bg: "bg-amber-50", text: "text-amber-700", dot: "text-amber-500", label: "Shortlisted" },
  INTERVIEW_SCHEDULED: { bg: "bg-purple-50", text: "text-purple-700", dot: "text-purple-500", label: "Interview Scheduled" },
  INTERVIEW_COMPLETED: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "text-indigo-500", label: "Interview Completed" },
  SELECTED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "text-emerald-500", label: "Selected" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "text-red-500", label: "Rejected" },
  JOINED: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "text-emerald-600", label: "Joined" },
}

export function CmsApplicationStatusBadge({ status }: { status: CmsApplicationStatus }) {
  const style = APPLICATION_STATUS_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <Circle className={`h-2 w-2 fill-current ${style.dot}`} />
      {style.label}
    </span>
  )
}

/**
 * The Announcement Engine's `AnnouncementPriority` (`lib/announcements-api.ts`)
 * - same pill+dot shape as `CmsStatusBadge`, a separate dimension (urgency,
 * not publish state) so it's a sibling export, not a new `CmsStatus` value.
 */
export type CmsAnnouncementPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW"

const PRIORITY_STYLES: Record<CmsAnnouncementPriority, { bg: string; text: string; dot: string; label: string }> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", dot: "text-red-500", label: "Critical" },
  HIGH: { bg: "bg-amber-50", text: "text-amber-700", dot: "text-amber-500", label: "High" },
  NORMAL: { bg: "bg-blue-50", text: "text-blue-700", dot: "text-blue-500", label: "Normal" },
  LOW: { bg: "bg-slate-100", text: "text-slate-600", dot: "text-slate-400", label: "Low" },
}

export function CmsPriorityBadge({ priority }: { priority: CmsAnnouncementPriority }) {
  const style = PRIORITY_STYLES[priority]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <Circle className={`h-2 w-2 fill-current ${style.dot}`} />
      {style.label}
    </span>
  )
}
