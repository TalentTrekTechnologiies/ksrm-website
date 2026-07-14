"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import SectionEditorHeader from "@/components/admin/cms/SectionEditorHeader"
import CmsRecordMeta from "@/components/admin/cms/CmsRecordMeta"
import CmsAuditHistoryDrawer from "@/components/admin/cms/CmsAuditHistoryDrawer"
import CmsPreviewPanel from "@/components/admin/cms/CmsPreviewPanel"
import CmsDynamicList from "@/components/admin/cms/CmsDynamicList"
import { TextField, FormActions, SecondaryButton, PublishButton } from "@/components/admin/cms/CmsForm"
import { useSectionEditor } from "@/lib/useSectionEditor"
import { MissionContent, MissionItem } from "@/lib/homepage-api"

const emptyForm: MissionContent = { label: "", missions: [] }

function MissionEditorInner() {
  const editor = useSectionEditor("mission")
  const [form, setForm] = useState<MissionContent>(emptyForm)

  useEffect(() => {
    function syncForm() {
      if (!editor.section) return
      setForm({ label: editor.section.content.label, missions: editor.section.content.missions })
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

  const isValid = form.label.trim() && form.missions.length > 0 && form.missions.every((m) => m.code.trim() && m.text.trim())

  return (
    <div className="space-y-6">
      <SectionEditorHeader
        title="Mission"
        description="Manage the Mission points shown on the public website."
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
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-5 rounded-xl border border-admin-border bg-white p-6">
          <TextField label="Section label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} required maxLength={60} />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Mission points</p>
            <CmsDynamicList<MissionItem>
              items={form.missions}
              onChange={(missions) => setForm({ ...form, missions })}
              newItem={() => ({ code: `M${form.missions.length + 1}`, text: "" })}
              itemLabel="mission point"
              emptyTitle="No mission points yet"
              emptyDescription="Create your first one."
              renderItem={(item, _index, update) => (
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <TextField label="Code" value={item.code} onChange={(code) => update({ ...item, code })} maxLength={10} />
                  <TextField label="Text" value={item.text} onChange={(text) => update({ ...item, text })} maxLength={400} />
                </div>
              )}
            />
          </div>

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

        <CmsPreviewPanel previewKey="mission" draftData={form} />
      </div>

      {editor.section && (
        <CmsAuditHistoryDrawer
          open={editor.auditOpen}
          onClose={editor.closeAudit}
          module="homepage_section_mission"
          targetId={editor.section.id}
        />
      )}
    </div>
  )
}

export default function MissionEditor() {
  return (
    <PermissionGate permission="homepage.edit">
      <MissionEditorInner />
    </PermissionGate>
  )
}
