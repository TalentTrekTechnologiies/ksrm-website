"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, Users, X, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTable from "@/components/admin/cms/CmsTable"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import {
  TextField,
  TextAreaField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getCommitteesAdmin,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  restoreCommittee,
  createCommitteeMember,
  deleteCommitteeMember,
  Committee,
  CommitteeType,
} from "@/lib/committees-api"

interface FormState {
  name: string
  type: CommitteeType
  description: string
  isActive: boolean
}

const emptyForm: FormState = { name: "", type: "OTHER", description: "", isActive: true }

const TYPE_OPTIONS: { value: CommitteeType; label: string }[] = [
  { value: "ANTI_RAGGING", label: "Anti-Ragging" },
  { value: "GRIEVANCE_REDRESSAL", label: "Grievance Redressal" },
  { value: "OTHER", label: "Other" },
]

interface MemberFormState {
  name: string
  designation: string
  role: string
}

const emptyMemberForm: MemberFormState = { name: "", designation: "", role: "" }

function CommitteesManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Committee[]>([])
  const [editing, setEditing] = useState<Committee | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [managingMembersOf, setManagingMembersOf] = useState<Committee | null>(null)
  const [memberForm, setMemberForm] = useState<MemberFormState>(emptyMemberForm)
  const [savingMember, setSavingMember] = useState(false)

  async function refresh() {
    try {
      setItems(await getCommitteesAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load committees")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const all = await getCommitteesAdmin(true)
        if (!cancelled) setItems(all)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load committees")
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

  function startEdit(item: Committee) {
    setEditing(item)
    setCreating(false)
    setForm({ name: item.name, type: item.type, description: item.description ?? "", isActive: item.isActive })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const dto = { name: form.name, type: form.type, description: form.description || undefined, isActive: form.isActive }
      if (editing) {
        await updateCommittee(editing.id, { ...dto, version: editing.version })
      } else {
        await createCommittee(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save committee")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Committee) {
    if (!confirm(`Delete "${item.name}"? You can restore it afterwards.`)) return
    try {
      await deleteCommittee(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete committee")
    }
  }

  async function handleRestore(item: Committee) {
    try {
      await restoreCommittee(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore committee")
    }
  }

  async function handleAddMember() {
    if (!managingMembersOf) return
    setSavingMember(true)
    setError(null)
    try {
      await createCommitteeMember(managingMembersOf.id, memberForm)
      setMemberForm(emptyMemberForm)
      await refresh()
      // Keep the members panel open, pointed at the freshly-updated committee.
      const updatedList = await getCommitteesAdmin(true)
      setItems(updatedList)
      const refreshed = updatedList.find((c) => c.id === managingMembersOf.id)
      if (refreshed) setManagingMembersOf(refreshed)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add member")
    } finally {
      setSavingMember(false)
    }
  }

  async function handleDeleteMember(memberId: number) {
    if (!managingMembersOf) return
    try {
      await deleteCommitteeMember(memberId)
      const updatedList = await getCommitteesAdmin(true)
      setItems(updatedList)
      const refreshed = updatedList.find((c) => c.id === managingMembersOf.id)
      if (refreshed) setManagingMembersOf(refreshed)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove member")
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.name.toLowerCase().includes(q))
  }, [items, search])

  const columns: ColumnDef<Committee>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="max-w-[220px] truncate font-medium text-slate-800">{row.original.name}</p>
          {row.original.deletedAt && <span className="text-[11px] font-semibold text-red-600">Deleted</span>}
        </div>
      ),
    },
    { accessorKey: "type", header: "Type" },
    {
      id: "members",
      header: "Members",
      cell: ({ row }) => row.original.members.length,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
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
            <button type="button" onClick={() => setManagingMembersOf(row.original)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
              <Users className="h-3.5 w-3.5" /> Members
            </button>
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
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
          Committees
        </h1>
        <p className="text-sm text-slate-500">Committees and their membership rosters (Anti-Ragging, Grievance Redressal, etc).</p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit committee" : "New committee"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <SelectField label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v as CommitteeType })} options={TYPE_OPTIONS} required />
          </div>
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {managingMembersOf && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Members of &ldquo;{managingMembersOf.name}&rdquo;</p>
            <button type="button" onClick={() => setManagingMembersOf(null)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="space-y-1.5">
            {managingMembersOf.members.length === 0 && (
              <p className="text-sm text-slate-400">No members yet.</p>
            )}
            {managingMembersOf.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span>
                  <span className="font-medium text-slate-800">{m.name}</span>{" "}
                  <span className="text-slate-500">— {m.designation}, {m.role}</span>
                </span>
                <button type="button" onClick={() => handleDeleteMember(m.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField label="Name" value={memberForm.name} onChange={(v) => setMemberForm({ ...memberForm, name: v })} />
            <TextField label="Designation" value={memberForm.designation} onChange={(v) => setMemberForm({ ...memberForm, designation: v })} />
            <TextField label="Role" value={memberForm.role} onChange={(v) => setMemberForm({ ...memberForm, role: v })} placeholder="Chairperson" />
          </div>
          <FormActions>
            <PrimaryButton onClick={handleAddMember} disabled={savingMember || !memberForm.name || !memberForm.designation || !memberForm.role}>
              {savingMember ? "Adding..." : "Add member"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search committees..."
        filters={
          <button
            type="button"
            onClick={startCreate}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add committee
          </button>
        }
      />

      <CmsTable data={filtered} columns={columns} emptyTitle="No committees yet" emptyDescription="Add your first committee." pageSize={15} />
    </div>
  )
}

export default function CommitteesManager() {
  return (
    <PermissionGate permission="committees.view">
      <CommitteesManagerInner />
    </PermissionGate>
  )
}
