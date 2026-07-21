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
  /** Present on the public endpoint - lets a college-wide list (e.g. the
   * Diploma page) show which department a programme belongs to. */
  department?: { name: string; shortName: string | null; slug: string };
}

export interface DepartmentProgrammeInput {
  departmentId: number;
  name: string;
  level: ProgrammeLevel;
  intake: number;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Both filters optional. Pass a departmentId for one department's programmes
 * (department pages); pass just a level for a college-wide list - e.g.
 * `{ level: "DIPLOMA" }` for every diploma branch on the Diploma page.
 */
export function getDepartmentProgrammesPublic(
  departmentId?: number,
  level?: ProgrammeLevel,
): Promise<DepartmentProgramme[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (level) params.set("level", level);
  const query = params.toString();
  return apiGet<DepartmentProgramme[]>(`/department-programmes${query ? `?${query}` : ""}`);
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
