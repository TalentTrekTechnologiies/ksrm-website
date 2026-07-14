import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface ResearchRecord {
  id: number;
  title: string;
  authors: string;
  journal: string | null;
  year: number;
  department: string;
  departmentId: number | null;
  type: string;
  doiOrLink: string | null;
  mediaId: number | null;
  attachmentUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchRecordInput {
  title: string;
  authors: string;
  journal?: string;
  year: number;
  department?: string;
  departmentId?: number;
  type: string;
  doiOrLink?: string;
  /** Pass the picked Media's id (DOCUMENT type) to link it; pass `null` explicitly to unlink. */
  mediaId?: number | null;
  attachmentUrl?: string;
  isActive?: boolean;
}

// Research has no soft-delete/version columns by design (isActive is its
// hide/show toggle) - no restore/reorder endpoints exist for this module.
export function getResearchPublic(departmentId?: number): Promise<ResearchRecord[]> {
  const query = departmentId !== undefined ? `?departmentId=${departmentId}` : "";
  return apiGet<ResearchRecord[]>(`/research${query}`);
}

export function getResearchAdmin(departmentId?: number): Promise<ResearchRecord[]> {
  const query = departmentId !== undefined ? `?departmentId=${departmentId}` : "";
  return apiGet<ResearchRecord[]>(`/research/admin${query}`);
}

export function createResearch(dto: ResearchRecordInput): Promise<ResearchRecord> {
  return apiPost<ResearchRecord>("/research", dto);
}

export function updateResearch(id: number, dto: Partial<ResearchRecordInput>): Promise<ResearchRecord> {
  return apiPatch<ResearchRecord>(`/research/${id}`, dto);
}

export function deleteResearch(id: number): Promise<ResearchRecord> {
  return apiDelete<ResearchRecord>(`/research/${id}`);
}
