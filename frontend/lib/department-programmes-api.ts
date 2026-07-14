import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type ProgrammeLevel = "UG" | "PG" | "PHD" | "DIPLOMA";

export interface DepartmentProgramme {
  id: number;
  departmentId: number;
  name: string;
  level: ProgrammeLevel;
  intake: number;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DepartmentProgrammeInput {
  departmentId: number;
  name: string;
  level: ProgrammeLevel;
  intake: number;
  sortOrder?: number;
  isActive?: boolean;
}

export function getDepartmentProgrammesPublic(departmentId: number): Promise<DepartmentProgramme[]> {
  return apiGet<DepartmentProgramme[]>(`/department-programmes?departmentId=${departmentId}`);
}

export function getDepartmentProgrammesAdmin(
  departmentId?: number,
  includeDeleted = false,
): Promise<DepartmentProgramme[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<DepartmentProgramme[]>(`/department-programmes/admin${query}`);
}

export function createDepartmentProgramme(dto: DepartmentProgrammeInput): Promise<DepartmentProgramme> {
  return apiPost<DepartmentProgramme>("/department-programmes", dto);
}

export function updateDepartmentProgramme(
  id: number,
  dto: Partial<DepartmentProgrammeInput> & { version: number },
): Promise<DepartmentProgramme> {
  return apiPatch<DepartmentProgramme>(`/department-programmes/${id}`, dto);
}

export function deleteDepartmentProgramme(id: number): Promise<DepartmentProgramme> {
  return apiDelete<DepartmentProgramme>(`/department-programmes/${id}`);
}

export function restoreDepartmentProgramme(id: number): Promise<DepartmentProgramme> {
  return apiPost<DepartmentProgramme>(`/department-programmes/${id}/restore`);
}

export function reorderDepartmentProgrammes(
  items: { id: number; sortOrder: number }[],
): Promise<DepartmentProgramme[]> {
  return apiPatch<DepartmentProgramme[]>("/department-programmes/reorder", { items });
}
