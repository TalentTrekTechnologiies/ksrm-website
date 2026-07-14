import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface ContactChannel {
  id: number;
  departmentId: number | null;
  name: string;
  phones: string[];
  emails: string[];
  address: string | null;
  mapEmbedUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface ContactChannelInput {
  /** Omit for the global office directory; set for one department's Contact tab. */
  departmentId?: number;
  name: string;
  phones?: string[];
  emails?: string[];
  address?: string;
  mapEmbedUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function getContactChannelsPublic(departmentId?: number): Promise<ContactChannel[]> {
  const query = departmentId !== undefined ? `?departmentId=${departmentId}` : "";
  return apiGet<ContactChannel[]>(`/contact-channels${query}`);
}

export function getContactChannelsAdmin(departmentId?: number, includeDeleted = false): Promise<ContactChannel[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<ContactChannel[]>(`/contact-channels/admin${query}`);
}

export function createContactChannel(dto: ContactChannelInput): Promise<ContactChannel> {
  return apiPost<ContactChannel>("/contact-channels", dto);
}

export function updateContactChannel(
  id: number,
  dto: Partial<ContactChannelInput> & { version: number },
): Promise<ContactChannel> {
  return apiPatch<ContactChannel>(`/contact-channels/${id}`, dto);
}

export function deleteContactChannel(id: number): Promise<ContactChannel> {
  return apiDelete<ContactChannel>(`/contact-channels/${id}`);
}

export function restoreContactChannel(id: number): Promise<ContactChannel> {
  return apiPost<ContactChannel>(`/contact-channels/${id}/restore`);
}

export function reorderContactChannels(items: { id: number; sortOrder: number }[]): Promise<ContactChannel[]> {
  return apiPatch<ContactChannel[]>("/contact-channels/reorder", { items });
}
