import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type DepartmentHighlightKind = "HIGHLIGHT" | "ACHIEVEMENT";

export interface DepartmentHighlight {
  id: number;
  departmentId: number;
  kind: DepartmentHighlightKind;
  title: string;
  description: string;
  imageUrl: string | null;
  mediaId: number | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DepartmentHighlightInput {
  departmentId: number;
  kind: DepartmentHighlightKind;
  title: string;
  description: string;
  imageUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to unlink. */
  mediaId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

export function getDepartmentHighlightsPublic(
  departmentId: number,
  kind?: DepartmentHighlightKind,
): Promise<DepartmentHighlight[]> {
  const params = new URLSearchParams({ departmentId: String(departmentId) });
  if (kind) params.set("kind", kind);
  return apiGet<DepartmentHighlight[]>(`/department-highlights?${params.toString()}`);
}

export function getDepartmentHighlightsAdmin(
  departmentId?: number,
  includeDeleted = false,
): Promise<DepartmentHighlight[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<DepartmentHighlight[]>(`/department-highlights/admin${query}`);
}

export function createDepartmentHighlight(dto: DepartmentHighlightInput): Promise<DepartmentHighlight> {
  return apiPost<DepartmentHighlight>("/department-highlights", dto);
}

export function updateDepartmentHighlight(
  id: number,
  dto: Partial<DepartmentHighlightInput> & { version: number },
): Promise<DepartmentHighlight> {
  return apiPatch<DepartmentHighlight>(`/department-highlights/${id}`, dto);
}

export function deleteDepartmentHighlight(id: number): Promise<DepartmentHighlight> {
  return apiDelete<DepartmentHighlight>(`/department-highlights/${id}`);
}

export function restoreDepartmentHighlight(id: number): Promise<DepartmentHighlight> {
  return apiPost<DepartmentHighlight>(`/department-highlights/${id}/restore`);
}

export function reorderDepartmentHighlights(
  items: { id: number; sortOrder: number }[],
): Promise<DepartmentHighlight[]> {
  return apiPatch<DepartmentHighlight[]>("/department-highlights/reorder", { items });
}
