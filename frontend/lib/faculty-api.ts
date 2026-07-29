import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Faculty {
  id: number;
  name: string;
  designation: string;
  qualification: string;
  department: string;
  specialization: string | null;
  experience: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  /** Media Library reference, or null when using a manually-typed photoUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  isHod: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  departmentId: number | null;
  welcomeMessage: string | null;
  sortOrder: number;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface FacultyInput {
  name: string;
  designation: string;
  qualification: string;
  department: string;
  departmentId?: number;
  specialization?: string;
  experience?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing photoUrl. */
  mediaId?: number | null;
  isHod?: boolean;
  welcomeMessage?: string;
  sortOrder?: number;
}

export function getFacultyPublic(department?: string, departmentId?: number): Promise<Faculty[]> {
  const params = new URLSearchParams();
  if (department) params.set("department", department);
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Faculty[]>(`/faculty${query}`);
}

export function getFacultyAdmin(includeDeleted = false, departmentId?: number): Promise<Faculty[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Faculty[]>(`/faculty/admin${query}`);
}

export function createFaculty(dto: FacultyInput): Promise<Faculty> {
  return apiPost<Faculty>("/faculty", dto);
}

export function updateFaculty(
  id: number,
  dto: Partial<FacultyInput> & { version: number },
): Promise<Faculty> {
  return apiPatch<Faculty>(`/faculty/${id}`, dto);
}

export function deleteFaculty(id: number): Promise<Faculty> {
  return apiDelete<Faculty>(`/faculty/${id}`);
}

export function restoreFaculty(id: number): Promise<Faculty> {
  return apiPost<Faculty>(`/faculty/${id}/restore`);
}
