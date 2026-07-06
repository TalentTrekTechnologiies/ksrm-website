import { widgetIcon } from "@/lib/dashboard-icons"

export default function DashboardCard({
  widgetKey,
  label,
  count,
  available,
}: {
  widgetKey: string
  label: string
  count: number
  available: boolean
}) {
  // widgetIcon() selects an existing component reference from a static,
  // module-level lookup map (lib/dashboard-icons.ts) - it never defines a
  // new component, so there's no risk of the "recreated each render, state
  // reset" failure mode this rule guards against. The identical pattern
  // one level down in a .map() callback (QuickActions, RecentActivityFeed)
  // and passed directly as a prop (AdminSidebar) doesn't trigger this rule
  // at all, which is itself evidence this is a narrow false positive for
  // the "assigned directly in a component's own top-level scope" shape,
  // not a real bug. (Suppressed at the JSX usage below, not here - that's
  // where this rule actually reports the error.)
  const Icon = widgetIcon(widgetKey)

  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="group rounded-xl border border-admin-border bg-white p-5 transition-shadow hover:shadow-[var(--shadow-admin-card-hover)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p
            style={{ fontFamily: "var(--font-admin-heading)" }}
            className="mt-1.5 text-3xl font-bold text-slate-900"
          >
            {count.toLocaleString()}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-primary/10 text-admin-primary transition-colors group-hover:bg-admin-primary group-hover:text-white">
          {/* eslint-disable-next-line react-hooks/static-components -- see comment above `const Icon` */}
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {!available && (
        <p className="mt-2 text-xs font-medium text-amber-600">
          Not available in this database yet
        </p>
      )}
    </div>
  )
}
