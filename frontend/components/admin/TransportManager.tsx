"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, Pencil, Trash2, RotateCcw, Bus } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import {
  TextField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getTransportRoutesAdmin,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
  restoreTransportRoute,
  TransportRoute,
} from "@/lib/transport-routes-api"

/**
 * College bus routes.
 *
 * The transport page listed eight routes as a fixed array - the wording of
 * each was editable, but a route could not be added, removed or reordered
 * without a code change, and the fleet changes every year. Each route also
 * carries its bus number and the driver's name and phone, which had nowhere
 * to live at all before.
 */

interface FormState {
  routeNo: string
  fromPlace: string
  via: string
  departTime: string
  returnTime: string
  fee: string
  busNo: string
  driverName: string
  driverPhone: string
  isActive: boolean
}

const emptyForm: FormState = {
  routeNo: "",
  fromPlace: "",
  via: "",
  departTime: "",
  returnTime: "",
  fee: "",
  busNo: "",
  driverName: "",
  driverPhone: "",
  isActive: true,
}

function TransportManagerInner() {
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<TransportRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<TransportRoute | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setItems(await getTransportRoutesAdmin(true))
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bus routes")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const rows = await getTransportRoutesAdmin(true)
        if (!cancelled) setItems(rows)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load bus routes")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: TransportRoute) {
    setEditing(item)
    setCreating(false)
    setForm({
      routeNo: item.routeNo,
      fromPlace: item.fromPlace,
      via: item.via ?? "",
      departTime: item.departTime ?? "",
      returnTime: item.returnTime ?? "",
      fee: item.fee ?? "",
      busNo: item.busNo ?? "",
      driverName: item.driverName ?? "",
      driverPhone: item.driverPhone ?? "",
      isActive: item.isActive,
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    if (!form.routeNo.trim() || !form.fromPlace.trim()) return
    if (
      !(await confirm({
        title: "Save changes?",
        message: "Save your changes? They go live on the public site straight away.",
        confirmLabel: "Save",
      }))
    )
      return
    setSaving(true)
    setError(null)
    try {
      // null, not undefined: an omitted key leaves the stored value alone, so
      // clearing a driver's phone would otherwise appear to do nothing.
      const dto = {
        routeNo: form.routeNo.trim(),
        fromPlace: form.fromPlace.trim(),
        via: form.via.trim() || null,
        departTime: form.departTime.trim() || null,
        returnTime: form.returnTime.trim() || null,
        fee: form.fee.trim() || null,
        busNo: form.busNo.trim() || null,
        driverName: form.driverName.trim() || null,
        driverPhone: form.driverPhone.trim() || null,
        isActive: form.isActive,
      }
      if (editing) {
        await updateTransportRoute(editing.id, { ...dto, version: editing.version })
      } else {
        await createTransportRoute(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save the route")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: TransportRoute) {
    if (
      !(await confirm({
        title: "Delete",
        message: `Delete route "${item.routeNo} - ${item.fromPlace}"? You can restore it afterwards.`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return
    try {
      await deleteTransportRoute(item.id)
      await refresh()
      notifySaved("The route has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete the route")
    }
  }

  async function handleRestore(item: TransportRoute) {
    try {
      await restoreTransportRoute(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore the route")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.routeNo.toLowerCase().includes(q) ||
        i.fromPlace.toLowerCase().includes(q) ||
        (i.via ?? "").toLowerCase().includes(q) ||
        (i.driverName ?? "").toLowerCase().includes(q) ||
        (i.busNo ?? "").toLowerCase().includes(q),
    )
  }, [items, search])

  const live = filtered.filter((i) => !i.deletedAt)
  const removed = filtered.filter((i) => i.deletedAt)
  const isFormOpen = creating || editing !== null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Bus className="h-5 w-5 text-admin-primary" /> Transport — Bus Routes
          </h1>
          <p className="text-sm text-slate-500">
            Routes, timings and crew shown on Campus Life → Transport. The fee is kept here but
            is no longer published on that page.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add route
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit route" : "New route"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Route no." value={form.routeNo} onChange={(v) => setForm({ ...form, routeNo: v })} required placeholder="R1" />
            <div className="sm:col-span-2">
              <TextField label="From" value={form.fromPlace} onChange={(v) => setForm({ ...form, fromPlace: v })} required placeholder="Kadapa Railway Station" />
            </div>
          </div>
          <TextField
            label="Via (stops)"
            value={form.via}
            onChange={(v) => setForm({ ...form, via: v })}
            placeholder="Clock Tower → Tirupati Road → KSRMCE Gate"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Departure" value={form.departTime} onChange={(v) => setForm({ ...form, departTime: v })} placeholder="7:30 AM" />
            <TextField label="Return" value={form.returnTime} onChange={(v) => setForm({ ...form, returnTime: v })} placeholder="5:30 PM" />
            <TextField label="Fee" value={form.fee} onChange={(v) => setForm({ ...form, fee: v })} placeholder="₹3,000/month" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Bus no." value={form.busNo} onChange={(v) => setForm({ ...form, busNo: v })} placeholder="AP 04 X 1234" />
            <TextField label="Driver name" value={form.driverName} onChange={(v) => setForm({ ...form, driverName: v })} />
            <TextField label="Driver phone" value={form.driverPhone} onChange={(v) => setForm({ ...form, driverPhone: v })} />
          </div>
          <ToggleField label="Active (shown on the public page)" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.routeNo.trim() || !form.fromPlace.trim()}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search route, stop, driver or bus..."
      />

      {live.length === 0 ? (
        <p className="rounded-xl border border-dashed border-admin-border p-8 text-center text-sm text-slate-400">
          No routes yet. Add one and it appears on the Transport page straight away.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-admin-border">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="bg-admin-bg/60 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Route</th>
                <th className="px-3 py-2">From / Via</th>
                <th className="px-3 py-2">Depart</th>
                <th className="px-3 py-2">Return</th>
                <th className="px-3 py-2">Fee</th>
                <th className="px-3 py-2">Bus &amp; driver</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {live.map((r) => (
                <tr key={r.id} className="border-t border-admin-border align-top">
                  <td className="px-3 py-2 font-semibold text-admin-primary">
                    {r.routeNo}
                    {!r.isActive && <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">Hidden</span>}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-800">{r.fromPlace}</p>
                    {r.via && <p className="text-xs text-slate-500">{r.via}</p>}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.departTime || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.returnTime || "—"}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{r.fee || "—"}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {r.busNo && <p className="text-xs font-semibold text-slate-700">{r.busNo}</p>}
                    {r.driverName ? (
                      <p className="text-xs">
                        {r.driverName}
                        {r.driverPhone && <span className="text-slate-400"> · {r.driverPhone}</span>}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400">no driver assigned</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => startEdit(r)} aria-label="Edit" className="rounded p-1.5 text-slate-500 hover:bg-admin-bg hover:text-admin-primary">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(r)} aria-label="Delete" className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {removed.length > 0 && (
        <div>
          <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Recently deleted</p>
          <div className="overflow-hidden rounded-xl border border-admin-border">
            {removed.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 border-b border-admin-border bg-white px-3 py-2.5 last:border-b-0">
                <p className="truncate text-sm text-slate-500">
                  {r.routeNo} <span className="text-slate-400">· {r.fromPlace}</span>
                </p>
                <button type="button" onClick={() => handleRestore(r)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TransportManager() {
  return (
    <PermissionGate permission="transport_routes.view">
      <TransportManagerInner />
    </PermissionGate>
  )
}
