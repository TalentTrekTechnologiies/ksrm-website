import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type DownloadCategory = "SYLLABUS" | "QUESTION_PAPER" | "BROCHURE" | "AFFIDAVIT" | "FORM" | "OTHER";

// Page/section slugs a document can be routed to, so it appears on that
// public page's "Downloads & Resources" block. Keep the value (slug) stable;
// the label is what the admin sees in the dropdown.
export const PAGE_SECTIONS: { value: string; label: string }[] = [
  { value: "edc", label: "EDC — Entrepreneurship Development Cell" },
  { value: "iic", label: "IIC — Institution's Innovation Council" },
  { value: "iqac", label: "IQAC" },
  { value: "naac", label: "NAAC" },
  { value: "alumni", label: "Alumni" },
  { value: "syllabus", label: "Syllabus" },
  { value: "examinations", label: "Examinations" },
  { value: "research", label: "Research" },
  { value: "library", label: "Library" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "nss", label: "NSS" },
  { value: "hostels", label: "Hostels" },
  { value: "transport", label: "Transport" },
  { value: "anti-ragging", label: "Anti-Ragging" },
  { value: "admissions", label: "Admissions" },
  { value: "placements", label: "Placements" },
]

export interface Download {
  id: number;
  title: string;
  description: string | null;
  category: DownloadCategory;
  pageSection: string | null;
  groupLabel: string | null;
  fileUrl: string;
  /** Media Library reference, or null when using a manually-typed fileUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  departmentId: number | null;
  sortOrder: number;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DownloadInput {
  title: string;
  description?: string;
  category: DownloadCategory;
  pageSection?: string | null;
  groupLabel?: string | null;
  fileUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing fileUrl. */
  mediaId?: number | null;
  departmentId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export function getDownloadsPublic(
  category?: DownloadCategory,
  departmentId?: number,
  pageSection?: string,
): Promise<Download[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (pageSection) params.set("pageSection", pageSection);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Download[]>(`/downloads${query}`);
}

export function getDownloadsAdmin(includeDeleted = false, departmentId?: number, mediaId?: number): Promise<Download[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  if (mediaId !== undefined) params.set("mediaId", String(mediaId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Download[]>(`/downloads/admin${query}`);
}

export function createDownload(dto: DownloadInput): Promise<Download> {
  return apiPost<Download>("/downloads", dto);
}

export function updateDownload(
  id: number,
  dto: Partial<DownloadInput> & { version: number },
): Promise<Download> {
  return apiPatch<Download>(`/downloads/${id}`, dto);
}

export function deleteDownload(id: number): Promise<Download> {
  return apiDelete<Download>(`/downloads/${id}`);
}

export function restoreDownload(id: number): Promise<Download> {
  return apiPost<Download>(`/downloads/${id}/restore`);
}

export function reorderDownloads(items: { id: number; sortOrder: number }[]): Promise<Download[]> {
  return apiPatch<Download[]>("/downloads/reorder", { items });
}
