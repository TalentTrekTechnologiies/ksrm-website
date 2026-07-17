"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertTriangle, RotateCcw } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsDragList from "@/components/admin/cms/CmsDragList"
import {
  TextField,
  NumberField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getStatisticsAdmin,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  restoreStatistic,
  reorderStatistics,
  SiteStatistic,
  StatisticGroup,
} from "@/lib/homepage-api"

const GROUPS: { key: StatisticGroup; title: string }[] = [
  { key: "homepage", title: "Homepage stats (CampusStats)" },
  { key: "homepage_placements", title: "Placements stats" },
]

interface FormState {
  label: string
  value: number
  suffix: string
  isActive: boolean
}

const emptyForm: FormState = { label: "", value: 0, suffix: "", isActive: true }

function StatisticsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<SiteStatistic[]>([])
  const [editing, setEditing] = useState<SiteStatistic | null>(null)
  const [creatingGroup, setCreatingGroup] = useState<StatisticGroup | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Post-mutation refresh (after save/delete/restore/reorder) - no loading
  // spinner, just swaps in the latest data. Called from event handlers, so
  // (unlike the initial-load effect below) there's no set-state-in-effect
  // concern here.
  async function refresh() {
    try {
      setItems(await getStatisticsAdmin(undefined, true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load statistics")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getStatisticsAdmin(undefined, true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load statistics")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  function startCreate(group: StatisticGroup) {
    setCreatingGroup(group)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: SiteStatistic) {
    setEditing(item)
    setCreatingGroup(null)
    setForm({ label: item.label, value: item.value, suffix: item.suffix ?? "", isActive: item.isActive })
  }

  function cancelForm() {
    setEditing(null)
    setCreatingGroup(null)
  }

  async function handleSave() {
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateStatistic(editing.id, {
          label: form.label,
          value: form.value,
          suffix: form.suffix || undefined,
          isActive: form.isActive,
          version: editing.version,
        })
      } else if (creatingGroup) {
        await createStatistic({
          scope: creatingGroup,
          label: form.label,
          value: form.value,
          suffix: form.suffix || undefined,
          isActive: form.isActive,
        })
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save statistic")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: SiteStatistic) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.label}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteStatistic(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete statistic")
    }
  }

  async function handleRestore(item: SiteStatistic) {
    try {
      await restoreStatistic(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore statistic")
    }
  }

  async function handleReorder(group: StatisticGroup, newOrder: SiteStatistic[]) {
    // Optimistic local update so the drag feels instant.
    setItems((prev) => {
      const others = prev.filter((i) => i.scope !== group)
      return [...others, ...newOrder];
    })
    try {
      await reorderStatistics(
        group,
        newOrder.map((item, index) => ({ id: item.id, sortOrder: index })),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder statistics")
      await refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creatingGroup !== null

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
          Statistics
        </h1>
        <p className="text-sm text-slate-500">Drag to reorder. Changes apply to the public homepage immediately.</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit statistic" : "New statistic"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} required />
            <NumberField label="Value" value={form.value} onChange={(v) => setForm({ ...form, value: v })} required />
            <TextField label="Suffix" value={form.suffix} onChange={(v) => setForm({ ...form, suffix: v })} placeholder="+  %  LPA" />
          </div>
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.label}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {GROUPS.map((group) => {
        const groupItems = items.filter((i) => i.scope === group.key)
        const liveItems = groupItems.filter((i) => i.deletedAt === null)
        const deletedItems = groupItems.filter((i) => i.deletedAt !== null)

        return (
          <div key={group.key} style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-xl border border-admin-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">{group.title}</p>
              <button
                type="button"
                onClick={() => startCreate(group.key)}
                className="flex items-center gap-1 text-sm font-medium text-admin-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            <CmsDragList
              items={liveItems}
              onReorder={(newOrder) => handleReorder(group.key, newOrder)}
              onEdit={startEdit}
              onDelete={handleDelete}
              renderRow={(item) => (
                <p className="truncate text-sm text-slate-700">
                  <span className="font-semibold">{item.value}{item.suffix}</span>{" "}
                  <span className="text-slate-500">{item.label}</span>
                </p>
              )}
            />

            {deletedItems.length > 0 && (
              <div className="mt-4 border-t border-admin-border pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
                <ul className="space-y-1.5">
                  {deletedItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                      <span className="text-slate-500 line-through">{item.value}{item.suffix} {item.label}</span>
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
      })}
    </div>
  )
}

export default function StatisticsManager() {
  return (
    <PermissionGate permission="homepage.view">
      <StatisticsManagerInner />
    </PermissionGate>
  )
}
