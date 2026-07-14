"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Download, ChevronLeft, ChevronRight, X, ShieldOff } from "lucide-react"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import { TextField, SelectField } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { getStoredAdmin } from "@/lib/auth"
import { getAuditLogs, downloadAuditLogsCsv, AuditLogEntry } from "@/lib/audit-logs-api"

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "RESTORE", label: "Restore" },
  { value: "REORDER", label: "Reorder" },
  { value: "PUBLISH", label: "Publish" },
  { value: "UNPUBLISH", label: "Unpublish" },
  { value: "REPLACE", label: "Replace (Media)" },
  { value: "ROLLBACK", label: "Rollback (Media)" },
  { value: "CROP", label: "Crop (Media)" },
  { value: "RESET_PASSWORD", label: "Reset Password" },
  { value: "ASSIGN_ROLES", label: "Assign Roles" },
  { value: "ENABLE", label: "Enable" },
  { value: "DISABLE", label: "Disable" },
]

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-700 bg-emerald-50",
  UPDATE: "text-blue-700 bg-blue-50",
  DELETE: "text-red-700 bg-red-50",
  RESTORE: "text-admin-primary bg-admin-primary/10",
  DISABLE: "text-amber-700 bg-amber-50",
  ENABLE: "text-emerald-700 bg-emerald-50",
  RESET_PASSWORD: "text-slate-700 bg-slate-100",
  ASSIGN_ROLES: "text-purple-700 bg-purple-50",
}

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] ?? "text-slate-600 bg-slate-100"
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${color}`}>{action}</span>
}

function DetailsModal({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
  let parsed: { before?: unknown; after?: unknown; changedFields?: string[]; [key: string]: unknown } | null = null
  try {
    parsed = entry.details ? JSON.parse(entry.details) : null
  } catch {
    parsed = null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        style={{ boxShadow: "var(--shadow-admin-card)" }}
        className="max-h-[85vh] w-full max-w-3xl space-y-4 overflow-auto rounded-xl bg-white p-5"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Audit Log Entry #{entry.id}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-admin-bg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div>
            <p className="text-slate-400">Timestamp</p>
            <p className="font-medium text-slate-700">{new Date(entry.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400">Action</p>
            <ActionBadge action={entry.action} />
          </div>
          <div>
            <p className="text-slate-400">Module</p>
            <p className="font-medium text-slate-700">{entry.module}</p>
          </div>
          <div>
            <p className="text-slate-400">User</p>
            <p className="font-medium text-slate-700">{entry.adminName}</p>
            <p className="text-slate-500">{entry.adminEmail}</p>
          </div>
          <div>
            <p className="text-slate-400">IP Address</p>
            <p className="font-medium text-slate-700">{entry.ipAddress ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Request ID</p>
            <p className="break-all font-mono text-[11px] text-slate-600">{entry.requestId ?? "—"}</p>
          </div>
          {entry.targetId !== null && (
            <div>
              <p className="text-slate-400">Target ID</p>
              <p className="font-medium text-slate-700">{entry.targetId}</p>
            </div>
          )}
        </div>

        {parsed?.changedFields && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Changed fields</p>
            <div className="flex flex-wrap gap-1">
              {(parsed.changedFields as string[]).map((f) => (
                <span key={f} className="rounded bg-admin-bg px-1.5 py-0.5 text-[11px] text-slate-600">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {parsed && (parsed.before !== undefined || parsed.after !== undefined) ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">Before</p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-admin-bg p-3 text-[11px] text-slate-700">
                {parsed.before !== undefined ? JSON.stringify(parsed.before, null, 2) : "—"}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500">After</p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-admin-bg p-3 text-[11px] text-slate-700">
                {parsed.after !== undefined ? JSON.stringify(parsed.after, null, 2) : "—"}
              </pre>
            </div>
          </div>
        ) : parsed ? (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Details</p>
            <pre className="max-h-64 overflow-auto rounded-lg bg-admin-bg p-3 text-[11px] text-slate-700">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function AuditLogsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 25

  const [search, setSearch] = useState("")
  const [module, setModule] = useState("")
  const [action, setAction] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [exporting, setExporting] = useState(false)
  const [viewing, setViewing] = useState<AuditLogEntry | null>(null)

  const query = {
    search: search || undefined,
    module: module || undefined,
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize,
  }

  async function refresh() {
    try {
      const res = await getAuditLogs(query)
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load audit logs")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const res = await getAuditLogs(query)
        if (!cancelled) {
          setItems(res.items)
          setTotal(res.total)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load audit logs")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, module, action, from, to])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      refresh()
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      await downloadAuditLogsCsv(query)
    } catch {
      setError("Failed to export audit logs")
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (loading) {
    return <CmsTableSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500">Every CRUD action across the CMS, in one searchable trail.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by admin name, email, or request ID..."
        filters={
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-40">
              <TextField label="Module" value={module} onChange={setModule} placeholder="e.g. news" />
            </div>
            <div className="w-44">
              <SelectField label="Action" value={action} onChange={setAction} options={ACTION_OPTIONS} />
            </div>
            <div className="w-36">
              <TextField label="From" value={from} onChange={setFrom} placeholder="YYYY-MM-DD" />
            </div>
            <div className="w-36">
              <TextField label="To" value={to} onChange={setTo} placeholder="YYYY-MM-DD" />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-admin-bg disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Timestamp</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">User</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Action</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Module</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Target</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">IP</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No audit log entries match these filters.
                  </td>
                </tr>
              )}
              {items.map((entry) => (
                <tr key={entry.id} className="border-t border-admin-border hover:bg-admin-bg/60">
                  <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-slate-800">{entry.adminName}</p>
                    <p className="text-xs text-slate-500">{entry.adminEmail}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <ActionBadge action={entry.action} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{entry.module}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{entry.targetId ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{entry.ipAddress ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <button type="button" onClick={() => setViewing(entry)} className="text-xs font-semibold text-admin-primary hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-admin-border px-4 py-2.5 text-sm text-slate-500">
          <span>
            {total} entr{total === 1 ? "y" : "ies"} · Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg p-1.5 hover:bg-admin-bg disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg p-1.5 hover:bg-admin-bg disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewing && <DetailsModal entry={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

// The backend's AuditLogController gates every route with a hard
// `req.user.isSuperAdmin` check, not a `<module>.view`-style permission -
// see AuditLogController's assertSuperAdmin. PermissionGate's permission-
// string check would pass for a non-super-admin holding some unrelated
// permission and then have every request 403 anyway, so this mirrors the
// backend's actual rule directly instead.
export default function AuditLogsManager() {
  const admin = getStoredAdmin()

  if (!admin?.isSuperAdmin) {
    return (
      <div
        style={{ boxShadow: "var(--shadow-admin-card)" }}
        className="flex flex-col items-center rounded-xl border border-admin-border bg-white p-10 text-center"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldOff className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Access denied</p>
        <p className="mt-1 text-sm text-slate-500">Only super admins can view audit logs.</p>
      </div>
    )
  }

  return <AuditLogsManagerInner />
}
