import { apiGet, apiPatch } from "./api-client";

export interface DisplaySettingCatalogEntry {
  key: string;
  section: string;
  label: string;
}

export interface DisplaySettingAdminEntry extends DisplaySettingCatalogEntry {
  value: boolean;
  isOverridden: boolean;
}

export function getDisplaySettingsCatalog(): Promise<DisplaySettingCatalogEntry[]> {
  return apiGet<DisplaySettingCatalogEntry[]>("/department-display-settings/catalog");
}

// Public: merged effective key -> visible map (absent key defaults true).
export function getEffectiveDisplaySettings(departmentId: number): Promise<Record<string, boolean>> {
  return apiGet<Record<string, boolean>>(`/department-display-settings?departmentId=${departmentId}`);
}

export function getDisplaySettingsAdmin(departmentId: number): Promise<DisplaySettingAdminEntry[]> {
  return apiGet<DisplaySettingAdminEntry[]>(`/department-display-settings/admin?departmentId=${departmentId}`);
}

export function setDisplaySetting(departmentId: number, key: string, value: boolean) {
  return apiPatch("/department-display-settings", { departmentId, key, value });
}

export function bulkSetDisplaySettings(
  departmentId: number,
  settings: { key: string; value: boolean }[],
): Promise<DisplaySettingAdminEntry[]> {
  return apiPatch<DisplaySettingAdminEntry[]>("/department-display-settings/bulk", { departmentId, settings });
}
