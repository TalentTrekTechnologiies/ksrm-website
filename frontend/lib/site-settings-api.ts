import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from "./api-client";

export type SiteSettingType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON" | "URL" | "EMAIL" | "IMAGE_URL";

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  /** Media Library reference, only meaningful when type is IMAGE_URL. */
  mediaId: number | null;
  type: SiteSettingType;
  group: string;
  isPublic: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: number | null;
}

export interface SiteSettingInput {
  key: string;
  value: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing value. */
  mediaId?: number | null;
  type: SiteSettingType;
  group: string;
  isPublic?: boolean;
  description?: string | null;
}

export function getSiteSettings(group?: string): Promise<SiteSetting[]> {
  const query = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiGet<SiteSetting[]>(`/site-settings${query}`);
}

export function createSiteSetting(dto: SiteSettingInput): Promise<SiteSetting> {
  return apiPost<SiteSetting>("/site-settings", dto);
}

export function updateSiteSetting(id: number, dto: Partial<SiteSettingInput>): Promise<SiteSetting> {
  return apiPatch<SiteSetting>(`/site-settings/${id}`, dto);
}

export function deleteSiteSetting(id: number): Promise<SiteSetting> {
  return apiDelete<SiteSetting>(`/site-settings/${id}`);
}

/** Public, unauthenticated - only isPublic:true rows, key/value only.
 * Used by the public site (Header logo/favicon, footer, ticker settings)
 * so none of it needs a login. */
export function getPublicSiteSettings(group?: string): Promise<Record<string, string>> {
  const query = group ? `?group=${encodeURIComponent(group)}` : "";
  return apiFetch<Record<string, string>>(`/site-settings/public${query}`, {
    method: "GET",
    cache: "no-store",
  });
}

export interface SystemInfo {
  version: string;
  environment: string;
  storageUsedBytes: string;
}

export function getSystemInfo(): Promise<SystemInfo> {
  return apiGet<SystemInfo>("/site-settings/system-info");
}

export function sendTestEmail(to: string): Promise<{ sent: boolean; to: string }> {
  return apiPost<{ sent: boolean; to: string }>("/site-settings/test-email", { to });
}
