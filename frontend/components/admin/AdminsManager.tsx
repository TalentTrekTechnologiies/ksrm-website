"use client"

import { useEffect, useState } from "react"
import { Plus, AlertTriangle, RotateCcw, KeyRound, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import {
  TextField,
  SelectField,
  ToggleField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { getStoredAdmin } from "@/lib/auth"
import { getRoles, Role } from "@/lib/roles-api"
import { getDepartmentsAdmin, Department } from "@/lib/departments-api"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  setAdminStatus,
  resetAdminPassword,
  assignAdminRoles,
  deleteAdmin,
  restoreAdmin,
  Admin,
  AdminStatusFilter,
} from "@/lib/admins-api"

interface FormState {
  name: string
  email: string
  password: string
  department: string
  departmentId: number | null
  isSuperAdmin: boolean
  roleIds: number[]
}

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  department: "",
  departmentId: null,
  isSuperAdmin: false,
  roleIds: [],
}

const STATUS_OPTIONS: { value: AdminStatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
  { value: "deleted", label: "Deleted" },
  { value: "all", label: "All" },
]

function StatusBadge({ admin }: { admin: Admin }) {
  if (admin.deletedAt) {
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50">Deleted</span>
  }
  if (!admin.isActive) {
    return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50">Disabled</span>
  }
  return <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50">Active</span>
}

function formatLastLogin(value: string | null): string {
  if (!value) return "Never"
  return new Date(value).toLocaleString()
}

