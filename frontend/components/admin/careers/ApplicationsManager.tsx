"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Download, FileSpreadsheet, Eye } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import { CmsApplicationStatusBadge } from "@/components/admin/cms/CmsStatusBadge"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import { ApiError } from "@/lib/api-client"
import {
  getCareerApplicationsAdmin,
  exportCareerApplicationsCsv,
  exportCareerApplicationsExcel,
  CareerApplication,
  APPLICATION_STATUSES,
  ApplicationStatus,
} from "@/lib/career-applications-api"
import ApplicationDetailModal from "./ApplicationDetailModal"

function ApplicationsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<CareerApplication[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getCareerApplicationsAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        pageSize,
      })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    load()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
            Job Applications
          </h1>
          <p className="text-sm text-slate-500">{total} total applications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCareerApplicationsCsv({ search: search || undefined, status: statusFilter || undefined })}
            className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-admin-bg"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={() => exportCareerApplicationsExcel({ search: search || undefined, status: statusFilter || undefined })}
            className="flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-admin-bg"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 min-w-[240px] gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile..."
            className="w-full rounded-lg border border-admin-border bg-white px-3.5 py-2 text-sm focus:border-admin-primary focus:outline-none"
          />
          <button type="submit" className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ApplicationStatus | "")
            setPage(1)
          }}
          className="rounded-lg border border-admin-border bg-white px-3.5 py-2 text-sm focus:border-admin-primary focus:outline-none"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <CmsTableSkeleton showHeader={false} />
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">
          No applications found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-admin-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-admin-bg">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Name</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Email</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Position</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Status</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Assigned HR</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500">Submitted</th>
                  <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-500"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-bg/60">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.fullName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{item.email}</td>
                    <td className="px-4 py-2.5 text-slate-600">{item.career?.title ?? "General"}</td>
                    <td className="px-4 py-2.5">
                      <CmsApplicationStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{item.assignedHr?.name ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-admin-border px-4 py-2.5 text-sm text-slate-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg px-2.5 py-1 hover:bg-admin-bg disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg px-2.5 py-1 hover:bg-admin-bg disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedId !== null && (
        <ApplicationDetailModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      )}
    </div>
  )
}

export default function ApplicationsManager() {
  return (
    <PermissionGate permission="career_applications.view">
      <ApplicationsManagerInner />
    </PermissionGate>
  )
}
