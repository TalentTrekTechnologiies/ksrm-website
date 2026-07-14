"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsLoadingState from "@/components/admin/cms/CmsLoadingState"
import CmsRecordMeta from "@/components/admin/cms/CmsRecordMeta"
import CmsAuditHistoryDrawer from "@/components/admin/cms/CmsAuditHistoryDrawer"
import CmsPreviewPanel from "@/components/admin/cms/CmsPreviewPanel"
import CmsDynamicList from "@/components/admin/cms/CmsDynamicList"
import MediaField from "@/components/admin/cms/MediaField"
import {
  TextField,
  TextAreaField,
  ToggleField,
  FormActions,
  PrimaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getHeroAdmin,
  createHero,
  updateHero,
  getCreatorAndUpdater,
  HomepageHero,
  HeroCaption,
  AuditActor,
} from "@/lib/homepage-api"

const emptyForm = {
  accreditationLabel: "",
  heading: "",
  subtitle: "",
  videoUrl: "",
  mediaId: null as number | null,
  ctaPrimaryText: "",
  ctaPrimaryHref: "",
  ctaSecondaryText: "",
  ctaSecondaryHref: "",
  panelLabel: "",
  isActive: true,
}

function HeroEditorInner() {
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState<HomepageHero | null>(null)
  const [creator, setCreator] = useState<AuditActor | null>(null)
  const [updater, setUpdater] = useState<AuditActor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [captions, setCaptions] = useState<HeroCaption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getHeroAdmin()
        if (cancelled) return
        setHero(data)
        if (data) {
          setForm({
            accreditationLabel: data.accreditationLabel ?? "",
            heading: data.heading,
            subtitle: data.subtitle,
            videoUrl: data.videoUrl,
            mediaId: data.mediaId,
            ctaPrimaryText: data.ctaPrimaryText ?? "",
            ctaPrimaryHref: data.ctaPrimaryHref ?? "",
            ctaSecondaryText: data.ctaSecondaryText ?? "",
            ctaSecondaryHref: data.ctaSecondaryHref ?? "",
            panelLabel: data.panelLabel ?? "",
            isActive: data.isActive,
          })
          setCaptions(data.captions ?? [])
          getCreatorAndUpdater("homepage_hero", data.id).then((result) => {
            if (cancelled) return
            setCreator(result.createdBy)
            setUpdater(result.updatedBy)
          })
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load hero")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const dto = {
        accreditationLabel: form.accreditationLabel || undefined,
        heading: form.heading,
        subtitle: form.subtitle,
        videoUrl: form.videoUrl,
        mediaId: form.mediaId,
        ctaPrimaryText: form.ctaPrimaryText || undefined,
        ctaPrimaryHref: form.ctaPrimaryHref || undefined,
        ctaSecondaryText: form.ctaSecondaryText || undefined,
        ctaSecondaryHref: form.ctaSecondaryHref || undefined,
        panelLabel: form.panelLabel || undefined,
        captions,
        isActive: form.isActive,
      }

      const saved = hero
        ? await updateHero({ ...dto, version: hero.version })
        : await createHero(dto)

      setHero(saved)
      getCreatorAndUpdater("homepage_hero", saved.id).then((result) => {
        setCreator(result.createdBy)
        setUpdater(result.updatedBy)
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setError(
          `${err.message} Reloading the latest version - please re-apply your changes.`,
        )
        getHeroAdmin().then((data) => {
          setHero(data)
          if (data) {
            setCaptions(data.captions ?? [])
          }
        })
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to save hero")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <CmsLoadingState label="Loading hero banner..." />
  }

  const previewDraft: HomepageHero = {
    id: hero?.id ?? 0,
    accreditationLabel: form.accreditationLabel || null,
    heading: form.heading,
    subtitle: form.subtitle,
    videoUrl: form.videoUrl,
    mediaId: form.mediaId,
    ctaPrimaryText: form.ctaPrimaryText || null,
    ctaPrimaryHref: form.ctaPrimaryHref || null,
    ctaSecondaryText: form.ctaSecondaryText || null,
    ctaSecondaryHref: form.ctaSecondaryHref || null,
    panelLabel: form.panelLabel || null,
    captions,
    newsTicker: null,
    isActive: form.isActive,
    createdAt: hero?.createdAt ?? "",
    updatedAt: hero?.updatedAt ?? "",
    deletedAt: null,
    deletedBy: null,
    version: hero?.version ?? 1,
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-400">Homepage / Hero Banner</p>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="mt-1 text-2xl font-bold text-slate-900">
          Hero Banner
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {hero ? "Editing the live hero banner." : "No hero has been configured yet - fill this in and save to create it."}
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Saved.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-xl border border-admin-border bg-white p-5">
            <TextField label="Accreditation label" value={form.accreditationLabel} onChange={(v) => setForm({ ...form, accreditationLabel: v })} placeholder="NAAC A+ · NBA Tier-1 · UGC Autonomous" />
            <TextField label="Heading" value={form.heading} onChange={(v) => setForm({ ...form, heading: v })} required maxLength={200} />
            <TextAreaField label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} required rows={2} maxLength={300} />
            <MediaField
              label="Background Video"
              url={form.videoUrl}
              mediaId={form.mediaId}
              onChange={(url, mediaId) => setForm({ ...form, videoUrl: url, mediaId })}
              accept={["VIDEO"]}
              required
              urlPlaceholder="/videos/main-block.mp4"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Primary CTA text" value={form.ctaPrimaryText} onChange={(v) => setForm({ ...form, ctaPrimaryText: v })} placeholder="Apply Now" />
              <TextField label="Primary CTA link" value={form.ctaPrimaryHref} onChange={(v) => setForm({ ...form, ctaPrimaryHref: v })} placeholder="/admissions" />
              <TextField label="Secondary CTA text" value={form.ctaSecondaryText} onChange={(v) => setForm({ ...form, ctaSecondaryText: v })} placeholder="Explore Campus" />
              <TextField label="Secondary CTA link" value={form.ctaSecondaryHref} onChange={(v) => setForm({ ...form, ctaSecondaryHref: v })} placeholder="/about" />
            </div>

            <TextField label="Panel label" value={form.panelLabel} onChange={(v) => setForm({ ...form, panelLabel: v })} placeholder="Latest Updates" />
            <ToggleField label="Active (visible on the public homepage)" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>

          <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-xl border border-admin-border bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-slate-700">Rotating captions</p>
            <CmsDynamicList
              items={captions}
              onChange={setCaptions}
              newItem={() => ({ label: "", text: "" })}
              itemLabel="caption"
              emptyTitle="No captions yet"
              emptyDescription="Add your first rotating caption."
              renderItem={(item, _i, update) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
                  <TextField label="Label" value={item.label} onChange={(label) => update({ ...item, label })} maxLength={80} />
                  <TextField label="Text" value={item.text} onChange={(text) => update({ ...item, text })} maxLength={200} />
                </div>
              )}
            />
          </div>

          <p className="rounded-xl border border-dashed border-admin-border bg-slate-50 px-4 py-3 text-xs text-slate-500">
            The "Latest Updates" panel now sources directly from{" "}
            <a href="/admin/announcements" className="font-medium text-admin-primary underline">
              Announcements
            </a>{" "}
            (Header Ticker placement) - publish a notice there and it shows here automatically.
          </p>

          {hero && (
            <CmsRecordMeta
              updatedAt={hero.updatedAt}
              createdBy={creator}
              updatedBy={updater}
              version={hero.version}
              onOpenAuditHistory={() => setAuditOpen(true)}
            />
          )}

          <FormActions>
            <PrimaryButton onClick={handleSave} disabled={saving || !form.heading || !form.subtitle || !form.videoUrl}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </FormActions>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CmsPreviewPanel previewKey="hero" draftData={previewDraft} />
        </div>
      </div>

      {hero && (
        <CmsAuditHistoryDrawer
          open={auditOpen}
          onClose={() => setAuditOpen(false)}
          module="homepage_hero"
          targetId={hero.id}
        />
      )}
    </div>
  )
}

export default function HeroEditor() {
  return (
    <PermissionGate permission="homepage.edit">
      <HeroEditorInner />
    </PermissionGate>
  )
}
