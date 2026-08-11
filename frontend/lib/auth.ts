// Client-side-only auth storage. This app builds with `output: "export"`
// (see next.config.ts) - there is no server at runtime, so there is no
// middleware/session mechanism available. A Bearer JWT, read and attached
// by the client on every request, is the only option consistent with that
// constraint - it also matches what the backend actually returns from
// POST /auth/login (a JSON accessToken, not a Set-Cookie header).
//
// "Remember Me" is real, not decorative: checked -> localStorage (survives
// closing the browser); unchecked -> sessionStorage (cleared when the tab/
// browser closes). Both are read on every lookup so a session started
// either way is found consistently.

const TOKEN_KEY = "ksrm_admin_token";
const ADMIN_KEY = "ksrm_admin_profile";

export interface StoredAdmin {
  id: number;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  departmentId: number | null;
  permissions: string[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, rememberMe: boolean): void {
  if (!isBrowser()) return;
  if (rememberMe) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.sessionStorage.removeItem(TOKEN_KEY);
  } else {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredAdmin(): StoredAdmin | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(ADMIN_KEY) ?? window.sessionStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdmin;
  } catch {
    return null;
  }
}

export function setStoredAdmin(admin: StoredAdmin, rememberMe: boolean): void {
  if (!isBrowser()) return;
  const store = rememberMe ? window.localStorage : window.sessionStorage;
  store.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function updateStoredAdmin(admin: StoredAdmin): void {
  if (!isBrowser()) return;
  const store = window.localStorage.getItem(TOKEN_KEY) ? window.localStorage : window.sessionStorage;
  store.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(ADMIN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

/** isSuperAdmin is a hard bypass, mirroring the backend's PermissionsGuard. */
export function hasPermission(admin: StoredAdmin | null, permission: string): boolean {
  if (!admin) return false;
  return admin.isSuperAdmin || admin.permissions.includes(permission);
}

export function isDepartmentScopedAdmin(admin: StoredAdmin | null): boolean {
  return !!admin && !admin.isSuperAdmin && admin.departmentId !== null;
}
