import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

/**
 * Only meaningful for the global office directory (departmentId: null). The
 * public Contact page renders two visually different blocks from this same
 * table: "info" is the single-fact icon row at the top (Address/Phone/Email -
 * one of address/phones/emails set per row), "directory" is the office card
 * grid below it (Principal/Admissions/Exam/Placement - a name plus its own
 * phones/emails/address). A department's own Contact tab ignores this and
 * always renders as one directory-style grid.
 */
export type ContactChannelGroup = "info" | "directory";

export interface ContactChannel {
  id: number;
  departmentId: number | null;
  group: string;
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
  group?: ContactChannelGroup;
  name: string;
  phones?: string[];
  emails?: string[];
  address?: string;
  mapEmbedUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function getContactChannelsPublic(
  departmentId?: number,
  group?: ContactChannelGroup,
): Promise<ContactChannel[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (group) params.set("group", group);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<ContactChannel[]>(`/contact-channels${query}`);
}

/**
 * `departmentId`: omit for no department filter (every row, rarely wanted);
 * pass `null` explicitly for the global directory only; pass a number for one
 * department. `undefined` and `null` are genuinely different requests here -
 * see the backend controller's own comment on why.
 */
export function getContactChannelsAdmin(
  departmentId?: number | null,
  includeDeleted = false,
  group?: ContactChannelGroup,
): Promise<ContactChannel[]> {
  const params = new URLSearchParams();
  if (departmentId === null) params.set("global", "true");
  else if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  if (group) params.set("group", group);
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
