"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import SectionEditorHeader from "@/components/admin/cms/SectionEditorHeader"
import CmsRecordMeta from "@/components/admin/cms/CmsRecordMeta"
import CmsAuditHistoryDrawer from "@/components/admin/cms/CmsAuditHistoryDrawer"
import CmsPreviewPanel from "@/components/admin/cms/CmsPreviewPanel"
import { TextField, TextAreaField, FormActions, SecondaryButton, PublishButton } from "@/components/admin/cms/CmsForm"
import { useSectionEditor } from "@/lib/useSectionEditor"
import { VisionContent } from "@/lib/homepage-api"

const emptyForm: VisionContent = { eyebrow: "", heading: "", label: "", text: "" }

function VisionEditorInner() {
  const editor = useSectionEditor("vision")
  const [form, setForm] = useState<VisionContent>(emptyForm)

  useEffect(() => {
    function syncForm() {
      if (!editor.section) return
      setForm({
        eyebrow: editor.section.content.eyebrow ?? "",
        heading: editor.section.content.heading,
        label: editor.section.content.label,
        text: editor.section.content.text,
      })
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

  const isValid = form.heading.trim() && form.label.trim() && form.text.trim()

  return (
    <div className="space-y-6">
      <SectionEditorHeader
        title="Vision"
        description="Manage the Vision section shown on the public website."
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
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-6">
          <TextField label="Eyebrow" value={form.eyebrow ?? ""} onChange={(v) => setForm({ ...form, eyebrow: v })} placeholder="Who We Are" maxLength={60} />
          <TextField label="Section heading" value={form.heading} onChange={(v) => setForm({ ...form, heading: v })} required maxLength={120} />
          <TextField label="Vision label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} required maxLength={60} />
          <TextAreaField label="Vision statement" value={form.text} onChange={(v) => setForm({ ...form, text: v })} required rows={6} maxLength={600} />

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
            <SecondaryButton
              onClick={() => editor.save(form, "DRAFT")}
              disabled={editor.saving || !isValid}
            >
              {editor.saving ? "Saving..." : "Save Draft"}
            </SecondaryButton>
            <PublishButton
              onClick={() => editor.save(form, "PUBLISHED")}
              disabled={editor.saving || !isValid}
            >
              {editor.saving ? "Publishing..." : "Publish"}
            </PublishButton>
          </FormActions>
        </div>

        <CmsPreviewPanel previewKey="vision" draftData={form} />
      </div>

      {editor.section && (
        <CmsAuditHistoryDrawer
          open={editor.auditOpen}
          onClose={editor.closeAudit}
          module="homepage_section_vision"
          targetId={editor.section.id}
        />
      )}
    </div>
  )
}

export default function VisionEditor() {
  return (
    <PermissionGate permission="homepage.edit">
      <VisionEditorInner />
    </PermissionGate>
  )
}
