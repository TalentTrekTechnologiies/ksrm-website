import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface GalleryImage {
  id: number;
  title: string;
  imageUrl: string;
  /** Media Library reference, or null when using a manually-typed imageUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  category: string;
  pageSection: string | null;
  date: string | null;
  isActive: boolean;
  createdAt: string;
  categoryId: number | null;
  departmentId: number | null;
  sortOrder: number;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface GalleryImageInput {
  title: string;
  imageUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  category?: string;
  pageSection?: string | null;
  date?: string;
  sortOrder?: number;
  isActive?: boolean;
  categoryId?: number;
  departmentId?: number;
}

// Public listing - no visibility wrapper (gallery isn't one of the Sprint 1C
// homepage-teaser sections), just a plain array. Empty/error stays the
// caller's problem to fall back on (see the public /gallery page).
export function getGalleryPublic(
  category?: string,
  departmentId?: number,
  pageSection?: string,
): Promise<GalleryImage[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (pageSection) params.set("pageSection", pageSection);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<GalleryImage[]>(`/gallery${query}`);
}

export function getGalleryAdmin(includeDeleted = false, departmentId?: number, mediaId?: number): Promise<GalleryImage[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  if (mediaId !== undefined) params.set("mediaId", String(mediaId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<GalleryImage[]>(`/gallery/admin${query}`);
}

export function createGalleryImage(dto: GalleryImageInput): Promise<GalleryImage> {
  return apiPost<GalleryImage>("/gallery", dto);
}

export function updateGalleryImage(
  id: number,
  dto: Partial<GalleryImageInput> & { version: number },
): Promise<GalleryImage> {
  return apiPatch<GalleryImage>(`/gallery/${id}`, dto);
}

export function deleteGalleryImage(id: number): Promise<GalleryImage> {
  return apiDelete<GalleryImage>(`/gallery/${id}`);
}

export function restoreGalleryImage(id: number): Promise<GalleryImage> {
  return apiPost<GalleryImage>(`/gallery/${id}/restore`);
}

export function reorderGalleryImages(
  items: { id: number; sortOrder: number }[],
): Promise<GalleryImage[]> {
  return apiPatch<GalleryImage[]>("/gallery/reorder", { items });
}
