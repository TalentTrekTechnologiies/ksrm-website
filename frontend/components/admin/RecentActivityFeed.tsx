import { RecentActivityItem } from "@/lib/dashboard-api"

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700",
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
    <div className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
      <p style={{ fontFamily: "var(--font-heading)", color: "var(--color-navy)" }} className="mb-4 text-lg font-bold">
        Recent Activity
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No recent activity to show.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <span
                  className={`mr-2 inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
                    ACTION_STYLES[item.action] ?? "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {item.action}
                </span>
                <span className="text-neutral-700">
                  {item.adminName} &middot; {item.module}
                </span>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {timeAgo(item.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
