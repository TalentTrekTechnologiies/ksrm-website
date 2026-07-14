"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, Loader2, PlusCircle, Trash2, RotateCcw, ArrowUpDown, Upload, EyeOff, Pencil } from "lucide-react"
import { getAuditHistory, AuditLogEntry } from "@/lib/homepage-api"
import { computeFieldDiff } from "@/lib/audit-diff.util"
import { ApiError } from "@/lib/api-client"

const ACTION_META: Record<
  AuditLogEntry["action"],
  { icon: typeof PlusCircle; label: string; color: string }
> = {
  CREATE: { icon: PlusCircle, label: "Created", color: "text-emerald-600 bg-emerald-50" },
  UPDATE: { icon: Pencil, label: "Updated", color: "text-blue-600 bg-blue-50" },
  DELETE: { icon: Trash2, label: "Deleted", color: "text-red-600 bg-red-50" },
  RESTORE: { icon: RotateCcw, label: "Restored", color: "text-emerald-600 bg-emerald-50" },
  REORDER: { icon: ArrowUpDown, label: "Reordered", color: "text-slate-600 bg-slate-100" },
  PUBLISH: { icon: Upload, label: "Published", color: "text-admin-gold bg-amber-50" },
  UNPUBLISH: { icon: EyeOff, label: "Unpublished", color: "text-slate-600 bg-slate-100" },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function EntryDiff({ entry }: { entry: AuditLogEntry }) {
  if (entry.action !== "UPDATE" || !entry.details) return null

  let parsed: { before?: Record<string, unknown>; after?: Record<string, unknown> } = {}
  try {
    parsed = JSON.parse(entry.details)
  } catch {
    return null
  }

  const diffs = computeFieldDiff(parsed.before, parsed.after)
  if (diffs.length === 0) return null

  return (
    <table className="mt-2 w-full overflow-hidden rounded-lg border border-admin-border text-xs">
      <thead>
        <tr className="bg-admin-bg text-left text-slate-500">
          <th className="px-2.5 py-1.5 font-semibold">Field</th>
          <th className="px-2.5 py-1.5 font-semibold">Old</th>
          <th className="px-2.5 py-1.5 font-semibold">New</th>
        </tr>
      </thead>
      <tbody>
        {diffs.map((d) => (
          <tr key={d.field} className="border-t border-admin-border">
            <td className="px-2.5 py-1.5 font-medium text-slate-700">{d.field}</td>
            <td className="max-w-[140px] truncate px-2.5 py-1.5 text-red-600" title={d.oldValue}>
              {d.oldValue}
            </td>
            <td className="max-w-[140px] truncate px-2.5 py-1.5 text-emerald-700" title={d.newValue}>
              {d.newValue}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function CmsAuditHistoryDrawer({
  open,
  onClose,
  module,
  targetId,
}: {
  open: boolean
  onClose: () => void
  module: string
  targetId: number
}) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAuditHistory(module, targetId)
        if (!cancelled) setEntries(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load audit history")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, module, targetId])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
              <p style={{ fontFamily: "var(--font-admin-heading)" }} className="text-base font-bold text-slate-900">
                Audit History
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-admin-bg hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-admin-primary" />
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!loading && !error && entries.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No history yet.</p>
              )}

              <ol className="space-y-5">
                {entries.map((entry, i) => {
                  const meta = ACTION_META[entry.action]
                  const Icon = meta.icon
                  return (
                    <li key={entry.id} className="relative pl-8">
                      {i < entries.length - 1 && (
                        <span className="absolute left-[13px] top-7 h-full w-px bg-admin-border" />
                      )}
                      <span
                        className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full ${meta.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                      <p className="text-xs text-slate-400">
                        {entry.adminName} · {formatDate(entry.createdAt)}
                      </p>
                      <EntryDiff entry={entry} />
                    </li>
                  )
                })}
              </ol>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
