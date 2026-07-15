import { apiGet, apiPost } from "./api-client";

/** Mirrors the backend AdminNotificationType enum. */
export type AdminNotificationType = string;

export interface AdminNotification {
  id: number;
  adminId: number;
  type: AdminNotificationType;
  title: string;
  message: string | null;
  /** Admin-relative path the item navigates to, e.g. "/admin/careers/applications". */
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/**
 * The caller's own notifications. Every route is scoped server-side to the
 * authenticated admin (req.user.id), so there is no adminId parameter here.
 */
export function getAdminNotifications(opts?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<AdminNotification[]> {
  const q = new URLSearchParams();
  if (opts?.unreadOnly) q.set("unreadOnly", "true");
  if (opts?.limit) q.set("limit", String(opts.limit));
  const qs = q.toString();
  return apiGet<AdminNotification[]>(`/admin-notifications${qs ? `?${qs}` : ""}`);
}

export function getUnreadNotificationCount(): Promise<{ count: number }> {
  return apiGet<{ count: number }>("/admin-notifications/unread-count");
}

export function markNotificationRead(id: number): Promise<AdminNotification> {
  return apiPost<AdminNotification>(`/admin-notifications/${id}/read`);
}

export function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>("/admin-notifications/read-all");
}
