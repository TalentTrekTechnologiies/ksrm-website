import { apiGet } from "./api-client";

export interface DashboardWidget {
  key: string;
  label: string;
  count: number;
  available: boolean;
}

export interface DashboardOverview {
  widgets: DashboardWidget[];
  generatedAt: string;
}

export interface RecentActivityItem {
  id: number;
  module: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  targetId: number | null;
  adminName: string;
  createdAt: string;
}

export interface RecentActivity {
  items: RecentActivityItem[];
}

export interface PendingApprovals {
  items: unknown[];
  count: number;
  note: string;
}

export interface StorageInfo {
  usedBytes: number;
  totalBytes: number;
  breakdown: unknown[];
  note: string;
}

export function getDashboardOverview(): Promise<DashboardOverview> {
  return apiGet<DashboardOverview>("/dashboard/overview");
}

export function getRecentActivity(limit = 10): Promise<RecentActivity> {
  return apiGet<RecentActivity>(`/dashboard/recent-activity?limit=${limit}`);
}

export function getPendingApprovals(): Promise<PendingApprovals> {
  return apiGet<PendingApprovals>("/dashboard/pending-approvals");
}

export function getStorageInfo(): Promise<StorageInfo> {
  return apiGet<StorageInfo>("/dashboard/storage");
}
