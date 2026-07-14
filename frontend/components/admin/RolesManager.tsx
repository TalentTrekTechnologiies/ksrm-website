"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, AlertTriangle, Lock } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import {
  TextField,
  TextAreaField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { getRoles, getPermissions, createRole, updateRole, deleteRole, Role, Permission } from "@/lib/roles-api"

interface FormState {
  name: string
  description: string
  permissionKeys: string[]
}

const emptyForm: FormState = { name: "", description: "", permissionKeys: [] }

function groupByModule(permissions: Permission[]): Map<string, Permission[]> {
  const groups = new Map<string, Permission[]>()
  for (const permission of permissions) {
    const module = permission.key.split(".")[0]
    const list = groups.get(module) ?? []
    list.push(permission)
    groups.set(module, list)
  }
  return groups
}

function RolesManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [editing, setEditing] = useState<Role | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const permissionGroups = useMemo(() => groupByModule(permissions), [permissions])

  async function refresh() {
    try {
      setRoles(await getRoles())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load roles")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const [rolesRes, permissionsRes] = await Promise.all([getRoles(), getPermissions()])
        if (!cancelled) {
          setRoles(rolesRes)
          setPermissions(permissionsRes)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load roles")
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

  function startEdit(role: Role) {
    if (role.isSystemRole) return
    setEditing(role)
    setCreating(false)
    setForm({ name: role.name, description: role.description ?? "", permissionKeys: role.permissionKeys })
  }

  function cancelForm() {
    setEditing(null)
    setCreating(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const dto = {
        name: form.name,
        description: form.description || undefined,
        permissionKeys: form.permissionKeys,
      }
      if (editing) {
        await updateRole(editing.id, dto)
      } else {
        await createRole(dto)
      }
      cancelForm()
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save role")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(role: Role) {
    if (role.isSystemRole) return
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
    setError(null)
    try {
      await deleteRole(role.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete role")
    }
  }

  function togglePermission(key: string) {
    setForm((prev) => ({
      ...prev,
      permissionKeys: prev.permissionKeys.includes(key)
        ? prev.permissionKeys.filter((k) => k !== key)
        : [...prev.permissionKeys, key],
    }))
  }

  function toggleModule(module: string, keys: string[]) {
    const allSelected = keys.every((k) => form.permissionKeys.includes(k))
    setForm((prev) => ({
      ...prev,
      permissionKeys: allSelected
        ? prev.permissionKeys.filter((k) => !keys.includes(k))
        : Array.from(new Set([...prev.permissionKeys, ...keys])),
    }))
  }

  if (loading) {
    return <CmsTableSkeleton />
  }

  const isFormOpen = editing !== null || creating

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
            Roles &amp; Permissions
          </h1>
          <p className="text-sm text-slate-500">
            Define what each role can do. System roles are protected from editing/deletion.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
        >
          <Plus className="h-4 w-4" /> New role
        </button>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit role" : "New role"}</p>
          <TextField label="Role name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <TextAreaField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Permissions ({form.permissionKeys.length} selected)
            </p>
            <div className="max-h-96 space-y-3 overflow-auto rounded-lg border border-admin-border bg-admin-bg p-3">
              {Array.from(permissionGroups.entries()).map(([module, perms]) => {
                const keys = perms.map((p) => p.key)
                const allSelected = keys.every((k) => form.permissionKeys.includes(k))
                return (
                  <div key={module}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleModule(module, keys)}
                        className="h-4 w-4 rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                      />
                      {module}
                    </label>
                    <div className="ml-6 mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3">
                      {perms.map((p) => (
                        <label key={p.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={form.permissionKeys.includes(p.key)}
                            onChange={() => togglePermission(p.key)}
                            className="h-3.5 w-3.5 rounded border-admin-border text-admin-primary focus:ring-admin-primary/30"
                          />
                          {p.key.slice(module.length + 1)}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <FormActions>
            {editing && <DangerButton onClick={() => handleDelete(editing)}>Delete</DangerButton>}
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.id}
            style={{ boxShadow: "var(--shadow-admin-card)" }}
            className="space-y-2 rounded-xl border border-admin-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{role.name}</p>
              {role.isSystemRole && (
                <span title="System role - protected" className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Lock className="h-3 w-3" /> System
                </span>
              )}
            </div>
            {role.description && <p className="text-xs text-slate-500">{role.description}</p>}
            <p className="text-xs text-slate-400">
              {role.permissionKeys.length} permission{role.permissionKeys.length === 1 ? "" : "s"} · {role.adminCount} admin
              {role.adminCount === 1 ? "" : "s"}
            </p>
            {!role.isSystemRole && (
              <div className="flex items-center gap-3 pt-1">
                <button type="button" onClick={() => startEdit(role)} className="text-xs font-semibold text-admin-primary hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(role)} className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RolesManager() {
  return (
    <PermissionGate permission="roles.view">
      <RolesManagerInner />
    </PermissionGate>
  )
}
