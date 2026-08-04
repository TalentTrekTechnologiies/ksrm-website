import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type FacultyAchievementType =
  | "PUBLICATION"
  | "PATENT"
  | "BOOK"
  | "AWARD"
  | "CERTIFICATION";

export interface FacultyAchievement {
  id: number;
  facultyId: number;
  type: FacultyAchievementType;
  title: string;
  /** Journal, conference, publisher, or granting authority. */
  detail: string | null;
  /** DOI, ISSN/ISBN, patent or application number. */
  referenceNo: string | null;
  /** Publication date, or a patent's date of issue. */
  date: string | null;
  status: string | null;
  url: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface FacultyAchievementInput {
  facultyId: number;
  type: FacultyAchievementType;
  title: string;
  detail?: string;
  referenceNo?: string;
  date?: string | null;
  status?: string;
  url?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/** Plain-language names, used in both the admin form and the public profile. */
export const ACHIEVEMENT_TYPES: { value: FacultyAchievementType; label: string; plural: string }[] = [
  { value: "PUBLICATION", label: "Publication", plural: "Publications" },
  { value: "PATENT", label: "Patent", plural: "Patents" },
  { value: "BOOK", label: "Book / Chapter", plural: "Books & Chapters" },
  { value: "AWARD", label: "Award", plural: "Awards & Recognition" },
  { value: "CERTIFICATION", label: "Certification", plural: "Certifications" },
];

export function getFacultyAchievementsPublic(
  facultyId?: number,
  type?: FacultyAchievementType,
): Promise<FacultyAchievement[]> {
  const params = new URLSearchParams();
  if (facultyId !== undefined) params.set("facultyId", String(facultyId));
  if (type) params.set("type", type);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<FacultyAchievement[]>(`/faculty-achievements${query}`);
}

export function getFacultyAchievementsAdmin(
  facultyId?: number,
  includeDeleted = false,
): Promise<FacultyAchievement[]> {
  const params = new URLSearchParams();
  if (facultyId !== undefined) params.set("facultyId", String(facultyId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<FacultyAchievement[]>(`/faculty-achievements/admin${query}`);
}

export function createFacultyAchievement(
  dto: FacultyAchievementInput,
): Promise<FacultyAchievement> {
  return apiPost<FacultyAchievement>("/faculty-achievements", dto);
}

export function updateFacultyAchievement(
  id: number,
  dto: Partial<FacultyAchievementInput> & { version: number },
): Promise<FacultyAchievement> {
  return apiPatch<FacultyAchievement>(`/faculty-achievements/${id}`, dto);
}

export function deleteFacultyAchievement(id: number): Promise<FacultyAchievement> {
  return apiDelete<FacultyAchievement>(`/faculty-achievements/${id}`);
}
