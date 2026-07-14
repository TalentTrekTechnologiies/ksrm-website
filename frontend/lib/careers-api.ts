import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Career {
  id: number;
  title: string;
  department: string | null;
  employmentType: string | null;
  location: string | null;
  description: string;
  applyUrl: string | null;
  applyEmail: string | null;
  postedAt: string;
  closingAt: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface CareerInput {
  title: string;
  department?: string;
  employmentType?: string;
  location?: string;
  description: string;
  applyUrl?: string;
  applyEmail?: string;
  closingAt?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function getCareersPublic(): Promise<Career[]> {
  return apiGet<Career[]>("/careers");
}

export function getCareersAdmin(includeDeleted = false): Promise<Career[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Career[]>(`/careers/admin${query}`);
}

export function createCareer(dto: CareerInput): Promise<Career> {
  return apiPost<Career>("/careers", dto);
}

export function updateCareer(
  id: number,
  dto: Partial<CareerInput> & { version: number },
): Promise<Career> {
  return apiPatch<Career>(`/careers/${id}`, dto);
}

export function deleteCareer(id: number): Promise<Career> {
  return apiDelete<Career>(`/careers/${id}`);
}

export function restoreCareer(id: number): Promise<Career> {
  return apiPost<Career>(`/careers/${id}/restore`);
}
