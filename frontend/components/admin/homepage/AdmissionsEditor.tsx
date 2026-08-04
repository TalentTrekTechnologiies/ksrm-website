"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, CheckCircle2, Plus, RotateCcw } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import SectionEditorHeader from "@/components/admin/cms/SectionEditorHeader"
import CmsRecordMeta from "@/components/admin/cms/CmsRecordMeta"
import CmsAuditHistoryDrawer from "@/components/admin/cms/CmsAuditHistoryDrawer"
import CmsPreviewPanel from "@/components/admin/cms/CmsPreviewPanel"
import CmsDynamicList from "@/components/admin/cms/CmsDynamicList"
import CmsDragList from "@/components/admin/cms/CmsDragList"
import CmsChipList from "@/components/admin/cms/CmsChipList"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  FormActions,
  SecondaryButton,
  PrimaryButton,
  PublishButton,
} from "@/components/admin/cms/CmsForm"
import { useSectionEditor } from "@/lib/useSectionEditor"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  AdmissionsContent,
  HelplinePhone,
  AdmissionProgram,
  getAdmissionProgramsAdmin,
  createAdmissionProgram,
  updateAdmissionProgram,
  deleteAdmissionProgram,
  restoreAdmissionProgram,
  reorderAdmissionPrograms,
} from "@/lib/homepage-api"

const emptyForm: AdmissionsContent = {
  badge: "",
  heading: "",
  subtitle: "",
  helplinePhones: [],
  helplineEmail: "",
}

interface ProgramFormState {
  icon: string
  imageUrl: string
  mediaId: number | null
  title: string
  description: string
  tags: string[]
  linkUrl: string
  linkText: string
}

const emptyProgramForm: ProgramFormState = {
  icon: "",
  imageUrl: "",
  mediaId: null,
  title: "",
  description: "",
  tags: [],
  linkUrl: "",
  linkText: "",
}

