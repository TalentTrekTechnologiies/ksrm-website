import { History } from "lucide-react"
import { AuditActor } from "@/lib/homepage-api"

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function CmsRecordMeta({
  updatedAt,
  createdBy,
  updatedBy,
  version,
  onOpenAuditHistory,
}: {
  updatedAt: string
  createdBy: AuditActor | null
  updatedBy: AuditActor | null
  version: number
  onOpenAuditHistory: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg bg-admin-bg px-4 py-2.5 text-xs text-slate-500">
      <span>
        Last updated <span className="font-medium text-slate-700">{formatDate(updatedAt)}</span>
      </span>
      <span className="text-slate-300">•</span>
      <span>
        Created by{" "}
        <span className="font-medium text-slate-700">{createdBy?.adminName ?? "—"}</span>
      </span>
      <span className="text-slate-300">•</span>
      <span>
        Updated by{" "}
        <span className="font-medium text-slate-700">{updatedBy?.adminName ?? "—"}</span>
      </span>
      <span className="text-slate-300">•</span>
      <span className="font-medium text-slate-700">v{version}</span>
      <button
        type="button"
        onClick={onOpenAuditHistory}
        className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-admin-primary transition-colors hover:bg-admin-primary/10"
      >
        <History className="h-3.5 w-3.5" />
        Audit History
      </button>
    </div>
  )
}

/**
 * "Added 14 Aug 2026, 6:20 pm" / "Updated ..." for a row or card in a list.
 *
 * The full CmsRecordMeta block only appears once a record is OPEN for editing,
 * so a list gave no indication of when anything was added - an admin scanning
 * twenty notices could not tell last week's from this morning's without
 * opening each one.
 *
 * Shows the update time once a record has been edited (updatedAt moves past
 * createdAt by more than a minute), and the creation time otherwise, so the
 * single line always answers "when did this last change?".
 */
export function CmsListTimestamp({
  createdAt,
  updatedAt,
}: {
  createdAt?: string | null
  updatedAt?: string | null
}) {
  if (!createdAt && !updatedAt) return null
  const created = createdAt ? new Date(createdAt) : null
  const updated = updatedAt ? new Date(updatedAt) : null
  const edited =
    created && updated && updated.getTime() - created.getTime() > 60_000
  const shown = edited ? updated : (created ?? updated)
  if (!shown || Number.isNaN(shown.getTime())) return null
  return (
    <span className="text-[11px] text-slate-400">
      {edited ? "Updated" : "Added"} {formatDate(shown.toISOString())}
    </span>
  )
}
