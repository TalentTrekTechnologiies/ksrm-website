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

/**
 * Page sections this admin is allowed to edit, or `null` for "no restriction".
 *
 * Mirrors PageSectionOwnershipGuard on the backend, which is what actually
 * enforces this - holding ANY `pages.*` permission turns that set into an
 * allow-list, and holding none means unrestricted. Super admins are never
 * restricted.
 *
 * This exists so the UI stops OFFERING pages the server will refuse to save:
 * without it a restricted admin picks a page, fills the form and only then
 * gets a 403. It is a convenience, never the control - the guard is.
 */
export function allowedPageRoots(admin: StoredAdmin | null): Set<string> | null {
  if (!admin || admin.isSuperAdmin) return null
  const roots = admin.permissions
    .filter((p) => p.startsWith("pages."))
    .map((p) => p.slice("pages.".length))
  return roots.length > 0 ? new Set(roots) : null
}

/** "examinations.timetables" -> "examinations" - sub-sections share an owner. */
export function pageSectionRoot(section: string): string {
  return section.split(".")[0]
}

export function isDepartmentScopedAdmin(admin: StoredAdmin | null): boolean {
  // `!= null`, deliberately loose: it must catch undefined as well as null.
  //
  // A strict `!== null` treated a MISSING departmentId as "scoped", because
  // `undefined !== null` is true. Any session stored before the login response
  // carried departmentId - or any session against a backend that predates it -
  // then looked department-scoped with an undefined department, so the sidebar
  // filtered its department tree on `d.id === undefined`, matched nothing, and
  // hid every flat nav item. The admin was left with an empty sidebar and no
  // way in.
  return !!admin && !admin.isSuperAdmin && admin.departmentId != null;
}
