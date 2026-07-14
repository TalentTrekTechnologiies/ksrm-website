"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw, LayoutGrid, Table as TableIcon } from "lucide-react"
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsCardGrid from "@/components/admin/cms/CmsCardGrid"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import SectionVisibilityToggle from "@/components/admin/cms/SectionVisibilityToggle"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getRecruitersAdmin,
  createRecruiter,
  updateRecruiter,
  deleteRecruiter,
  restoreRecruiter,
  Recruiter,
} from "@/lib/homepage-api"

interface FormState {
  name: string
  logoUrl: string
  mediaId: number | null
  isActive: boolean
}

const emptyForm: FormState = { name: "", logoUrl: "", mediaId: null, isActive: true }

function RecruitersManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Recruiter[]>([])
  const [editing, setEditing] = useState<Recruiter | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  async function refresh() {
    try {
      setItems(await getRecruitersAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load recruiters")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getRecruitersAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load recruiters")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: Recruiter) {
    setEditing(item)
    setCreating(false)
    setForm({ name: item.name, logoUrl: item.logoUrl, mediaId: item.mediaId, isActive: item.isActive })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const dto = { name: form.name, logoUrl: form.logoUrl, mediaId: form.mediaId, isActive: form.isActive }
      if (editing) {
        await updateRecruiter(editing.id, { ...dto, version: editing.version })
      } else {
        await createRecruiter(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save recruiter")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Recruiter) {
    if (!confirm(`Delete "${item.name}"? You can restore it afterwards.`)) return
    try {
      await deleteRecruiter(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete recruiter")
    }
  }

  async function handleRestore(item: Recruiter) {
    try {
      await restoreRecruiter(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore recruiter")
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} recruiter logo(s)? You can restore them afterwards.`)) return
    setError(null)
    const results = await Promise.allSettled([...selectedIds].map((id) => deleteRecruiter(id)))
    const failed = results.filter((r) => r.status === "rejected").length
    if (failed > 0) setError(`${failed} of ${selectedIds.size} could not be deleted.`)
    setSelectedIds(new Set())
    await refresh()
  }

  async function handleBulkRestore() {
    if (selectedIds.size === 0) return
    setError(null)
    const results = await Promise.allSettled([...selectedIds].map((id) => restoreRecruiter(id)))
    const failed = results.filter((r) => r.status === "rejected").length
    if (failed > 0) setError(`${failed} of ${selectedIds.size} could not be restored.`)
    setSelectedIds(new Set())
    await refresh()
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const rowSelection: RowSelectionState = useMemo(
    () => Object.fromEntries([...selectedIds].map((id) => [String(id), true])),
    [selectedIds],
  )

  function handleRowSelectionChange(next: RowSelectionState) {
    setSelectedIds(new Set(Object.keys(next).filter((k) => next[k]).map(Number)))
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q))
  }, [items, search])

  const liveItems = filtered.filter((i) => i.deletedAt === null)
  const deletedItems = filtered.filter((i) => i.deletedAt !== null)

  const columns: ColumnDef<Recruiter>[] = [
    {
      id: "logo",
      header: "Logo",
      cell: ({ row }) => (
        <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-admin-border bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.original.logoUrl} alt={row.original.name} className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
        </div>
      ),
    },
    { accessorKey: "name", header: "Name" },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.deletedAt ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50">Deleted</span>
        ) : row.original.isActive ? (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50">Active</span>
        ) : (
          <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50">Inactive</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.deletedAt ? (
          <button type="button" onClick={() => handleRestore(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
            Restore
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => startEdit(row.original)} className="text-xs font-semibold text-admin-primary hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(row.original)} className="text-xs font-semibold text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
            Recruiters
          </h1>
          <p className="text-sm text-slate-500">Recruiter logos shown in the Placements marquee.</p>
        </div>
        <SectionVisibilityToggle sectionKey="recruiters" />
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit recruiter" : "New recruiter"}</p>
          <TextField label="Company name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required maxLength={100} />
          <MediaField
            label="Logo"
            url={form.logoUrl}
            mediaId={form.mediaId}
            onChange={(url, mediaId) => setForm({ ...form, logoUrl: url, mediaId })}
            accept={["IMAGE"]}
            required
            urlPlaceholder="/recruiters/tcs.jpg"
          />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name || !form.logoUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search recruiters..."
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        bulkActions={[
          { label: "Restore", onClick: handleBulkRestore },
          { label: "Delete", onClick: handleBulkDelete, danger: true },
        ]}
        filters={
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-admin-border">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold ${view === "grid" ? "bg-admin-primary text-white" : "bg-white text-slate-500 hover:bg-admin-bg"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
              <button
                type="button"
                onClick={() => setView("table")}
                aria-label="Table view"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold ${view === "table" ? "bg-admin-primary text-white" : "bg-white text-slate-500 hover:bg-admin-bg"}`}
              >
                <TableIcon className="h-3.5 w-3.5" /> Table
              </button>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
            >
              <Plus className="h-4 w-4" /> Add recruiter
            </button>
          </div>
        }
      />

      {view === "grid" ? (
        <>
          <CmsCardGrid
            items={liveItems}
            onEdit={startEdit}
            onDelete={handleDelete}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            emptyTitle="No recruiters yet"
            emptyDescription="Add your first recruiter logo."
            renderCard={(item) => (
              <div className="flex h-24 items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.logoUrl} alt={item.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
              </div>
            )}
          />
          {deletedItems.length > 0 && (
            <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-xl border border-admin-border bg-white p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
              <ul className="space-y-1.5">
                {deletedItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                    <span className="text-slate-500 line-through">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRestore(item)}
                      className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <CmsTable
          data={filtered}
          columns={columns}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          emptyTitle="No recruiters yet"
          emptyDescription="Add your first recruiter logo."
          pageSize={15}
        />
      )}
    </div>
  )
}

export default function RecruitersManager() {
  return (
    <PermissionGate permission="homepage.view">
      <RecruitersManagerInner />
    </PermissionGate>
  )
}
