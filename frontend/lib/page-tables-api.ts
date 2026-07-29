import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

/**
 * Editable tables of page text (fee structures, courses & intake, ...). Pages
 * render their CMS table when one exists and fall back to their built-in list
 * otherwise, so a page is never empty if the API is unreachable.
 */
export interface PageTable {
  id: number;
  key: string;
  pageSection: string;
  title: string;
  columns: string[];
  rows: string[][];
  footnote: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface PageTableInput {
  key: string;
  pageSection: string;
  title: string;
  columns: string[];
  rows: string[][];
  footnote?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function getPageTablesPublic(pageSection?: string): Promise<PageTable[]> {
  const q = pageSection ? `?pageSection=${encodeURIComponent(pageSection)}` : "";
  return apiGet<PageTable[]>(`/page-tables${q}`);
}

export function getPageTablesAdmin(pageSection?: string): Promise<PageTable[]> {
  const q = pageSection ? `?pageSection=${encodeURIComponent(pageSection)}` : "";
  return apiGet<PageTable[]>(`/page-tables/admin${q}`);
}

export function createPageTable(dto: PageTableInput): Promise<PageTable> {
  return apiPost<PageTable>("/page-tables", dto);
}

export function updatePageTable(
  id: number,
  dto: Partial<PageTableInput> & { version: number },
): Promise<PageTable> {
  return apiPatch<PageTable>(`/page-tables/${id}`, dto);
}

export function deletePageTable(id: number): Promise<PageTable> {
  return apiDelete<PageTable>(`/page-tables/${id}`);
}
