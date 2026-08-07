import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface EventItem {
  id: number;
  title: string;
  /** Short byline under the title, e.g. "Part of SIVANANDA SMARANAM 2K26". */
  subtitle: string | null;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  /** Media Library reference, or null when using a manually-typed imageUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  category: string | null;
  /** Pill tags, e.g. competition strands for a multi-strand fest. */
  tags: string[];
  prizePool: string | null;
  organizerName: string | null;
  sortOrder: number;
  isActive: boolean;
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
  /** Null is a college-wide event, shown on the public Events page. A Student
   *  Chapter's own events set this to that department's id. */
  departmentId: number | null;
}

export interface EventInput {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  eventDate: string;
  endDate?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  category?: string | null;
  tags?: string[];
  prizePool?: string | null;
  organizerName?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  videoUrl?: string | null;
  videoMediaId?: number | null;
  documentUrl?: string | null;
  documentMediaId?: number | null;
  departmentId?: number | null;
}

export function getEventsPublic(departmentId?: number): Promise<EventItem[]> {
  const query = departmentId !== undefined ? `?departmentId=${departmentId}` : "";
  return apiGet<EventItem[]>(`/events${query}`);
}

export function getEventsAdmin(includeDeleted = false, departmentId?: number): Promise<EventItem[]> {
  const params = new URLSearchParams();
  if (includeDeleted) params.set("includeDeleted", "true");
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  const query = params.toString();
  return apiGet<EventItem[]>(`/events/admin${query ? `?${query}` : ""}`);
}

export function createEvent(dto: EventInput): Promise<EventItem> {
  return apiPost<EventItem>("/events", dto);
}

export function updateEvent(
  id: number,
  dto: Partial<EventInput> & { version: number },
): Promise<EventItem> {
  return apiPatch<EventItem>(`/events/${id}`, dto);
}

export function deleteEvent(id: number): Promise<EventItem> {
  return apiDelete<EventItem>(`/events/${id}`);
}

export function restoreEvent(id: number): Promise<EventItem> {
  return apiPost<EventItem>(`/events/${id}/restore`);
}

/**
 * Reorders a set of events by sortOrder. The endpoint validates against every
 * event, not just these, and returns the whole site-wide list - which is not
 * what a department-scoped caller wants back, so callers here should re-fetch
 * their own scoped list afterward rather than trust this call's return value.
 */
export function reorderEvents(items: { id: number; sortOrder: number }[]): Promise<EventItem[]> {
  return apiPatch<EventItem[]>("/events/reorder", { items });
}
