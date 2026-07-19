"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { widgetIcon } from "@/lib/dashboard-icons"

interface QuickAction {
  widgetKey: string
  label: string
  href: string
}

// Same "only modules with a real admin page today" scoping as
// AdminSidebar's nav list - see that component's comment for why.
const ACTIONS: QuickAction[] = [
  { widgetKey: "faculty", label: "Add Faculty", href: "/admin/faculty" },
  { widgetKey: "news", label: "Post News", href: "/admin/news" },
  { widgetKey: "gallery", label: "Upload to Gallery", href: "/admin/gallery" },
  { widgetKey: "placements", label: "Add Placement", href: "/admin/placements" },
]

export default function QuickActions({ visibleKeys }: { visibleKeys: Set<string> }) {
  const actions = ACTIONS.filter((a) => visibleKeys.has(a.widgetKey))
  if (actions.length === 0) return null

  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="rounded-2xl border border-admin-border bg-white p-5"
    >
      <p
        style={{ fontFamily: "var(--font-admin-heading)" }}
        className="mb-4 text-lg font-bold text-admin-primary"
      >
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = widgetIcon(action.widgetKey)
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-2 rounded-lg border border-admin-border p-4 text-center transition-colors hover:border-admin-primary hover:bg-admin-primary/5"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-admin-primary/10 text-admin-primary group-hover:bg-admin-primary group-hover:text-white">
                <Icon className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-admin-gold text-white">
                  <Plus className="h-3 w-3" />
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
