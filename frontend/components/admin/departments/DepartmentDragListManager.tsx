"use client"

import { ReactNode, useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw } from "lucide-react"
import CmsDragList, { CmsDragListItem } from "@/components/admin/cms/CmsDragList"
import { FormActions, PrimaryButton, SecondaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"

/**
 * One reusable engine behind Labs / Learning Outcomes / Programmes /
 * Highlights / Contact - every department content type that is a
 * reorderable, soft-deletable, optimistic-locked list. Each tab supplies
 * its own field set (renderFields) and DTO mapping; this component owns
 * loading, the drag-reorder, save/delete/restore plumbing and error
 * display so that plumbing is written once, not five times.
 */
export interface DragListManagerConfig<T extends CmsDragListItem & { version: number }, F> {
  title: string
  description?: string
  departmentId: number
  emptyForm: F
  fetchAdmin: (departmentId: number, includeDeleted: boolean) => Promise<T[]>
  create: (dto: any) => Promise<T>
  update: (id: number, dto: any) => Promise<T>
  del: (id: number) => Promise<T>
  restore: (id: number) => Promise<T>
  reorder: (items: { id: number; sortOrder: number }[]) => Promise<T[]>
  mapToForm: (item: T) => F
  buildCreateDto: (form: F, departmentId: number) => Record<string, unknown>
  buildUpdateDto: (form: F) => Record<string, unknown>
  renderFields: (form: F, setForm: (f: F) => void) => ReactNode
  renderRow: (item: T) => ReactNode
  getName: (item: T) => string
  isValid?: (form: F) => boolean
  addLabel?: string
}

export default function DepartmentDragListManager<T extends CmsDragListItem & { version: number }, F>(
  config: DragListManagerConfig<T, F>,
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<T[]>([])
  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<F>(config.emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setItems(await config.fetchAdmin(config.departmentId, true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Failed to load ${config.title.toLowerCase()}`)
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await config.fetchAdmin(config.departmentId, true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : `Failed to load ${config.title.toLowerCase()}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.departmentId])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(config.emptyForm)
  }

  function startEdit(item: T) {
    setEditing(item)
    setCreating(false)
    setForm(config.mapToForm(item))
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await config.update(editing.id, { ...config.buildUpdateDto(form), version: editing.version })
      } else {
        await config.create(config.buildCreateDto(form, config.departmentId))
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: T) {
    if (!confirm(`Delete "${config.getName(item)}"? You can restore it afterwards.`)) return
    try {
      await config.del(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete")
    }
  }

  async function handleRestore(item: T) {
    try {
      await config.restore(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore")
    }
  }

  async function handleReorder(newOrder: T[]) {
    setItems((prev) => {
      const deleted = prev.filter((i) => i.deletedAt !== null)
      return [...newOrder, ...deleted]
    })
    try {
      await config.reorder(newOrder.map((item, index) => ({ id: item.id, sortOrder: index })))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder")
      await refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating
  const liveItems = items.filter((i) => i.deletedAt === null)
  const deletedItems = items.filter((i) => i.deletedAt !== null)
  const valid = config.isValid ? config.isValid(form) : true

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
          {config.description && <p className="text-sm text-slate-500">{config.description}</p>}
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> {config.addLabel ?? "Add"}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit" : "New"}</p>
          {config.renderFields(form, setForm)}
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !valid}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsDragList
        items={liveItems}
        onReorder={handleReorder}
        onEdit={startEdit}
        onDelete={handleDelete}
        renderRow={config.renderRow}
        emptyLabel="Nothing here yet."
      />

      {deletedItems.length > 0 && (
        <div className="border-t border-admin-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{config.getName(item)}</span>
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
    </div>
  )
}