function ProgramsManager() {
  const [programs, setPrograms] = useState<AdmissionProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [editing, setEditing] = useState<AdmissionProgram | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ProgramFormState>(emptyProgramForm)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    try {
      setPrograms(await getAdmissionProgramsAdmin(true))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load programs")
    }
  }

  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      setLoading(true)
      setError(null)
      try {
        const data = await getAdmissionProgramsAdmin(true)
        if (!cancelled) setPrograms(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load programs")
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
    setForm(emptyProgramForm)
  }
  function startEdit(program: AdmissionProgram) {
    setEditing(program)
    setCreating(false)
    setForm({
      icon: program.icon ?? "",
      imageUrl: program.imageUrl,
      mediaId: program.mediaId,
      title: program.title,
      description: program.description ?? "",
      tags: program.tags,
      linkUrl: program.linkUrl,
      linkText: program.linkText ?? "",
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
      const shared = {
        icon: form.icon || null,
        imageUrl: form.imageUrl,
        mediaId: form.mediaId,
        title: form.title,
        description: form.description || null,
        tags: form.tags,
        linkUrl: form.linkUrl,
        linkText: form.linkText || null,
      }
      if (editing) {
        await updateAdmissionProgram(editing.id, { ...shared, section: "homepage_admission_programs", version: editing.version })
      } else if (creating) {
        await createAdmissionProgram({ ...shared, section: "homepage_admission_programs" })
      }
      cancelForm()
      await refresh()
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save program")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(program: AdmissionProgram) {
    if (!(await confirm({ title: "Delete", message: `Delete "${program.title}"? You can restore it afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteAdmissionProgram(program.id)
      await refresh()
      notifySaved("The item has been deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete program")
    }
  }

  async function handleRestore(program: AdmissionProgram) {
    try {
      await restoreAdmissionProgram(program.id)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore program")
    }
  }

  async function handleReorder(newOrder: AdmissionProgram[]) {
    setPrograms(newOrder)
    try {
      await reorderAdmissionPrograms(newOrder.map((p, i) => ({ id: p.id, sortOrder: i })))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder programs")
      await refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isFormOpen = editing !== null || creating
  const livePrograms = programs.filter((p) => p.deletedAt === null)
  const deletedPrograms = programs.filter((p) => p.deletedAt !== null)

  return (
    <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p style={{ fontFamily: "var(--font-admin-heading)" }} className="text-lg font-bold text-slate-900">
            Programs
          </p>
          <p className="text-sm text-slate-500">Each program appears as its own card - B.Tech, Diploma, and any future programme.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-1.5 text-sm font-semibold text-admin-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add Program
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {isFormOpen && (
        <div className="mb-4 space-y-4 rounded-lg border border-admin-border bg-admin-bg p-4">
          <p className="text-sm font-semibold text-slate-700">{editing ? "Edit program" : "New program"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Programme label" value={form.icon} onChange={(icon) => setForm({ ...form, icon })} placeholder="B.Tech Programmes" />
            <TextField label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} required />
          </div>
          <MediaField
            label="Image"
            url={form.imageUrl}
            mediaId={form.mediaId}
            onChange={(imageUrl, mediaId) => setForm({ ...form, imageUrl, mediaId })}
            accept={["IMAGE"]}
            required
            urlPlaceholder="/b-tech-banner.png"
          />
          <TextField label="Info line" value={form.description} onChange={(description) => setForm({ ...form, description })} placeholder="750+ Seats | 8 Branches | 4 Years" />
          <CmsChipList label="Branches" items={form.tags} onChange={(tags) => setForm({ ...form, tags })} placeholder="Add a branch, e.g. AI & DS" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Button link" value={form.linkUrl} onChange={(linkUrl) => setForm({ ...form, linkUrl })} required placeholder="/b-tech-banner.png" />
            <TextField label="Button text" value={form.linkText} onChange={(linkText) => setForm({ ...form, linkText })} placeholder="View Brochure ↗" />
          </div>
          <FormActions>
            <SecondaryButton onClick={cancelForm}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.title || !form.imageUrl || !form.linkUrl || form.tags.length === 0}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>
      )}

      <CmsDragList
        items={livePrograms}
        onReorder={handleReorder}
        onEdit={startEdit}
        onDelete={handleDelete}
        emptyLabel="No programs yet - add your first one."
        renderRow={(program) => (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL */}
            <img src={program.imageUrl} alt="" className="h-8 w-10 shrink-0 rounded object-cover" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
            <p className="truncate text-sm text-slate-700">
              <span className="font-semibold">{program.title}</span>{" "}
              <span className="text-slate-500">{program.tags.join(", ")}</span>
            </p>
          </div>
        )}
      />

      {deletedPrograms.length > 0 && (
        <div className="mt-4 border-t border-admin-border pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently deleted</p>
          <ul className="space-y-1.5">
            {deletedPrograms.map((program) => (
              <li key={program.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-3 py-2 text-sm">
                <span className="text-slate-500 line-through">{program.title}</span>
                <button
                  type="button"
                  onClick={() => handleRestore(program)}
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

function AdmissionsEditorInner() {
  const editor = useSectionEditor("admissions")
  const [form, setForm] = useState<AdmissionsContent>(emptyForm)

  useEffect(() => {
    function syncForm() {
      if (editor.section) setForm(editor.section.content)
    }
    syncForm()
  }, [editor.section])

  if (editor.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
      </div>
    )
  }

  const isValid =
    form.badge.trim() &&
    form.heading.trim() &&
    form.subtitle.trim() &&
    form.helplinePhones.length > 0 &&
    form.helplineEmail.trim()

  return (
    <div className="space-y-6">
      <SectionEditorHeader
        title="Admissions"
        description="Manage the Admissions section and program cards shown on the public website."
        status={editor.section?.status}
      />

      {editor.error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {editor.error}
        </p>
      )}
      {editor.success && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-6">
          <TextField label="Badge" value={form.badge} onChange={(badge) => setForm({ ...form, badge })} required placeholder="ADMISSIONS 2025-26" />
          <TextField label="Heading" value={form.heading} onChange={(heading) => setForm({ ...form, heading })} required />
          <TextField label="Subtitle" value={form.subtitle} onChange={(subtitle) => setForm({ ...form, subtitle })} required />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Helpline phones</p>
            <CmsDynamicList<HelplinePhone>
              items={form.helplinePhones}
              onChange={(helplinePhones) => setForm({ ...form, helplinePhones })}
              newItem={() => ({ display: "", href: "tel:+91" })}
              itemLabel="phone"
              emptyTitle="No phones yet"
              emptyDescription="Add at least one helpline number."
              renderItem={(item, _i, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Display" value={item.display} onChange={(display) => update({ ...item, display })} placeholder="+91-9000073434" />
                  <TextField label="tel: link" value={item.href} onChange={(href) => update({ ...item, href })} placeholder="tel:+919000073434" />
                </div>
              )}
            />
          </div>

          <TextField label="Helpline email" value={form.helplineEmail} onChange={(helplineEmail) => setForm({ ...form, helplineEmail })} required />

          {editor.section && (
            <CmsRecordMeta
              updatedAt={editor.section.updatedAt}
              createdBy={editor.creator}
              updatedBy={editor.updater}
              version={editor.section.version}
              onOpenAuditHistory={editor.openAudit}
            />
          )}

          <FormActions>
            <SecondaryButton onClick={() => editor.save(form, "DRAFT")} disabled={editor.saving || !isValid}>
              {editor.saving ? "Saving..." : "Save Draft"}
            </SecondaryButton>
            <PublishButton onClick={() => editor.save(form, "PUBLISHED")} disabled={editor.saving || !isValid}>
              {editor.saving ? "Publishing..." : "Publish"}
            </PublishButton>
          </FormActions>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CmsPreviewPanel previewKey="admissions" draftData={form} />
        </div>
      </div>

      <ProgramsManager />

      {editor.section && (
        <CmsAuditHistoryDrawer
          open={editor.auditOpen}
          onClose={editor.closeAudit}
          module="homepage_section_admissions"
          targetId={editor.section.id}
        />
      )}
    </div>
  )
}

export default function AdmissionsEditor() {
  return (
    <PermissionGate permission="homepage.edit">
      <AdmissionsEditorInner />
    </PermissionGate>
  )
}
