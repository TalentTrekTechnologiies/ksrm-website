import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface ResearchRecord {
  id: number;
  title: string;
  authors: string;
  journal: string | null;
  year: number;
  department: string;
  departmentId: number | null;
  facultyId: number | null;
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
  journal?: string | null;
  year: number;
  department?: string | null;
  departmentId?: number;
  facultyId?: number | null;
  type: string;
  doiOrLink?: string | null;
  /** Pass the picked Media's id (DOCUMENT type) to link it; pass `null` explicitly to unlink. */
  mediaId?: number | null;
  attachmentUrl?: string | null;
  isActive?: boolean;
}

// Research has no soft-delete/version columns by design (isActive is its
// hide/show toggle) - no restore/reorder endpoints exist for this module.
export function getResearchPublic(departmentId?: number, facultyId?: number): Promise<ResearchRecord[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (facultyId !== undefined) params.set("facultyId", String(facultyId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<ResearchRecord[]>(`/research${query}`);
}

export function getResearchAdmin(departmentId?: number, facultyId?: number): Promise<ResearchRecord[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (facultyId !== undefined) params.set("facultyId", String(facultyId));
  const query = params.toString() ? `?${params.toString()}` : "";
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
