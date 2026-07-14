import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Department {
  id: number;
  slug: string;
  name: string;
  shortName: string | null;
  tagline: string | null;
  intro: string | null;
  about: string;
  aboutVideoUrl: string | null;
  heroImageUrl: string | null;
  /** Media Library reference for heroImageUrl, or null when using a
   * manually-typed URL (legacy path, still supported). */
  heroMediaId: number | null;
  vision: string | null;
  mission: string[];
  establishedYear: number | null;
  hodId: number | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DepartmentInput {
  slug: string;
  name: string;
  shortName?: string;
  tagline?: string;
  intro?: string;
  about: string;
  heroImageUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing heroImageUrl. */
  heroMediaId?: number | null;
  vision?: string;
  mission?: string[];
  establishedYear?: number;
  isActive?: boolean;
}

export function getDepartmentsPublic(): Promise<Department[]> {
  return apiGet<Department[]>("/departments");
}

export function getDepartmentsAdmin(includeDeleted = false): Promise<Department[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Department[]>(`/departments/admin${query}`);
}

// Admin single-record fetch by id, regardless of isActive/deletedAt - used
// by the per-department Workspace UI (/admin/departments/[id]/...).
export function getDepartmentAdmin(id: number): Promise<Department> {
  return apiGet<Department>(`/departments/admin/${id}`);
}

export function createDepartment(dto: DepartmentInput): Promise<Department> {
  return apiPost<Department>("/departments", dto);
}

export function updateDepartment(
  id: number,
  dto: Partial<DepartmentInput> & { version: number },
): Promise<Department> {
  return apiPatch<Department>(`/departments/${id}`, dto);
}

export function deleteDepartment(id: number): Promise<Department> {
  return apiDelete<Department>(`/departments/${id}`);
}

export function restoreDepartment(id: number): Promise<Department> {
  return apiPost<Department>(`/departments/${id}/restore`);
}
