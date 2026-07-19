import { RecentActivityItem } from "@/lib/dashboard-api"
import { widgetIcon } from "@/lib/dashboard-icons"
import { humanAction, humanActionLower, humanModule } from "@/lib/audit-humanize"

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700",
  UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700",
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function RecentActivityFeed({ items }: { items: RecentActivityItem[] }) {
  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="rounded-xl border border-admin-border bg-white p-5"
    >
      <p
        style={{ fontFamily: "var(--font-admin-heading)" }}
        className="mb-4 text-lg font-bold text-admin-primary"
      >
        Recent Activity
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No recent activity to show.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = widgetIcon(item.module)
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-admin-bg"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-admin-primary/10 text-admin-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  {/* Reads as a sentence - "Suresh edited News" - instead of
                      name + raw module key + a CREATE/UPDATE code badge. */}
                  <p className="truncate text-slate-700">
                    <span className="font-medium">{item.adminName}</span>{" "}
                    <span className="text-slate-500">
                      {humanActionLower(item.action)} {humanModule(item.module)}
                    </span>
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    ACTION_STYLES[item.action] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {humanAction(item.action)}
                </span>
                <span className="w-14 shrink-0 text-right text-xs text-slate-400">
                  {timeAgo(item.createdAt)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