function AdminsManagerInner() {
  const currentAdmin = getStoredAdmin()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [items, setItems] = useState<Admin[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<AdminStatusFilter>("active")
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  const [editing, setEditing] = useState<Admin | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [resetTarget, setResetTarget] = useState<Admin | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [rolesTarget, setRolesTarget] = useState<Admin | null>(null)
  const [rolesDraft, setRolesDraft] = useState<number[]>([])

  async function refresh() {
    try {
      const res = await getAdmins({ search: search || undefined, status, page, pageSize })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load admins")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const [adminsRes, rolesRes, departmentsRes] = await Promise.all([
          getAdmins({ search: search || undefined, status, page, pageSize }),
          getRoles(),
          getDepartmentsAdmin(),
        ])
        if (!cancelled) {
          setItems(adminsRes.items)
          setTotal(adminsRes.total)
          setDepartments(departmentsRes.filter((d) => d.isActive))
          setRoles(rolesRes)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load admins")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      refresh()
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function startCreate() {
    setCreating(true)
    setEditing(null)
    setForm(emptyForm)
  }

  function startEdit(admin: Admin) {
    setEditing(admin)
    setCreating(false)
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      department: admin.department ?? "",
      departmentId: admin.departmentId,
      isSuperAdmin: admin.isSuperAdmin,
      roleIds: admin.roles.map((r) => r.id),
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
      if (editing) {
        await updateAdmin(editing.id, {
          name: form.name,
          email: form.email,
          department: form.department || undefined,
          // Sent as-is (not `?? undefined`) - `null` here means "clear the
          // department scope," which must reach the backend as an explicit
          // null, not be silently dropped as "don't change."
          departmentId: form.departmentId,
          version: editing.version,
        })
      } else {
        await createAdmin({
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department || undefined,
          departmentId: form.departmentId ?? undefined,
          roleIds: form.roleIds,
          isSuperAdmin: form.isSuperAdmin,
        })
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save admin")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(admin: Admin) {
    setError(null)
    try {
      await setAdminStatus(admin.id, !admin.isActive)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status")
    }
  }

  async function handleDelete(admin: Admin) {
    if (!(await confirm({ title: "Delete", message: `Delete admin "${admin.name}"? You can restore them afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    setError(null)
    try {
      await deleteAdmin(admin.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete admin")
    }
  }

  async function handleRestore(admin: Admin) {
    setError(null)
    try {
      await restoreAdmin(admin.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore admin")
    }
  }

  function openResetPassword(admin: Admin) {
    setResetTarget(admin)
    setNewPassword("")
  }

  async function handleResetPassword() {
    if (!resetTarget) return
    setError(null)
    try {
      await resetAdminPassword(resetTarget.id, newPassword)
      setResetTarget(null)
      setNewPassword("")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset password")
    }
  }

  function openRolesModal(admin: Admin) {
    setRolesTarget(admin)
    setRolesDraft(admin.roles.map((r) => r.id))
  }

  async function handleAssignRoles() {
    if (!rolesTarget) return
    setError(null)
    try {
      await assignAdminRoles(rolesTarget.id, rolesDraft)
      setRolesTarget(null)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to assign roles")
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const isFormOpen = editing !== null || creating

  if (loading) {
    return <CmsTableSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          Admin Accounts
        </h1>
        <p className="text-sm text-slate-500">
          Super Admin controls everything. Other admins only manage what their roles permit.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit admin" : "New admin"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          </div>
          {!editing && (
            <TextField
              label="Password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              required
              helperText="Minimum 8 characters."
            />
          )}
          <TextField label="Department (optional, legacy label)" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
          <SelectField
            label="Department ownership (RBAC scope)"
            value={form.departmentId === null ? "" : String(form.departmentId)}
            onChange={(v) => setForm({ ...form, departmentId: v === "" ? null : Number(v) })}
            options={[
              { value: "", label: "— None (unrestricted by department) —" },
              ...departments.map((d) => ({ value: String(d.id), label: d.shortName || d.name })),
            ]}
            helperText="When set, this admin can only create/edit/delete records belonging to this department (Faculty, Labs, Gallery, Downloads, Research, Programmes, Outcomes, Highlights, Contact, Display Settings, and the department itself). Super Admins always have full access regardless of this setting."
          />

          {!editing && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Roles</p>
              <div className="grid grid-cols-1 gap-2 rounded-lg border border-admin-border bg-admin-bg p-3 sm:grid-cols-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.roleIds.includes(role.id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          roleIds: e.target.checked
                            ? [...form.roleIds, role.id]
                            : form.roleIds.filter((id) => id !== role.id),
                        })
                      }
                      className="h-4 w-4 rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {!editing && currentAdmin?.isSuperAdmin && (
            <ToggleField
              label="Grant Super Admin (full, unrestricted access)"
              checked={form.isSuperAdmin}
              onChange={(v) => setForm({ ...form, isSuperAdmin: v })}
            />
          )}

          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={saving || !form.name || !form.email || (!editing && form.password.length < 8)}
            >
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={
          <div className="flex items-center gap-2">
            <div className="w-40">
              <SelectField
                label=""
                value={status}
                onChange={(v) => {
                  setStatus(v as AdminStatusFilter)
                  setPage(1)
                }}
                options={STATUS_OPTIONS}
              />
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
            >
              <Plus className="h-4 w-4" /> Add admin
            </button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-admin-border bg-white">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Name</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Roles</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Department</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Status</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500">Last Login</th>
                <th className="px-4 py-2.5 font-semibold text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    No admins found.
                  </td>
                </tr>
              )}
              {items.map((admin) => (
                <tr key={admin.id} className="border-t border-admin-border hover:bg-admin-bg/60">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-slate-800">{admin.name}</p>
                      {admin.isSuperAdmin && (
                        <span title="Super Admin">
                          <ShieldCheck className="h-3.5 w-3.5 text-admin-primary" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {admin.roles.length === 0 && <span className="text-xs text-slate-300">None</span>}
                      {admin.roles.map((r) => (
                        <span key={r.id} className="rounded bg-admin-bg px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {admin.departmentId ? (
                      departments.find((d) => d.id === admin.departmentId)?.shortName ??
                      departments.find((d) => d.id === admin.departmentId)?.name ??
                      `#${admin.departmentId}`
                    ) : (
                      <span className="text-xs text-slate-300">All departments</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge admin={admin} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{formatLastLogin(admin.lastLoginAt)}</td>
                  <td className="px-4 py-2.5">
                    {admin.deletedAt ? (
                      <button type="button" onClick={() => handleRestore(admin)} className="flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline">
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => startEdit(admin)} className="text-xs font-semibold text-admin-primary hover:underline">
                          Edit
                        </button>
                        <button type="button" onClick={() => openRolesModal(admin)} className="text-xs font-semibold text-admin-primary hover:underline">
                          Roles
                        </button>
                        <button type="button" onClick={() => openResetPassword(admin)} className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:underline">
                          <KeyRound className="h-3 w-3" /> Reset password
                        </button>
                        <button type="button" onClick={() => handleToggleStatus(admin)} className="text-xs font-semibold text-amber-700 hover:underline">
                          {admin.isActive ? "Disable" : "Enable"}
                        </button>
                        <button type="button" onClick={() => handleDelete(admin)} className="text-xs font-semibold text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-admin-border px-4 py-2.5 text-sm text-slate-500">
          <span>
            {total} admin{total === 1 ? "" : "s"} · Page {page} of {totalPages}
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

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5">
            <p className="text-sm font-semibold text-slate-700">Reset password for {resetTarget.name}</p>
            <TextField label="New password" value={newPassword} onChange={setNewPassword} required helperText="Minimum 8 characters." />
            <FormActions>
              <SecondaryButton onClick={() => setResetTarget(null)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleResetPassword} disabled={newPassword.length < 8}>
                Reset password
              </PrimaryButton>
            </FormActions>
          </div>
        </div>
      )}

      {rolesTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5">
            <p className="text-sm font-semibold text-slate-700">Assign roles to {rolesTarget.name}</p>
            <div className="grid grid-cols-1 gap-2 rounded-lg border border-admin-border bg-admin-bg p-3">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={rolesDraft.includes(role.id)}
                    onChange={(e) =>
                      setRolesDraft(
                        e.target.checked ? [...rolesDraft, role.id] : rolesDraft.filter((id) => id !== role.id),
                      )
                    }
                    className="h-4 w-4 rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                  />
                  {role.name}
                </label>
              ))}
            </div>
            <FormActions>
              <SecondaryButton onClick={() => setRolesTarget(null)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleAssignRoles}>Save roles</PrimaryButton>
            </FormActions>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminsManager() {
  return (
    <PermissionGate permission="admins.view">
      <AdminsManagerInner />
    </PermissionGate>
  )
}
