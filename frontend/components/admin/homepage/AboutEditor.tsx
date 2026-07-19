"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import SectionEditorHeader from "@/components/admin/cms/SectionEditorHeader"
import CmsRecordMeta from "@/components/admin/cms/CmsRecordMeta"
import CmsAuditHistoryDrawer from "@/components/admin/cms/CmsAuditHistoryDrawer"
import CmsPreviewPanel from "@/components/admin/cms/CmsPreviewPanel"
import CmsDynamicList from "@/components/admin/cms/CmsDynamicList"
import CmsImageField from "@/components/admin/cms/CmsImageField"
import { TextField, TextAreaField, NumberField, FormActions, SecondaryButton, PublishButton } from "@/components/admin/cms/CmsForm"
import { useSectionEditor } from "@/lib/useSectionEditor"
import { AboutContent, AboutStat, AboutHighlight } from "@/lib/homepage-api"

const emptyForm: AboutContent = {
  eyebrow: "",
  title: "",
  subtitle: "",
  paragraphs: [],
  highlights: [],
  statistics: [],
  foundingYear: new Date().getFullYear(),
  image: { url: "", alt: "", caption: "" },
  badgeLabel: "",
  cta: { text: "", href: "" },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-admin-border pt-4 first:border-t-0 first:pt-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function AboutEditorInner() {
  const editor = useSectionEditor("about")
  const [form, setForm] = useState<AboutContent>(emptyForm)

  useEffect(() => {
    function syncForm() {
      if (!editor.section) return
      setForm({ ...emptyForm, ...editor.section.content, highlights: editor.section.content.highlights ?? [] })
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
    form.title.trim() &&
    form.paragraphs.length > 0 &&
    form.paragraphs.every((p) => p.trim()) &&
    form.statistics.length > 0 &&
    form.statistics.every((s) => s.num.trim() && s.label.trim()) &&
    form.image.url.trim() &&
    form.image.alt.trim() &&
    form.cta.text.trim() &&
    form.cta.href.trim()

  return (
    <div className="space-y-6">
      <SectionEditorHeader
        title="About"
        description="Manage the About / Our Legacy section shown on the public website."
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
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-5 rounded-2xl border border-admin-border bg-white p-6">
          <Section title="Heading">
            <TextField label="Eyebrow" value={form.eyebrow ?? ""} onChange={(v) => setForm({ ...form, eyebrow: v })} maxLength={60} />
            <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required maxLength={150} />
            <TextField label="Subtitle" value={form.subtitle ?? ""} onChange={(v) => setForm({ ...form, subtitle: v })} maxLength={150} />
          </Section>

          <Section title="Paragraphs">
            <CmsDynamicList<string>
              items={form.paragraphs}
              onChange={(paragraphs) => setForm({ ...form, paragraphs })}
              newItem={() => ""}
              itemLabel="paragraph"
              emptyTitle="No paragraphs yet"
              emptyDescription="Add your first one."
              renderItem={(item, _i, update) => (
                <TextAreaField label="Paragraph text" value={item} onChange={update} rows={3} />
              )}
            />
          </Section>

          <Section title="Highlights (optional)">
            <CmsDynamicList<AboutHighlight>
              items={form.highlights ?? []}
              onChange={(highlights) => setForm({ ...form, highlights })}
              newItem={() => ({ title: "", description: "" })}
              itemLabel="highlight"
              emptyTitle="No highlights added"
              emptyDescription="Highlights are optional callouts below the paragraphs."
              renderItem={(item, _i, update) => (
                <div className="space-y-2">
                  <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} maxLength={100} />
                  <TextField label="Description" value={item.description ?? ""} onChange={(description) => update({ ...item, description })} maxLength={300} />
                </div>
              )}
            />
          </Section>

          <Section title="Statistics">
            <NumberField
              label="Founding year"
              value={form.foundingYear}
              onChange={(foundingYear) => setForm({ ...form, foundingYear })}
              required
              helperText="Used to compute the floating badge, e.g. 46+ Years of Trust."
            />
            <CmsDynamicList<AboutStat>
              items={form.statistics}
              onChange={(statistics) => setForm({ ...form, statistics })}
              newItem={() => ({ num: "", label: "" })}
              itemLabel="statistic"
              emptyTitle="No statistics yet"
              emptyDescription="Add your first one."
              renderItem={(item, _i, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Value" value={item.num} onChange={(num) => update({ ...item, num })} maxLength={20} />
                  <TextField label="Label" value={item.label} onChange={(label) => update({ ...item, label })} maxLength={60} />
                </div>
              )}
            />
          </Section>

          <Section title="Image">
            <CmsImageField label="Campus image" value={form.image} onChange={(image) => setForm({ ...form, image })} />
            <TextField label="Badge label" value={form.badgeLabel ?? ""} onChange={(v) => setForm({ ...form, badgeLabel: v })} placeholder="YEARS OF TRUST" maxLength={60} />
          </Section>

          <Section title="CTA">
            <TextField label="Button text" value={form.cta.text} onChange={(text) => setForm({ ...form, cta: { ...form.cta, text } })} required maxLength={60} />
            <TextField label="Button link" value={form.cta.href} onChange={(href) => setForm({ ...form, cta: { ...form.cta, href } })} required placeholder="/about" />
          </Section>

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
          <CmsPreviewPanel previewKey="about" draftData={form} />
        </div>
      </div>

      {editor.section && (
        <CmsAuditHistoryDrawer
          open={editor.auditOpen}
          onClose={editor.closeAudit}
          module="homepage_section_about"
          targetId={editor.section.id}
        />
      )}
    </div>
  )
}

export default function AboutEditor() {
  return (
    <PermissionGate permission="homepage.edit">
      <AboutEditorInner />
    </PermissionGate>
  )
}
