"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, AlertTriangle, Users, X } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsDragList from "@/components/admin/cms/CmsDragList"
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
import { getDepartmentsPublic, Department } from "@/lib/departments-api"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getCommitteesAdmin,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  restoreCommittee,
  createCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  reorderCommittees,
  reorderCommitteeMembers,
  Committee,
  CommitteeMember,
  CommitteeType,
  CommitteePlacement,
} from "@/lib/committees-api"

interface FormState {
  name: string
  type: CommitteeType
  description: string
  /** "" means not shown on any page; the select's blank option. */
  placement: CommitteePlacement | ""
  /** "" means institution-wide - not a particular department's committee. */
  departmentId: string
  isActive: boolean
}

const emptyForm: FormState = {
  name: "",
  type: "OTHER",
  description: "",
  placement: "",
  departmentId: "",
  isActive: true,
}

/**
 * Where a committee appears, when its Type has no section of its own.
 *
 * The five types below each drive one built-in section. Anything else - an
 * Internal Complaint Committee, an SC/ST Cell, a Women's Empowerment Cell -
 * is saved as "Other" and had nowhere to appear at all; this is what gives
 * it a page without a developer adding one.
 */
const PLACEMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Not shown on any page" },
  { value: "ABOUT", label: "About Us page" },
  { value: "IQAC", label: "IQAC page" },
  { value: "GRIEVANCE", label: "Grievance Redressal page" },
  { value: "ANTI_RAGGING", label: "Anti-Ragging page" },
  { value: "CAMPUS_LIFE", label: "Campus Life page" },
  { value: "LIBRARY", label: "Central Library page" },
  { value: "KGCET", label: "KGCET page" },
]

