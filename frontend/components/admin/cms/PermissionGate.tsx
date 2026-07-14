"use client"

import { ReactNode } from "react"
import { ShieldOff } from "lucide-react"
import { getStoredAdmin, hasPermission } from "@/lib/auth"

/**
 * First page-level permission gate in the admin panel (AdminLayout only
 * checks isLoggedIn, not a specific permission) - established here since
 * this is the first module with a real permission requirement narrower
 * than "any logged-in admin can see it".
 */
export default function PermissionGate({
  permission,
  children,
}: {
  permission: string
  children: ReactNode
}) {
  const admin = getStoredAdmin()

  if (!hasPermission(admin, permission)) {
    return (
      <div
        style={{ boxShadow: "var(--shadow-admin-card)" }}
        className="flex flex-col items-center rounded-xl border border-admin-border bg-white p-10 text-center"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldOff className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Access denied</p>
        <p className="mt-1 text-sm text-slate-500">
          You don&apos;t have the <code className="rounded bg-admin-bg px-1 py-0.5 text-xs">{permission}</code>{" "}
          permission needed to view this page.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
