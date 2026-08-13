import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

/**
 * Which list on the Examinations page a record appears under.
 *
 * These used to be page-section slugs on Downloads, so publishing a result
 * meant a trip to Documents and a separate notice. One dropdown here now
 * decides where it lands.
 */
export type ExamNotificationType =
  | "NOTIFICATION"
  | "RESULT"
  | "TIMETABLE"
  | "QUESTION_PAPER"
  | "SYLLABUS"
  | "CALENDAR";

/** Plain-language names, used in the admin dropdown and the public headings. */
export const EXAM_TYPES: { value: ExamNotificationType; label: string; plural: string }[] = [
  { value: "NOTIFICATION", label: "Notification", plural: "Latest Notifications" },
  { value: "RESULT", label: "Result", plural: "Exam Results" },
  { value: "TIMETABLE", label: "Time Table", plural: "Time Tables" },
  { value: "QUESTION_PAPER", label: "Question Paper", plural: "Question Papers" },
  { value: "SYLLABUS", label: "Syllabus", plural: "Syllabus" },
  { value: "CALENDAR", label: "Academic Calendar", plural: "Academic Calendars" },
];

export interface ExamNotification {
  type: ExamNotificationType;
  mediaId: number | null;
  id: number;
  title: string;
  description: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  /** Academic year label, e.g. "AY 2026-27". The public list groups by this. */
  academicYear: string | null;
  startDate: string;
  endDate: string | null;
  isPublished: boolean;
  isActive: boolean;
  /** Manual display order, lowest first. Ties fall back to date. */
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamNotificationInput {
  type?: ExamNotificationType;
  mediaId?: number | null;
  title: string;
  description?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  academicYear?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive?: boolean;
}

export function getExamNotificationsPublic(type?: ExamNotificationType): Promise<ExamNotification[]> {
  return apiGet<ExamNotification[]>(`/exam-notifications${type ? `?type=${type}` : ""}`);
}

export function getExamNotificationsAdmin(type?: ExamNotificationType): Promise<ExamNotification[]> {
  return apiGet<ExamNotification[]>(`/exam-notifications/admin${type ? `?type=${type}` : ""}`);
}

export function createExamNotification(dto: ExamNotificationInput): Promise<ExamNotification> {
  return apiPost<ExamNotification>("/exam-notifications", dto);
}

export function updateExamNotification(
  id: number,
  dto: Partial<ExamNotificationInput>,
): Promise<ExamNotification> {
  return apiPatch<ExamNotification>(`/exam-notifications/${id}`, dto);
}

export function publishExamNotification(id: number): Promise<ExamNotification> {
  return apiPost<ExamNotification>(`/exam-notifications/${id}/publish`);
}

export function unpublishExamNotification(id: number): Promise<ExamNotification> {
  return apiPost<ExamNotification>(`/exam-notifications/${id}/unpublish`);
}

export function deleteExamNotification(id: number): Promise<ExamNotification> {
  return apiDelete<ExamNotification>(`/exam-notifications/${id}`);
}

/**
 * Drag-to-reorder: send the whole list in its new order.
 * Same contract as reorderFaculty / reorderDownloads.
 */
export function reorderExamNotifications(
  items: { id: number; sortOrder: number }[],
): Promise<ExamNotification[]> {
  return apiPatch<ExamNotification[]>("/exam-notifications/reorder", { items });
}
