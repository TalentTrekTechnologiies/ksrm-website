import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface AdminRoleRef {
  id: number;
  name: string;
}

export interface Admin {
  id: number;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  department: string | null;
  departmentId: number | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
  roles: AdminRoleRef[];
}

export interface AdminListResponse {
  items: Admin[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminStatusFilter = "active" | "disabled" | "deleted" | "all";

export interface AdminQuery {
  search?: string;
  status?: AdminStatusFilter;
  roleId?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  name: string;
  department?: string | null;
  departmentId?: number;
  roleIds?: number[];
  isSuperAdmin?: boolean;
}

export interface UpdateAdminInput {
  email?: string | null;
  name?: string;
  department?: string | null;
  /** Explicit `null` clears the department scope; omit the key to leave it
   * unchanged (matches the mediaId:null "unlink" convention). */
  departmentId?: number | null;
  version: number;
}

function buildQuery(query: AdminQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.roleId) params.set("roleId", String(query.roleId));
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function getAdmins(query: AdminQuery = {}): Promise<AdminListResponse> {
  return apiGet<AdminListResponse>(`/admins${buildQuery(query)}`);
}

export function getAdmin(id: number): Promise<Admin> {
  return apiGet<Admin>(`/admins/${id}`);
}

export function createAdmin(dto: CreateAdminInput): Promise<Admin> {
  return apiPost<Admin>("/admins", dto);
}

export function updateAdmin(id: number, dto: UpdateAdminInput): Promise<Admin> {
  return apiPatch<Admin>(`/admins/${id}`, dto);
}

export function setAdminStatus(id: number, isActive: boolean): Promise<Admin> {
  return apiPatch<Admin>(`/admins/${id}/status`, { isActive });
}

export function resetAdminPassword(id: number, newPassword: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`/admins/${id}/reset-password`, { newPassword });
}

export function assignAdminRoles(id: number, roleIds: number[]): Promise<Admin> {
  return apiPatch<Admin>(`/admins/${id}/roles`, { roleIds });
}

export function deleteAdmin(id: number): Promise<Admin> {
  return apiDelete<Admin>(`/admins/${id}`);
}

export function restoreAdmin(id: number): Promise<Admin> {
  return apiPost<Admin>(`/admins/${id}/restore`);
}
