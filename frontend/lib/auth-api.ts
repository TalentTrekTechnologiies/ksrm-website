import { apiPost } from "./api-client";
import { StoredAdmin } from "./auth";

export interface LoginResponse {
  accessToken: string;
  admin: StoredAdmin;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/login", { email, password });
}
