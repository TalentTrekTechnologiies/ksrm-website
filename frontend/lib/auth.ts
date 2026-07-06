// Client-side-only auth storage. This app builds with `output: "export"`
// (see next.config.ts) - there is no server at runtime, so there is no
// middleware/session mechanism available. A Bearer JWT in localStorage,
// read and attached by the client on every request, is the only option
// consistent with that constraint - it also matches what the backend
// actually returns from POST /auth/login (a JSON accessToken, not a
// Set-Cookie header).

const TOKEN_KEY = "ksrm_admin_token";
const ADMIN_KEY = "ksrm_admin_profile";

export interface StoredAdmin {
  id: number;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredAdmin(): StoredAdmin | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdmin;
  } catch {
    return null;
  }
}

export function setStoredAdmin(admin: StoredAdmin): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}
