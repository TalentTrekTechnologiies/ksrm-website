import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  adminCount: number;
  permissionKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  key: string;
  description: string | null;
}

export interface RoleInput {
  name: string;
  description?: string | null;
  permissionKeys: string[];
}

export function getRoles(): Promise<Role[]> {
  return apiGet<Role[]>("/roles");
}

export function getPermissions(): Promise<Permission[]> {
  return apiGet<Permission[]>("/permissions");
}

export function createRole(dto: RoleInput): Promise<Role> {
  return apiPost<Role>("/roles", dto);
}

export function updateRole(id: number, dto: Partial<RoleInput>): Promise<Role> {
  return apiPatch<Role>(`/roles/${id}`, dto);
}

export function deleteRole(id: number): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/roles/${id}`);
}
