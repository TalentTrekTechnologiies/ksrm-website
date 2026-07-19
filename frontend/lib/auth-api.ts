import { apiGet, apiPost } from "./api-client";
import { StoredAdmin } from "./auth";

export interface LoginResponse {
  accessToken: string;
  admin: StoredAdmin;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/login", { email, password });
}

/**
 * Server-side token check. The client guard can only see that a token string
 * EXISTS; whether it is still valid only the backend knows. A 401 here makes
 * api-client clear the session and broadcast SESSION_EXPIRED_EVENT, which the
 * admin layout turns into a redirect to the login page.
 */
export function getProfile(): Promise<StoredAdmin> {
  return apiGet<StoredAdmin>("/auth/profile");
}
