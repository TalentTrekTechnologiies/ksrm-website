"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Download, ChevronLeft, ChevronRight, X, ShieldOff } from "lucide-react"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import { TextField, SelectField } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { getStoredAdmin } from "@/lib/auth"
import { getAuditLogs, downloadAuditLogsCsv, AuditLogEntry } from "@/lib/audit-logs-api"
import { humanAction, humanActionLower, humanModule } from "@/lib/audit-humanize"
import {
  describeFields,
  describeLocation,
  describeQualifier,
  describeRecord,
  parseSnapshot,
  subjectOf,
} from "@/lib/audit-describe"
import { computeFieldDiff } from "@/lib/audit-diff.util"
import { getDepartmentsAdmin } from "@/lib/departments-api"

// Values stay the raw database verbs (the API filters on them); only the
// labels an admin reads are plain language, via the shared humanizer.
const ACTION_OPTIONS = [
  { value: "", label: "All changes" },
  ...[
    "CREATE",
    "UPDATE",
    "DELETE",
    "RESTORE",
    "REORDER",
    "PUBLISH",
    "UNPUBLISH",
    "REPLACE",
    "ROLLBACK",
    "CROP",
    "RESET_PASSWORD",
    "ASSIGN_ROLES",
    "ENABLE",
    "DISABLE",
  ].map((value) => ({ value, label: humanAction(value) })),
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
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${color}`}>
      {humanAction(action)}
    </span>
  )
}

/** Two-column label/value rows, used for created and deleted records. */
function FieldTable({ rows }: { rows: { field: string; label: string; value: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-admin-border">
      <table className="w-full text-left text-xs">
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.field} className={i > 0 ? "border-t border-admin-border" : ""}>
              <td className="w-48 bg-admin-bg/60 px-3 py-2 align-top font-medium text-slate-600">{r.label}</td>
              <td className="break-words px-3 py-2 text-slate-800">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DetailsModal({
  entry,
  deptNames,
  onClose,
}: {
  entry: AuditLogEntry
  deptNames: Map<number, string>
  onClose: () => void
}) {
  const snapshot = parseSnapshot(entry.details)
  const record = describeRecord(entry)
  const location = describeLocation(entry, deptNames)
  const diffs = snapshot ? computeFieldDiff(snapshot.before, snapshot.after) : []

  // An update shows what differed; a create or delete has nothing to compare
  // against, so it lists the record's own contents instead.
  const isUpdate = diffs.length > 0
  const contents = !isUpdate ? describeFields(subjectOf(snapshot)) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        style={{ boxShadow: "var(--shadow-admin-card)" }}
        className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Headline: who did what, to which record, where. */}
        <div className="flex items-start justify-between gap-3 border-b border-admin-border p-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <ActionBadge action={entry.action} />
              <span className="text-xs text-slate-500">{humanModule(entry.module)}</span>
            </div>
            <p className="truncate text-lg font-semibold text-slate-800" title={record}>
              {record}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-700">{entry.adminName}</span> {humanActionLower(entry.action)} this
              {location && (
                <>
                  {" "}
                  on <span className="font-medium text-slate-700">{location}</span>
                </>
              )}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 rounded-lg p-1 hover:bg-admin-bg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Who / when / where from */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-slate-400">When</p>
              <p className="font-medium text-slate-700">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
            <div className="min-w-0">
              <p className="text-slate-400">Account</p>
              <p className="truncate font-medium text-slate-700" title={entry.adminEmail}>{entry.adminEmail}</p>
            </div>
            <div>
              <p className="text-slate-400">IP address</p>
              <p className="font-medium text-slate-700">{entry.ipAddress ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Record ID</p>
              <p className="font-medium text-slate-700">{entry.targetId ?? "—"}</p>
            </div>
          </div>

          {isUpdate && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                What changed ({diffs.length} field{diffs.length === 1 ? "" : "s"})
              </p>
              <div className="overflow-hidden rounded-xl border border-admin-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-admin-bg">
                    <tr>
                      <th className="w-44 px-3 py-2 font-semibold text-slate-500">Field</th>
                      <th className="px-3 py-2 font-semibold text-slate-500">Before</th>
                      <th className="px-3 py-2 font-semibold text-slate-500">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffs.map((d) => (
                      <tr key={d.field} className="border-t border-admin-border align-top">
                        <td className="px-3 py-2 font-medium text-slate-700">{d.label}</td>
                        <td className="break-words px-3 py-2 text-red-700 line-through decoration-red-300">{d.oldValue}</td>
                        <td className="break-words px-3 py-2 text-emerald-700">{d.newValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isUpdate && contents.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {entry.action === "DELETE" ? "The deleted record held" : "Details"}
              </p>
              <FieldTable rows={contents} />
            </div>
          )}

          {!isUpdate && contents.length === 0 && (
            <p className="rounded-lg bg-admin-bg px-3 py-2.5 text-xs text-slate-500">
              No field-level detail was recorded for this change.
            </p>
          )}

          {/* Kept for anyone who needs the exact payload, out of the way by default. */}
          {entry.details && (
            <details className="rounded-xl border border-admin-border">
              <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700">
                Technical detail
              </summary>
              <div className="border-t border-admin-border p-3">
                <p className="mb-2 break-all font-mono text-[10px] text-slate-400">
                  Entry #{entry.id} · request {entry.requestId ?? "—"}
                </p>
                <pre className="max-h-64 overflow-auto rounded-lg bg-admin-bg p-3 text-[11px] text-slate-700">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(entry.details), null, 2)
                    } catch {
                      return entry.details
                    }
                  })()}
                </pre>
              </div>
            </details>
          )}
        </div>
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
  // Resolves the departmentId-only entries (labs, outcomes, highlights) to a
  // real department name in the "Where" column. Missing names degrade to
  // "Department #3", so a failed load costs nothing.
  const [deptNames, setDeptNames] = useState<Map<number, string>>(new Map())

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
    getDepartmentsAdmin()
      .then((rows) => setDeptNames(new Map(rows.map((d) => [d.id, d.name]))))
      .catch(() => {
        /* names are a nicety; the ID fallback still reads fine */
      })
  }, [])

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
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500">A complete history of who changed what, and when.</p>
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
              className="flex items-center gap-1.5 rounded-xl border border-admin-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-admin-bg disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-admin-border bg-white">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-slate-500">When</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Who</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Did what</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">To what</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Where</th>
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
              {items.map((entry) => {
                const record = describeRecord(entry)
                const qualifier = describeQualifier(entry)
                const where = describeLocation(entry, deptNames)
                return (
                  <tr key={entry.id} className="border-t border-admin-border hover:bg-admin-bg/60">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800">{entry.adminName}</p>
                      <p className="text-xs text-slate-500">{entry.adminEmail}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <ActionBadge action={entry.action} />
                      <p className="mt-0.5 text-xs text-slate-500">{humanModule(entry.module)}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="max-w-[240px] truncate text-xs font-medium text-slate-800" title={record}>
                        {record}
                      </p>
                      {qualifier && (
                        <p className="max-w-[240px] truncate text-[11px] text-slate-500" title={qualifier}>
                          {qualifier}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="max-w-[190px] truncate text-xs text-slate-600" title={where ?? undefined}>
                        {where ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{entry.ipAddress ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => setViewing(entry)}
                        className="text-xs font-semibold text-admin-primary hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
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

      {viewing && <DetailsModal entry={viewing} deptNames={deptNames} onClose={() => setViewing(null)} />}
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
        className="flex flex-col items-center rounded-2xl border border-admin-border bg-white p-10 text-center"
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
