/**
 * Resolves a `MediaUsage.module` + `recordId` to an admin route the "Used
 * In" panel can link to ("Open"). Deliberately mostly empty right now -
 * nothing actually calls `MediaUsageService.track()` yet (no module has
 * adopted the Media Library), so there's nothing real to resolve. Each
 * future module-by-module integration pass adds one entry here; the "Used
 * In" panel itself needs no changes when that happens.
 */
export const MODULE_ADMIN_ROUTE_MAP: Record<string, (recordId: number) => string> = {
  // Example (once Gallery integrates): gallery: (id) => `/admin/gallery?highlight=${id}`,
}

export function resolveUsageRoute(module: string, recordId: number): string | null {
  const resolver = MODULE_ADMIN_ROUTE_MAP[module]
  return resolver ? resolver(recordId) : null
}
