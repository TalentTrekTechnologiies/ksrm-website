import { widgetIcon } from "@/lib/dashboard-icons"

export default function DashboardCard({
  widgetKey,
  label,
  count,
  available,
  displayValue,
}: {
  widgetKey: string
  label: string
  count: number
  available: boolean
  /** Overrides the default `count.toLocaleString()` render - for widgets
   * where the raw number isn't the right unit to show at a glance (e.g.
   * Storage Used, where the count is a byte count, not an item count). */
  displayValue?: string
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
      className="group rounded-2xl border border-admin-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-admin-primary/25 hover:shadow-[var(--shadow-admin-card-hover)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p
            style={{ fontFamily: "var(--font-admin-heading)" }}
            className="mt-1.5 text-3xl font-bold tabular-nums text-slate-900"
          >
            {displayValue ?? count.toLocaleString()}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-admin-primary to-admin-primary-light text-white shadow-md shadow-admin-primary/25 transition-transform group-hover:scale-105">
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
