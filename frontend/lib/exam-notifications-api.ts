import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface ExamNotification {
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
  createdAt: string;
  updatedAt: string;
}

export interface ExamNotificationInput {
  title: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  academicYear?: string;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

export function getExamNotificationsPublic(): Promise<ExamNotification[]> {
  return apiGet<ExamNotification[]>("/exam-notifications");
}

export function getExamNotificationsAdmin(): Promise<ExamNotification[]> {
  return apiGet<ExamNotification[]>("/exam-notifications/admin");
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
