import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

/**
 * KGCET's own content.
 *
 * Both resources hang off one endpoint (/kgcet/participation, /kgcet/highlights)
 * so the module reads as one thing in the admin and in the permission list -
 * `kgcet.view`, `kgcet.update` and so on, not one set per table.
 */
export type KgcetResource = "participation" | "highlights";

export interface KgcetParticipation {
  id: number;
  year: string;
  registered: number;
  attended: number;
  qualified: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface KgcetHighlight {
  id: number;
  icon: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface KgcetParticipationInput {
  year: string;
  registered?: number;
  attended?: number;
  qualified?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface KgcetHighlightInput {
  icon?: string | null;
  title: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export function getKgcetParticipationPublic(): Promise<KgcetParticipation[]> {
  return apiGet<KgcetParticipation[]>("/kgcet/participation");
}

export function getKgcetHighlightsPublic(): Promise<KgcetHighlight[]> {
  return apiGet<KgcetHighlight[]>("/kgcet/highlights");
}

export function getKgcetAdmin<T>(resource: KgcetResource, includeDeleted = false): Promise<T[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<T[]>(`/kgcet/${resource}/admin${query}`);
}

export function createKgcet<T>(
  resource: KgcetResource,
  dto: KgcetParticipationInput | KgcetHighlightInput,
): Promise<T> {
  return apiPost<T>(`/kgcet/${resource}`, dto);
}

export function updateKgcet<T>(
  resource: KgcetResource,
  id: number,
  dto: (Partial<KgcetParticipationInput> | Partial<KgcetHighlightInput>) & { version: number },
): Promise<T> {
  return apiPatch<T>(`/kgcet/${resource}/${id}`, dto);
}

export function deleteKgcet<T>(resource: KgcetResource, id: number): Promise<T> {
  return apiDelete<T>(`/kgcet/${resource}/${id}`);
}

export function restoreKgcet<T>(resource: KgcetResource, id: number): Promise<T> {
  return apiPost<T>(`/kgcet/${resource}/${id}/restore`);
}

/**
 * Takes the COMPLETE list of ids in its new order, not just the rows that
 * moved - array position becomes sortOrder, so a partial list would renumber
 * those rows from 0 and collide with the ones left out.
 */
export function reorderKgcet<T>(resource: KgcetResource, ids: number[]): Promise<T[]> {
  return apiPost<T[]>(`/kgcet/${resource}/reorder`, { ids });
}
