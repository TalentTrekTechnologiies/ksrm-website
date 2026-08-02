"use client"

import { usePathname } from "next/navigation"

/**
 * The current path without its trailing slash.
 *
 * next.config.ts sets `trailingSlash: true` (a static export needs it so
 * /admin/login resolves to /admin/login/index.html rather than colliding with a
 * file of the same name). A consequence that is easy to miss: usePathname()
 * then returns "/admin/login/", so every `pathname === "/admin/login"` check in
 * the codebase silently evaluates false.
 *
 * That is not a cosmetic problem. It left the admin login page rendering inside
 * the logged-in chrome, and made the session-expired handler redirect to
 * /admin/login while already on it - so an expired session could not get back
 * in, and typing /admin/dashboard bounced straight back to the same screen.
 *
 * Compare against this instead of usePathname() for anything that tests
 * equality. `startsWith` checks are usually unaffected, but are clearer through
 * here too.
 */
export function normalizePath(pathname: string | null | undefined): string {
  if (!pathname) return "/"
  const trimmed = pathname.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed
}

export function useRoutePath(): string {
  return normalizePath(usePathname())
}
