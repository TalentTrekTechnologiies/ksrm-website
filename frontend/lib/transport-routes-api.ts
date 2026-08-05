import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface TransportRoute {
  id: number;
  routeNo: string;
  fromPlace: string;
  via: string | null;
  departTime: string | null;
  returnTime: string | null;
  fee: string | null;
  busNo: string | null;
  driverName: string | null;
  driverPhone: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

/**
 * Optional fields accept `null` as well as a string, and the difference
 * matters on update: omitting a key leaves the stored value untouched, so a
 * field the admin cleared has to be sent as an explicit `null` to be removed.
 */
export interface TransportRouteInput {
  routeNo: string;
  fromPlace: string;
  via?: string | null;
  departTime?: string | null;
  returnTime?: string | null;
  fee?: string | null;
  busNo?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export function getTransportRoutesPublic(): Promise<TransportRoute[]> {
  return apiGet<TransportRoute[]>("/transport-routes");
}

export function getTransportRoutesAdmin(includeDeleted = false): Promise<TransportRoute[]> {
  return apiGet<TransportRoute[]>(
    `/transport-routes/admin${includeDeleted ? "?includeDeleted=true" : ""}`,
  );
}

export function createTransportRoute(dto: TransportRouteInput): Promise<TransportRoute> {
  return apiPost<TransportRoute>("/transport-routes", dto);
}

export function updateTransportRoute(
  id: number,
  dto: Partial<TransportRouteInput> & { version: number },
): Promise<TransportRoute> {
  return apiPatch<TransportRoute>(`/transport-routes/${id}`, dto);
}

export function deleteTransportRoute(id: number): Promise<TransportRoute> {
  return apiDelete<TransportRoute>(`/transport-routes/${id}`);
}

export function restoreTransportRoute(id: number): Promise<TransportRoute> {
  return apiPost<TransportRoute>(`/transport-routes/${id}/restore`, {});
}

export function reorderTransportRoutes(ids: number[]): Promise<TransportRoute[]> {
  return apiPost<TransportRoute[]>("/transport-routes/reorder", { ids });
}
