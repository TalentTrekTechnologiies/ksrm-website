import { clearSession, getToken } from "./auth";
import { API_BASE } from "./api-base";

// Single source of truth (see api-base.ts). This used to resolve its own base
// and, on a deployed host with no NEXT_PUBLIC_API_URL, return "" - which made
// every request relative, so it hit the static host and 404'd instead of
// failing loudly. API_BASE can no longer produce an origin that isn't a backend.
function getApiBaseUrl() {
  return API_BASE;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface BackendErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId?: string;
}

async function parseErrorBody(response: Response): Promise<BackendErrorBody | null> {
  try {
    return (await response.json()) as BackendErrorBody;
  } catch {
    return null;
  }
}

/**
 * Thin fetch wrapper: resolves the backend base URL, attaches the admin's
 * Bearer token if one is stored, and normalizes every non-2xx response into
 * a single ApiError type using the shape AllExceptionsFilter actually
 * returns (statusCode/error/message/requestId), rather than each caller
 * re-parsing the response body itself.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // The stored token is missing/expired/invalid - there is no refresh
    // flow (RefreshToken exists only as schema today, per
    // DATA_MODEL_DESIGN.md §3.17), so the only correct move is to clear
    // the stale session and let the caller redirect to /admin/login.
    clearSession();
  }

  if (!response.ok) {
    const body = await parseErrorBody(response);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message || response.statusText || "Request failed";
    throw new ApiError(message, response.status, body?.requestId);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}
