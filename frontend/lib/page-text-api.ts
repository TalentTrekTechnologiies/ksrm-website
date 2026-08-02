import { apiGet, apiPut, apiDelete } from "./api-client";

export interface PageText {
  id: number;
  /** Namespaced slot key, e.g. "library.about.p1". */
  key: string;
  pageSection: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PageTextItemInput {
  key: string;
  pageSection: string;
  value: string;
}

/** Overrides for one page, or every page when the section is omitted. */
export function getPageTextPublic(pageSection?: string): Promise<PageText[]> {
  const query = pageSection ? `?pageSection=${encodeURIComponent(pageSection)}` : "";
  return apiGet<PageText[]>(`/page-text${query}`);
}

export function getPageTextAdmin(pageSection?: string): Promise<PageText[]> {
  const query = pageSection ? `?pageSection=${encodeURIComponent(pageSection)}` : "";
  return apiGet<PageText[]>(`/page-text/admin${query}`);
}

/** Saves a page's edits in one request. */
export function savePageText(items: PageTextItemInput[]): Promise<PageText[]> {
  return apiPut<PageText[]>("/page-text", { items });
}

/** Removes one override so the page falls back to its built-in wording. */
export function resetPageText(key: string): Promise<{ key: string; reset: boolean }> {
  return apiDelete<{ key: string; reset: boolean }>(`/page-text/${encodeURIComponent(key)}`);
}
