import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface EventItem {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  /** Media Library reference, or null when using a manually-typed imageUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  category: string | null;
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

}

export interface EventInput {
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  location?: string;
  imageUrl?: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  videoUrl?: string;
  videoMediaId?: number | null;
  documentUrl?: string;
  documentMediaId?: number | null;

}

export function getEventsPublic(): Promise<EventItem[]> {
  return apiGet<EventItem[]>("/events");
}

export function getEventsAdmin(includeDeleted = false): Promise<EventItem[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<EventItem[]>(`/events/admin${query}`);
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