const TYPE_OPTIONS: { value: CommitteeType; label: string }[] = [
  { value: "ANTI_RAGGING", label: "Anti-Ragging" },
  { value: "GRIEVANCE_REDRESSAL", label: "Grievance Redressal" },
  // Anything filed under this type renders in the About page's Governing
  // Body section - members added here appear there with no code change.
  { value: "GOVERNING_BODY", label: "Governing Body" },
  // Renders as the IQAC page's Composition table.
  { value: "IQAC", label: "IQAC Composition" },
  // Renders on the chosen department's own page. One per department, so the
  // Department field below is required for this type and ignored for the rest.
  { value: "BOARD_OF_STUDIES", label: "Board of Studies (department)" },
  { value: "STUDENT_CHAPTER", label: "Student Chapter (department)" },
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
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Committee[]>([])
  const [editing, setEditing] = useState<Committee | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  // Held as an id, not as a copy of the row. A copy went stale the moment the
  // list was refetched, so every caller had to remember to re-point it at the
  // new object; deriving it means the panel always shows current data.
  const [managingMembersId, setManagingMembersId] = useState<number | null>(null)
  const [memberForm, setMemberForm] = useState<MemberFormState>(emptyMemberForm)
  const [savingMember, setSavingMember] = useState(false)
  // Which member the form below the list is editing; null means it adds a new
  // one. An id rather than a copy, for the same reason as managingMembersId.
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [reordering, setReordering] = useState(false)
  // For the Department picker. Loaded once; a failure leaves the list empty,
  // which shows the picker with only "Not a department committee" rather than
  // blocking the whole screen over a field most committees do not use.
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    getDepartmentsPublic()
      .then((d) => setDepartments(d.filter((x) => x.isActive)))
      .catch(() => setDepartments([]))
  }, [])

  const managingMembersOf = useMemo(
    () => items.find((c) => c.id === managingMembersId) ?? null,
    [items, managingMembersId],
  )

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

  function startEditMember(m: CommitteeMember) {
    setEditingMemberId(m.id)
    setMemberForm({ name: m.name, designation: m.designation, role: m.role })
  }

  function cancelMemberEdit() {
    setEditingMemberId(null)
    setMemberForm(emptyMemberForm)
  }

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(item: Committee) {
    setEditing(item)
    setCreating(false)
    setForm({
      name: item.name,
      type: item.type,
      description: item.description ?? "",
      placement: item.placement ?? "",
      departmentId: item.departmentId === null ? "" : String(item.departmentId),
      isActive: item.isActive,
    })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      const dto = {
        name: form.name,
        type: form.type,
        description: form.description || null,
        // null, never undefined: an omitted key leaves the column untouched,
        // so "Not shown on any page" would silently fail to clear it.
        placement: form.placement === "" ? null : form.placement,
        // Same null-not-undefined rule as placement: an omitted key leaves the
        // column as it was, so clearing the department would never take.
        departmentId: form.departmentId === "" ? null : Number(form.departmentId),
        isActive: form.isActive,
      }
      if (editing) {
        await updateCommittee(editing.id, { ...dto, version: editing.version })
      } else {
        await createCommittee(dto)
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save committee")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Committee) {
    if (!(await confirm({ title: "Delete", message: `Delete "${item.name}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteCommittee(item.id)
      await refresh()
      notifySaved("The item has been deleted.")
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

  async function handleSaveMember() {
    if (!managingMembersOf) return
    setSavingMember(true)
    setError(null)
    try {
      if (editingMemberId !== null) {
        // Read the version at save time, not from whatever was on screen when
        // the form opened - someone else may have edited this row since.
        const current = managingMembersOf.members.find((m) => m.id === editingMemberId)
        if (!current) throw new ApiError("That member no longer exists. Reload and try again.", 404)
        await updateCommitteeMember(editingMemberId, { ...memberForm, version: current.version })
      } else {
        await createCommitteeMember(managingMembersOf.id, memberForm)
      }
      cancelMemberEdit()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save member")
    } finally {
      setSavingMember(false)
    }
  }

  async function handleDeleteMember(memberId: number) {
    if (!managingMembersOf) return
    try {
      await deleteCommitteeMember(memberId)
      if (editingMemberId === memberId) cancelMemberEdit()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove member")
    }
  }

  /**
   * The list on screen may be filtered by the search box, so the dragged
   * order covers only part of the data - but the reorder call needs every
   * live row. Put the visible rows back into the slots they already occupied,
   * in their new relative order, and leave the hidden rows exactly where they
   * were. Deleted rows never take part: the server orders live rows only.
   */
  function applyVisibleOrder(full: Committee[], reorderedVisible: Committee[]): number[] {
    const moved = reorderedVisible.filter((c) => !c.deletedAt)
    const movedIds = new Set(moved.map((c) => c.id))
    let next = 0
    return full
      .filter((c) => !c.deletedAt)
      .map((c) => (movedIds.has(c.id) ? moved[next++] : c))
      .map((c) => c.id)
  }

  async function handleReorderCommittees(reorderedVisible: Committee[]) {
    setReordering(true)
    setError(null)
    try {
      setItems(await reorderCommittees(applyVisibleOrder(items, reorderedVisible)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save the new order")
      // The rows have already animated into place, so leave nothing on screen
      // that the server did not accept.
      await refresh()
    } finally {
      setReordering(false)
    }
  }

  async function handleReorderMembers(reordered: CommitteeMember[]) {
    if (!managingMembersOf) return
    setReordering(true)
    setError(null)
    try {
      setItems(
        await reorderCommitteeMembers(
          managingMembersOf.id,
          reordered.filter((m) => !m.deletedAt).map((m) => m.id),
        ),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save the new order")
      await refresh()
    } finally {
      setReordering(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matched = q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items
    // Deleted rows sink to the bottom: they take no part in the ordering the
    // public sees, so leaving them mixed in would make a drag land somewhere
    // other than where it looked like it would.
    return [...matched].sort((a, b) => Number(!!a.deletedAt) - Number(!!b.deletedAt))
  }, [items, search])

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
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
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
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit committee" : "New committee"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <SelectField label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v as CommitteeType })} options={TYPE_OPTIONS} required />
          </div>
          <SelectField
            label="Show on page"
            value={form.placement}
            onChange={(v) => setForm({ ...form, placement: v as CommitteePlacement | "" })}
            options={PLACEMENT_OPTIONS}
          />
          <p className="-mt-2 text-xs text-slate-500">
            Anti-Ragging, Grievance Redressal, Governing Body and IQAC Composition already have their own
            section and appear there automatically. Use this for any other committee — an Internal Complaint
            Committee, an SC/ST Cell — to choose which page lists it.
          </p>

          {/* Only for Board of Studies. Shown for that type alone rather than
              always: every other committee is the institution's, and an extra
              always-visible field invites someone to set it by accident. */}
          {(form.type === "BOARD_OF_STUDIES" || form.type === "STUDENT_CHAPTER") && (
            <>
              <SelectField
                label="Department"
                value={form.departmentId}
                onChange={(v) => setForm({ ...form, departmentId: v })}
                options={[
                  { value: "", label: "Choose a department…" },
                  ...departments.map((d) => ({ value: String(d.id), label: d.name })),
                ]}
                required
              />
              <p className="-mt-2 text-xs text-slate-500">
                The roster appears in the Board of Studies section of this department&rsquo;s page. Each
                department has its own, so they can all simply be called &ldquo;Board of Studies&rdquo;.
              </p>
            </>
          )}
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <ToggleField label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={
                saving ||
                !form.name ||
                // A Board of Studies with no department belongs to no page and
                // would render nowhere at all.
                ((form.type === "BOARD_OF_STUDIES" || form.type === "STUDENT_CHAPTER") && !form.departmentId)
              }
            >
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      {managingMembersOf && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Members of &ldquo;{managingMembersOf.name}&rdquo;</p>
            <button type="button" onClick={() => setManagingMembersId(null)} className="text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Drag a member to change where they appear on the public page — the Chairperson first, and so on.
          </p>

          <CmsDragList
            items={managingMembersOf.members.filter((m) => !m.deletedAt)}
            onReorder={handleReorderMembers}
            onEdit={startEditMember}
            onDelete={(m) => handleDeleteMember(m.id)}
            emptyLabel="No members yet."
            // Two lines that wrap, not one that truncates. These entries carry
            // a full posting - "Educationalist nominated by the management for
            // the duration of 5 years" - so an ellipsis hides exactly the part
            // that identifies the person. break-words also stops a single long
            // unbroken token widening the row.
            renderRow={(m) => (
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-slate-800">{m.name}</p>
                <p className="break-words text-xs text-slate-500">
                  {m.designation}
                  {m.role && <span className="text-slate-400"> · {m.role}</span>}
                </p>
              </div>
            )}
          />

          <p className="text-sm font-semibold text-slate-700">
            {editingMemberId !== null ? "Edit member" : "Add a member"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextField label="Name" value={memberForm.name} onChange={(v) => setMemberForm({ ...memberForm, name: v })} />
            <TextField label="Designation" value={memberForm.designation} onChange={(v) => setMemberForm({ ...memberForm, designation: v })} />
            <TextField label="Role" value={memberForm.role} onChange={(v) => setMemberForm({ ...memberForm, role: v })} placeholder="Chairperson" />
          </div>
          <FormActions>
            {editingMemberId !== null && <SecondaryButton onClick={cancelMemberEdit}>Cancel</SecondaryButton>}
            <PrimaryButton onClick={handleSaveMember} disabled={savingMember || !memberForm.name || !memberForm.designation || !memberForm.role}>
              {savingMember ? "Saving..." : editingMemberId !== null ? "Save member" : "Add member"}
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

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        {reordering ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" /> Saving the new order…
          </>
        ) : (
          <>Drag a committee to change the order it appears in on the public site.</>
        )}
      </p>

      <CmsDragList
        items={filtered}
        onReorder={handleReorderCommittees}
        onEdit={startEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        emptyLabel="No committees yet. Add your first committee."
        renderRow={(c) => (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">{c.name}</p>
              <p className="text-xs text-slate-500">
                {TYPE_OPTIONS.find((t) => t.value === c.type)?.label ?? c.type}
                {" · "}
                {c.members.length} {c.members.length === 1 ? "member" : "members"}
                {c.placement && ` · on ${PLACEMENT_OPTIONS.find((p) => p.value === c.placement)?.label ?? c.placement}`}
                {/* Which department, so nine rows all called "Board of
                    Studies" are told apart at a glance. */}
                {c.departmentId !== null &&
                  ` · ${departments.find((d) => d.id === c.departmentId)?.name ?? `department ${c.departmentId}`}`}
              </p>
            </div>
            {!c.deletedAt && (
              <button
                type="button"
                onClick={() => { setManagingMembersId(c.id); cancelMemberEdit() }}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
              >
                <Users className="h-3.5 w-3.5" /> Members
              </button>
            )}
          </div>
        )}
      />
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
