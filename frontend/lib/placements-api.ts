import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Placement {
  id: number;
  studentName: string;
  company: string;
  package: string;
  department: string;
  year: number;
  imageUrl: string | null;
  /** Media Library reference for imageUrl, or null when using a
   * manually-typed URL (legacy path, still supported). */
  mediaId: number | null;
  createdAt: string;
  departmentId: number | null;
  companyLogoUrl: string | null;
  /** Media Library reference for companyLogoUrl. */
  companyLogoMediaId: number | null;
  isPublished: boolean;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface PlacementInput {
  studentName: string;
  company: string;
  package: string;
  department: string;
  year: number;
  imageUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  companyLogoUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing companyLogoUrl. */
  companyLogoMediaId?: number | null;
  isPublished?: boolean;
}

export function getPlacementsPublic(year?: number): Promise<Placement[]> {
  const query = year ? `?year=${year}` : "";
  return apiGet<Placement[]>(`/placements${query}`);
}

export function getPlacementsAdmin(includeDeleted = false): Promise<Placement[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Placement[]>(`/placements/admin${query}`);
}

export function createPlacement(dto: PlacementInput): Promise<Placement> {
  return apiPost<Placement>("/placements", dto);
}

export function updatePlacement(
  id: number,
  dto: Partial<PlacementInput> & { version: number },
): Promise<Placement> {
  return apiPatch<Placement>(`/placements/${id}`, dto);
}

export function deletePlacement(id: number): Promise<Placement> {
  return apiDelete<Placement>(`/placements/${id}`);
}

export function restorePlacement(id: number): Promise<Placement> {
  return apiPost<Placement>(`/placements/${id}/restore`);
}
