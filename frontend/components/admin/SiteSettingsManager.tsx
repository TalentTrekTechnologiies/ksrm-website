"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Mail, Send } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsTableSkeleton from "@/components/admin/cms/CmsTableSkeleton"
import MediaField from "@/components/admin/cms/MediaField"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { TextField, TextAreaField, ToggleField, PrimaryButton } from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import {
  getSiteSettings,
  updateSiteSetting,
  getSystemInfo,
  sendTestEmail,
  SiteSetting,
  SystemInfo,
} from "@/lib/site-settings-api"
import {
  getSectionVisibility,
  updateSectionVisibility,
  SectionVisibilityEntry,
  SectionVisibilityKey,
} from "@/lib/homepage-api"

// Every field on this page is a named, human concept ("College Logo",
// "Hide Recruiters on the homepage") backed by an internal SiteSetting key
// ("site.logoUrl") - the key itself is never shown to an admin. This
// mapping is the one place that translates between the two; every section
// below reads/writes plain values through it, never raw rows or `.key`
// strings directly in JSX.
type Values = Record<string, string>

const HOMEPAGE_SECTION_LABELS: Record<SectionVisibilityKey, string> = {
  testimonials: "Testimonials",
  campusVideos: "Campus Videos",
  accreditation: "Accreditation Badges",
  recruiters: "Recruiters",
  departments: "Department Cards",
  latestNews: "Latest News",
}

