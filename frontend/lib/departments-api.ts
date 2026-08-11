import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface Department {
  id: number;
  slug: string;
  name: string;
  shortName: string | null;
  tagline: string | null;
  intro: string | null;
  about: string;
  /** The Student Chapter's own "About Us" text - distinct from `about`,
   *  which describes the department itself. */
  studentChapterAbout: string | null;
  aboutVideoUrl: string | null;
  heroImageUrl: string | null;
  /** Media Library reference for heroImageUrl, or null when using a
   * manually-typed URL (legacy path, still supported). */
  heroMediaId: number | null;
  vision: string | null;
  mission: string[];
  establishedYear: number | null;
  hodId: number | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DepartmentInput {
  slug: string;
  name: string;
  shortName?: string | null;
  tagline?: string | null;
  intro?: string;
  about: string;
  studentChapterAbout?: string | null;
  /** Video shown beside the About text on the department page. */
  aboutVideoUrl?: string | null;
  heroImageUrl?: string | null;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing heroImageUrl. */
  heroMediaId?: number | null;
  vision?: string | null;
  mission?: string[];
  establishedYear?: number;
  isActive?: boolean;
}

export function getDepartmentsPublic(): Promise<Department[]> {
  return apiGet<Department[]>("/departments");
}

/**
 * Department rows that are real offices rather than teaching departments, and
 * so are left out of "pick a department" lists on the academic screens.
 *
 * Keyed on slug, which is stable and unique - the previous check tested for a
 * slug of "library" (the real one is "central-library", so that half never
 * matched anything) and otherwise relied on the display name being exactly
 * "Central Library", meaning renaming the department in the CMS would quietly
 * put it back in the academic lists. It also missed the Examination Section
 * entirely, which was the bug this helper existed to prevent.
 */
const NON_ACADEMIC_DEPARTMENT_SLUGS = new Set(["central-library", "examination-section"]);

export function isAcademicDepartment(department: Department): boolean {
  return !NON_ACADEMIC_DEPARTMENT_SLUGS.has(department.slug.trim().toLowerCase());
}

export function getDepartmentsAdmin(includeDeleted = false): Promise<Department[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Department[]>(`/departments/admin${query}`);
}

// Admin single-record fetch by id, regardless of isActive/deletedAt - used
// by the per-department Workspace UI (/admin/departments/[id]/...).
export function getDepartmentAdmin(id: number): Promise<Department> {
  return apiGet<Department>(`/departments/admin/${id}`);
}

export function createDepartment(dto: DepartmentInput): Promise<Department> {
  return apiPost<Department>("/departments", dto);
}

export function updateDepartment(
  id: number,
  dto: Partial<DepartmentInput> & { version: number },
): Promise<Department> {
  return apiPatch<Department>(`/departments/${id}`, dto);
}

export function deleteDepartment(id: number): Promise<Department> {
  return apiDelete<Department>(`/departments/${id}`);
}

export function restoreDepartment(id: number): Promise<Department> {
  return apiPost<Department>(`/departments/${id}/restore`);
}
