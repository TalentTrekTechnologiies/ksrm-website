import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Lab {
  id: number;
  departmentId: number;
  name: string;
  description: string;
  imageUrl: string | null;
  mediaId: number | null;
  capacity: number | null;
  equipment: string[];
  inChargeFacultyId: number | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface LabInput {
  departmentId: number;
  name: string;
  description: string;
  imageUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to unlink. */
  mediaId?: number | null;
  capacity?: number;
  equipment?: string[];
  inChargeFacultyId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export function getLabsPublic(departmentId: number): Promise<Lab[]> {
  return apiGet<Lab[]>(`/labs?departmentId=${departmentId}`);
}

export function getLabsAdmin(departmentId?: number, includeDeleted = false): Promise<Lab[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Lab[]>(`/labs/admin${query}`);
}

export function createLab(dto: LabInput): Promise<Lab> {
  return apiPost<Lab>("/labs", dto);
}

export function updateLab(id: number, dto: Partial<LabInput> & { version: number }): Promise<Lab> {
  return apiPatch<Lab>(`/labs/${id}`, dto);
}

export function deleteLab(id: number): Promise<Lab> {
  return apiDelete<Lab>(`/labs/${id}`);
}

export function restoreLab(id: number): Promise<Lab> {
  return apiPost<Lab>(`/labs/${id}/restore`);
}

export function reorderLabs(items: { id: number; sortOrder: number }[]): Promise<Lab[]> {
  return apiPatch<Lab[]>("/labs/reorder", { items });
}