function bytesToMb(bytes: string | undefined): string {
  if (!bytes) return ""
  return (Number(bytes) / (1024 * 1024)).toFixed(0)
}
function mbToBytes(mb: string): string {
  return String(Math.round(Number(mb) * 1024 * 1024))
}
function formatBytesHuman(bytes: string): string {
  const n = Number(bytes)
  if (!Number.isFinite(n)) return "—"
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function SectionCard({
  title,
  description,
  children,
  onSave,
  saving,
  saved,
}: {
  title: string
  description?: string
  children: React.ReactNode
  onSave?: () => void
  saving?: boolean
  saved?: boolean
}) {
  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="space-y-5 rounded-2xl border border-admin-border bg-white p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {onSave && (
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            <PrimaryButton onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </PrimaryButton>
          </div>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SiteSettingsManagerInner() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [values, setValues] = useState<Values>({})
  const [mediaIds, setMediaIds] = useState<Record<string, number | null>>({})
  const [sections, setSections] = useState<SectionVisibilityEntry[]>([])
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [savingGroup, setSavingGroup] = useState<string | null>(null)
  const [savedGroup, setSavedGroup] = useState<string | null>(null)
  const [savingFaculty, setSavingFaculty] = useState(false)
  const { confirm, notifySaved } = useCmsConfirm()
  const [testEmailAddress, setTestEmailAddress] = useState("")
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const byKey = useMemo(() => {
    const map: Record<string, SiteSetting> = {}
    for (const s of settings) map[s.key] = s
    return map
  }, [settings])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [allSettings, visibility, sysInfo] = await Promise.all([
          getSiteSettings(),
          getSectionVisibility(),
          getSystemInfo(),
        ])
        if (cancelled) return
        setSettings(allSettings)
        const v: Values = {}
        const m: Record<string, number | null> = {}
        for (const s of allSettings) {
          v[s.key] = s.value
          m[s.key] = s.mediaId
        }
        setValues(v)
        setMediaIds(m)
        setSections(visibility)
        setSystemInfo(sysInfo)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load site settings")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }
  function setMediaValue(key: string, url: string, mediaId: number | null) {
    setValues((prev) => ({ ...prev, [key]: url }))
    setMediaIds((prev) => ({ ...prev, [key]: mediaId }))
  }

  async function saveGroup(groupName: string, keys: string[]) {
    if (
      !(await confirm({
        title: "Save changes?",
        message: `Apply your changes to ${groupName.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} settings? They take effect on the public site straight away.`,
        confirmLabel: "Save",
      }))
    ) {
      return
    }
    setSavingGroup(groupName)
    setSavedGroup(null)
    setError(null)
    try {
      await Promise.all(
        keys
          .filter((key) => byKey[key])
          .map((key) => {
            const row = byKey[key]
            const dto: { value: string; mediaId?: number | null } = { value: values[key] ?? row.value }
            if (row.type === "IMAGE_URL") dto.mediaId = mediaIds[key] ?? null
            return updateSiteSetting(row.id, dto)
          }),
      )
      setSettings(await getSiteSettings())
      setSavedGroup(groupName)
      setTimeout(() => setSavedGroup((g) => (g === groupName ? null : g)), 2500)
      notifySaved("Your settings have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Failed to save ${groupName}`)
    } finally {
      setSavingGroup(null)
    }
  }

  // The faculty-photos switch auto-saves on confirm - no Save button - because
  // one flip changes every department page on the public site.
  async function toggleFacultyPhotos(next: boolean) {
    const row = byKey["faculty_show_photos"]
    if (!row) {
      setError("The 'faculty_show_photos' setting doesn't exist yet - apply the latest database migration, then reload this page.")
      return
    }
    const ok = await confirm({
      title: "Faculty photos",
      message: next
        ? "Turn faculty photos ON for every department page? Each page will show faculty as photo cards."
        : "Turn faculty photos OFF for every department page? Each page will show a compact faculty list (no photos).",
    })
    if (!ok) return
    setSavingFaculty(true)
    setError(null)
    try {
      await updateSiteSetting(row.id, { value: String(next) })
      setSettings(await getSiteSettings())
      setValue("faculty_show_photos", String(next))
      notifySaved(next ? "Faculty photos are now on." : "Faculty photos are now off.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update faculty display mode")
    } finally {
      setSavingFaculty(false)
    }
  }

  async function toggleSection(key: SectionVisibilityKey, visible: boolean) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible } : s)))
    try {
      await updateSectionVisibility(key, visible)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update section visibility")
      setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !visible } : s)))
    }
  }

  async function handleSendTestEmail() {
    setTestEmailStatus("sending")
    try {
      await sendTestEmail(testEmailAddress)
      setTestEmailStatus("sent")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send test email")
      setTestEmailStatus("error")
    }
  }

  if (loading) {
    return <CmsTableSkeleton showHeader={false} rows={4} />
  }

  const v = (key: string) => values[key] ?? ""
  const bool = (key: string) => v(key) !== "false"

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          Site Settings
        </h1>
        <p className="text-sm text-slate-500">
          Global configuration for the public site - branding, contact details, homepage sections, and system defaults.
        </p>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <SectionCard
        title="Branding"
        description="The college's identity across every page."
        onSave={() =>
          saveGroup("branding", [
            "site.collegeName",
            "site.logoUrl",
            "site.faviconUrl",
            "site.collegeMotto",
            "site.footerCopyright",
          ])
        }
        saving={savingGroup === "branding"}
        saved={savedGroup === "branding"}
      >
        <TextField label="College Name" value={v("site.collegeName")} onChange={(val) => setValue("site.collegeName", val)} />
        <TextField label="College Motto" value={v("site.collegeMotto")} onChange={(val) => setValue("site.collegeMotto", val)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MediaField
            label="College Logo"
            url={v("site.logoUrl")}
            mediaId={mediaIds["site.logoUrl"] ?? null}
            onChange={(url, mediaId) => setMediaValue("site.logoUrl", url, mediaId)}
            accept={["IMAGE"]}
          />
          <MediaField
            label="Favicon"
            url={v("site.faviconUrl")}
            mediaId={mediaIds["site.faviconUrl"] ?? null}
            onChange={(url, mediaId) => setMediaValue("site.faviconUrl", url, mediaId)}
            accept={["IMAGE"]}
          />
        </div>
        {/* The Primary/Accent theme colour pickers were removed: the public
            site's palette is authored directly in the components, so those
            settings never had any effect - a control that silently does
            nothing is worse than no control. */}
        <TextField label="Footer Copyright" value={v("site.footerCopyright")} onChange={(val) => setValue("site.footerCopyright", val)} />
      </SectionCard>

      <SectionCard
        title="Contact Information"
        description="The college's general contact details (shown in the footer and contact pages)."
        onSave={() =>
          saveGroup("contact", ["site.contactEmail", "site.contactPhone", "site.contactAddress", "site.googleMapsEmbedUrl"])
        }
        saving={savingGroup === "contact"}
        saved={savedGroup === "contact"}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Email" value={v("site.contactEmail")} onChange={(val) => setValue("site.contactEmail", val)} />
          <TextField label="Phone" value={v("site.contactPhone")} onChange={(val) => setValue("site.contactPhone", val)} />
        </div>
        <TextField label="Address" value={v("site.contactAddress")} onChange={(val) => setValue("site.contactAddress", val)} />
        <TextField
          label="Google Maps Embed URL"
          value={v("site.googleMapsEmbedUrl")}
          onChange={(val) => setValue("site.googleMapsEmbedUrl", val)}
          helperText="From Google Maps: Share > Embed a map > copy the src URL."
        />
      </SectionCard>

      <SectionCard
        title="Social Media Links"
        onSave={() =>
          saveGroup("social", [
            "site.socialFacebook",
            "site.socialTwitter",
            "site.socialInstagram",
            "site.socialYoutube",
            "site.socialLinkedin",
          ])
        }
        saving={savingGroup === "social"}
        saved={savedGroup === "social"}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Facebook" value={v("site.socialFacebook")} onChange={(val) => setValue("site.socialFacebook", val)} placeholder="https://facebook.com/..." />
          <TextField label="Twitter / X" value={v("site.socialTwitter")} onChange={(val) => setValue("site.socialTwitter", val)} placeholder="https://x.com/..." />
          <TextField label="Instagram" value={v("site.socialInstagram")} onChange={(val) => setValue("site.socialInstagram", val)} placeholder="https://instagram.com/..." />
          <TextField label="YouTube" value={v("site.socialYoutube")} onChange={(val) => setValue("site.socialYoutube", val)} placeholder="https://youtube.com/..." />
          <TextField label="LinkedIn" value={v("site.socialLinkedin")} onChange={(val) => setValue("site.socialLinkedin", val)} placeholder="https://linkedin.com/..." />
        </div>
      </SectionCard>

      <SectionCard
        title="Announcement Settings"
        description="Controls every ticker across the site (Header, Hero, Homepage, Departments, Admissions, Placements)."
        onSave={() =>
          saveGroup("announcements", [
            "site.announcementHeaderTickerEnabled",
            "site.announcementHeroTickerEnabled",
            "site.announcementTickerSpeedSeconds",
            "site.announcementPauseOnHover",
            "site.announcementMaxVisible",
          ])
        }
        saving={savingGroup === "announcements"}
        saved={savedGroup === "announcements"}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ToggleField
            label="Header Ticker"
            checked={bool("site.announcementHeaderTickerEnabled")}
            onChange={(checked) => setValue("site.announcementHeaderTickerEnabled", String(checked))}
          />
          <ToggleField
            label="Hero Ticker"
            checked={bool("site.announcementHeroTickerEnabled")}
            onChange={(checked) => setValue("site.announcementHeroTickerEnabled", String(checked))}
          />
          <ToggleField
            label="Pause on Hover"
            checked={bool("site.announcementPauseOnHover")}
            onChange={(checked) => setValue("site.announcementPauseOnHover", String(checked))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Scroll Speed - {v("site.announcementTickerSpeedSeconds") || 40}s per loop
          </label>
          <input
            type="range"
            min={10}
            max={90}
            step={5}
            value={Number(v("site.announcementTickerSpeedSeconds")) || 40}
            onChange={(e) => setValue("site.announcementTickerSpeedSeconds", e.target.value)}
            className="w-full max-w-md accent-admin-primary"
          />
          <p className="mt-1 text-xs text-slate-400">Lower is faster.</p>
        </div>
        <div className="max-w-[200px]">
          <TextField
            label="Maximum Visible Announcements"
            value={v("site.announcementMaxVisible")}
            onChange={(val) => setValue("site.announcementMaxVisible", val.replace(/\D/g, ""))}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Department Pages"
        description="Global appearance controls applied to every department page at once. Changes save on confirm - no Save button."
      >
        <ToggleField
          label="Show faculty photos (off shows a compact faculty list on all departments)"
          checked={bool("faculty_show_photos")}
          onChange={toggleFacultyPhotos}
          disabled={savingFaculty}
        />
      </SectionCard>

      <SectionCard title="Homepage Sections" description="Turn homepage sections on or off without deleting their content.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sections.map((s) => (
            <label
              key={s.key}
              className="flex items-center justify-between rounded-lg border border-admin-border px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-700">{HOMEPAGE_SECTION_LABELS[s.key]}</span>
              <button
                type="button"
                role="switch"
                aria-checked={s.visible}
                onClick={() => toggleSection(s.key, !s.visible)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  s.visible ? "bg-admin-primary" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    s.visible ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Hero Banner and Statistics don&apos;t have an on/off toggle yet - only these 6 sections are wired to this
          switch so far.
        </p>
      </SectionCard>

      <SectionCard
        title="Media Settings"
        description="Upload limits enforced by the Media Library."
        onSave={() =>
          saveGroup("media", ['media.maxSizeImageBytes', 'media.maxSizeVideoBytes', 'media.maxSizeDocumentBytes'])
        }
        saving={savingGroup === "media"}
        saved={savedGroup === "media"}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Max Image Size (MB)</label>
            <input
              type="number"
              min={1}
              value={bytesToMb(v("media.maxSizeImageBytes"))}
              onChange={(e) => setValue("media.maxSizeImageBytes", mbToBytes(e.target.value))}
              className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Max Video Size (MB)</label>
            <input
              type="number"
              min={1}
              value={bytesToMb(v("media.maxSizeVideoBytes"))}
              onChange={(e) => setValue("media.maxSizeVideoBytes", mbToBytes(e.target.value))}
              className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Max Document Size (MB)</label>
            <input
              type="number"
              min={1}
              value={bytesToMb(v("media.maxSizeDocumentBytes"))}
              onChange={(e) => setValue("media.maxSizeDocumentBytes", mbToBytes(e.target.value))}
              className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Images are automatically compressed and converted to WebP (6 sizes each) on upload - this always happens,
          it isn&apos;t a toggle. Allowed formats (JPG/PNG/WebP/SVG for images, MP4/WebM for video, PDF/DOC/DOCX/XLSX/PPTX
          for documents) are a fixed, security-reviewed list, not admin-editable here.
        </p>
      </SectionCard>

      <SectionCard title="Email Settings">
        <div className="rounded-lg bg-admin-bg p-4 text-sm text-slate-600">
          <p className="flex items-center gap-2 font-semibold text-slate-700">
            <Mail className="h-4 w-4" /> Provider
          </p>
          <p className="mt-1">{v("site.emailConfigInfo")}</p>
        </div>
        <div className="max-w-md">
          <TextField
            label="HR Email"
            value={v("site.hrEmail")}
            onChange={(val) => setValue("site.hrEmail", val)}
            helperText="Receives Career Application notifications."
          />
          <div className="mt-2">
            <PrimaryButton onClick={() => saveGroup("email", ["site.hrEmail"])} disabled={savingGroup === "email"}>
              {savingGroup === "email" ? "Saving..." : "Save"}
            </PrimaryButton>
            {savedGroup === "email" && <span className="ml-2 text-xs font-semibold text-emerald-600">Saved</span>}
          </div>
        </div>
        <div className="border-t border-admin-border pt-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Send Test Email</label>
          <div className="flex max-w-md items-center gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => {
                setTestEmailAddress(e.target.value)
                setTestEmailStatus("idle")
              }}
              placeholder="you@ksrm.edu"
              className="flex-1 rounded-lg border border-admin-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={!testEmailAddress || testEmailStatus === "sending"}
              className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> {testEmailStatus === "sending" ? "Sending..." : "Send"}
            </button>
          </div>
          {testEmailStatus === "sent" && (
            <p className="mt-1.5 text-xs font-semibold text-emerald-600">
              Sent via the configured provider. Check the inbox (or server logs, if using the console provider).
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="SEO"
        onSave={() =>
          saveGroup("seo", ["site.seoDefaultTitle", "site.seoDefaultDescription", "site.seoKeywords", "site.seoOgImageUrl"])
        }
        saving={savingGroup === "seo"}
        saved={savedGroup === "seo"}
      >
        <TextField label="Default Title" value={v("site.seoDefaultTitle")} onChange={(val) => setValue("site.seoDefaultTitle", val)} />
        <TextAreaField
          label="Meta Description"
          value={v("site.seoDefaultDescription")}
          onChange={(val) => setValue("site.seoDefaultDescription", val)}
          maxLength={300}
        />
        <TextField label="Keywords" value={v("site.seoKeywords")} onChange={(val) => setValue("site.seoKeywords", val)} helperText="Comma-separated." />
        <MediaField
          label="Default Social Share Image (OG Image)"
          url={v("site.seoOgImageUrl")}
          mediaId={mediaIds["site.seoOgImageUrl"] ?? null}
          onChange={(url, mediaId) => setMediaValue("site.seoOgImageUrl", url, mediaId)}
          accept={["IMAGE"]}
        />
      </SectionCard>

      <SectionCard
        title="System"
        onSave={() => saveGroup("system", ["site.maintenanceMode"])}
        saving={savingGroup === "system"}
        saved={savedGroup === "system"}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-admin-bg p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Version</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{systemInfo?.version ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-admin-bg p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Environment</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{systemInfo?.environment ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-admin-bg p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Storage Used</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {systemInfo ? formatBytesHuman(systemInfo.storageUsedBytes) : "—"}
            </p>
          </div>
        </div>
        <ToggleField
          label="Maintenance Mode"
          checked={bool("site.maintenanceMode")}
          onChange={(checked) => setValue("site.maintenanceMode", String(checked))}
        />
        <p className="text-xs text-slate-400">
          A full System Health Dashboard (active users, failed jobs, backups) is planned separately - this is just
          the flag and the basics.
        </p>
      </SectionCard>
    </div>
  )
}

export default function SiteSettingsManager() {
  return (
    <PermissionGate permission="site_settings.view">
      <SiteSettingsManagerInner />
    </PermissionGate>
  )
}
