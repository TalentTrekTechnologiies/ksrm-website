import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";
import type { VisibilityWrapped } from "./homepage-api";

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  /** Media Library reference, or null when using a manually-typed imageUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  date: string;
  isPublished: boolean;
  isFeatured: boolean;
  slug: string | null;
  categoryId: number | null;
  authorAdminId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
  /** Optional video and document attachments, alongside the image. */
  videoUrl: string | null;
  videoMediaId: number | null;
  documentUrl: string | null;
  documentMediaId: number | null;

}

export interface NewsArticleInput {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  date: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  videoUrl?: string;
  videoMediaId?: number | null;
  documentUrl?: string;
  documentMediaId?: number | null;

}

// Public listing - the homepage's Latest News teaser (visibility-gated via
// homepage.visibility.latestNews) and, eventually, a standalone /news
// listing page consume this same endpoint. See news.controller.ts's note
// on why only the homepage teaser respects `visible: false`.
export function getNewsPublic(category?: string): Promise<VisibilityWrapped<NewsArticle>> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiGet<VisibilityWrapped<NewsArticle>>(`/news${query}`);
}

// Convenience wrapper for the homepage's Latest News section - always
// returns a plain array (empty when hidden or genuinely empty), since the
// public component only needs "should I hide the section" vs "what do I
// render", not the raw wrapper shape.
export async function getLatestNewsForHomepage(limit = 3): Promise<{ visible: boolean; articles: NewsArticle[] }> {
  const { visible, items } = await getNewsPublic();
  return { visible, articles: items.slice(0, limit) };
}

export function getNewsAdmin(includeDeleted = false): Promise<NewsArticle[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<NewsArticle[]>(`/news/admin${query}`);
}

export function getNewsOne(id: number): Promise<NewsArticle> {
  return apiGet<NewsArticle>(`/news/${id}`);
}

export function createNewsArticle(dto: NewsArticleInput): Promise<NewsArticle> {
  return apiPost<NewsArticle>("/news", dto);
}

export function updateNewsArticle(
  id: number,
  dto: Partial<NewsArticleInput> & { version: number },
): Promise<NewsArticle> {
  return apiPatch<NewsArticle>(`/news/${id}`, dto);
}

export function deleteNewsArticle(id: number): Promise<NewsArticle> {
  return apiDelete<NewsArticle>(`/news/${id}`);
}

export function restoreNewsArticle(id: number): Promise<NewsArticle> {
  return apiPost<NewsArticle>(`/news/${id}/restore`);
}
