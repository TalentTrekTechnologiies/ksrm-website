import { apiGet } from "./api-client";
import { getToken } from "./auth";

export interface AuditLogEntry {
  id: number;
  adminId: number;
  adminName: string;
  adminEmail: string;
  action: string;
  module: string;
  targetId: number | null;
  details: string | null;
  ipAddress: string | null;
  requestId: string | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogQuery {
  module?: string;
  adminId?: number;
  action?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

function buildQuery(query: AuditLogQuery): string {
  const params = new URLSearchParams();
  if (query.module) params.set("module", query.module);
  if (query.adminId) params.set("adminId", String(query.adminId));
  if (query.action) params.set("action", query.action);
  if (query.search) params.set("search", query.search);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function getAuditLogs(query: AuditLogQuery = {}): Promise<AuditLogListResponse> {
  return apiGet<AuditLogListResponse>(`/audit-logs${buildQuery(query)}`);
}

// Deliberately not a plain <a href> - the export route requires the same
// Bearer auth header every other admin request uses, which a bare link
// navigation can't attach. Fetches the CSV as a blob and triggers the
// browser's normal save-file flow instead.
export async function downloadAuditLogsCsv(query: AuditLogQuery = {}): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/audit-logs/export${buildQuery(query)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to export audit logs");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
