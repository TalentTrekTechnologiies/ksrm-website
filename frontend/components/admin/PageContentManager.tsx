"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Loader2, Plus, Trash2, FileText, Image as ImageIcon, Video as VideoIcon, Type } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import MediaField from "@/components/admin/cms/MediaField"
import PageTableEditor from "@/components/admin/PageTableEditor"
import PageTextEditor from "@/components/admin/PageTextEditor"
import { PAGE_TEXT, pagesWithText } from "@/lib/page-text-registry"
import {
  TextField,
  SelectField,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/admin/cms/CmsForm"
import { ApiError } from "@/lib/api-client"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import {
  PAGE_CONTENT_SECTIONS,
  getDownloadsAdmin,
  createDownload,
  deleteDownload,
  Download,
  DownloadCategory,
} from "@/lib/downloads-api"
import {
  getGalleryAdmin,
  createGalleryImage,
  deleteGalleryImage,
  GalleryImage,
} from "@/lib/gallery-api"
import { getDepartmentsAdmin, Department, isAcademicDepartment } from "@/lib/departments-api"
import { getStoredAdmin, allowedPageRoots, pageSectionRoot } from "@/lib/auth"

/**
 * "Pick a place → manage everything on it." One screen listing every public
 * page AND every department, so an admin can see and manage that destination's
 * documents, images and videos together instead of hunting through the separate
 * Documents / Gallery / Media managers. A focused view over the same Downloads
 * and Gallery records those managers own - nothing new server-side.
 */

const CATEGORY_OPTIONS = [
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "QUESTION_PAPER", label: "Question Papers" },
  { value: "BROCHURE", label: "Brochures" },
  { value: "AFFIDAVIT", label: "Affidavits" },
  { value: "FORM", label: "Forms" },
  { value: "OTHER", label: "Other" },
]

/**
 * Every page an admin can manage here.
 *
 * PAGE_SECTIONS lists the pages that accept document/media uploads. The text
 * registry covers more than that - a page can have editable wording without
 * ever needing an attachment - so the two are merged. Without this, those
 * pages' text panels would exist but be unreachable from the dropdown.
 */
const ALL_PAGES = (() => {
  // PAGE_CONTENT_SECTIONS already excludes the sections managed elsewhere, and
  // is the same list the sidebar renders - see downloads-api.ts.
  const byValue = new Map(PAGE_CONTENT_SECTIONS.map((s) => [s.value, s]))
  for (const p of pagesWithText()) if (!byValue.has(p.value)) byValue.set(p.value, p)
  return [...byValue.values()].sort((a, b) => a.label.localeCompare(b.label))
})()

/** Gallery rows holding a video carry this marker category. */
const VIDEO_CATEGORY = "__video__"

/**
 * The dropdown mixes two different destinations, so each option is prefixed:
 * "page:iqac" routes by pageSection, "dept:3" routes by departmentId.
 */
type Target = { kind: "page"; section: string } | { kind: "dept"; departmentId: number }

function parseTarget(v: string): Target | null {
  if (v.startsWith("page:")) return { kind: "page", section: v.slice(5) }
  if (v.startsWith("dept:")) return { kind: "dept", departmentId: Number(v.slice(5)) }
  return null
}

type AddKind = "doc" | "image" | "video" | null

function PageContentInner() {
  // Restrict the page list to what this admin actually owns. The backend's
  // PageSectionOwnershipGuard rejects a write to anything else, so offering
  // the full list would just hand them a 403 after they had filled the form.
  const admin = getStoredAdmin()
  const allowedRoots = allowedPageRoots(admin)
  const pages = useMemo(
    () =>
      allowedRoots === null
        ? ALL_PAGES
        : ALL_PAGES.filter((p) => allowedRoots.has(pageSectionRoot(p.value))),
    [allowedRoots],
  )

  const { confirm, notifySaved } = useCmsConfirm()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selection, setSelection] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [docs, setDocs] = useState<Download[]>([])
  const [images, setImages] = useState<GalleryImage[]>([])
  const [videos, setVideos] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState<AddKind>(null)

  const [docForm, setDocForm] = useState({ title: "", category: "OTHER" as DownloadCategory, fileUrl: "", mediaId: null as number | null })
  const [mediaForm, setMediaForm] = useState({ title: "", url: "", mediaId: null as number | null })

  useEffect(() => {
    getDepartmentsAdmin()
      .then((d) => setDepartments(d.filter((x) => x.isActive && isAcademicDepartment(x))))
      .catch(() => setDepartments([]))
  }, [])

  // Preselect from the sidebar link (/admin/page-content?section=iqac), so
  // clicking a page in the nav opens straight into that page's content.
  useEffect(() => {
    if (typeof window === "undefined") return
    const section = new URLSearchParams(window.location.search).get("section")
    if (section) setSelection(`page:${section}`)
  }, [pathname, searchParams])

  const target = parseTarget(selection)

  async function load(sel: string) {
    const t = parseTarget(sel)
    if (!t) {
      setDocs([])
      setImages([])
      setVideos([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [allDocs, allGallery] = await Promise.all([
        t.kind === "dept" ? getDownloadsAdmin(false, t.departmentId) : getDownloadsAdmin(false),
        t.kind === "dept" ? getGalleryAdmin(false, t.departmentId) : getGalleryAdmin(false),
      ])
      // Department queries are already scoped server-side; page queries filter
      // on the routed section here.
      const docsFor = t.kind === "page" ? allDocs.filter((d) => d.pageSection === t.section) : allDocs
      const galFor = t.kind === "page" ? allGallery.filter((g) => g.pageSection === t.section) : allGallery
      setDocs(docsFor)
      setImages(galFor.filter((g) => g.category !== VIDEO_CATEGORY))
      setVideos(galFor.filter((g) => g.category === VIDEO_CATEGORY))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load this page's content")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(selection)
    setAdding(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection])

  /** Fields that route a new record to the chosen page or department. */
  function routing() {
    if (!target) return {}
    return target.kind === "page"
      ? { pageSection: target.section }
      : { departmentId: target.departmentId }
  }

  async function saveDoc() {
    if (!docForm.title || !docForm.fileUrl) return
    if (!(await confirm({ title: "Add document", message: "Add this document? It goes live straight away.", confirmLabel: "Add" }))) return
    setSaving(true)
    setError(null)
    try {
      await createDownload({
        title: docForm.title,
        category: docForm.category,
        fileUrl: docForm.fileUrl,
        mediaId: docForm.mediaId,
        isActive: true,
        ...routing(),
      })
      setAdding(null)
      setDocForm({ title: "", category: "OTHER", fileUrl: "", mediaId: null })
      await load(selection)
      notifySaved("Document added.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add the document")
    } finally {
      setSaving(false)
    }
  }

  async function saveMedia(kind: "image" | "video") {
    if (!mediaForm.url) return
    if (!(await confirm({ title: kind === "video" ? "Add video" : "Add image", message: "Add this to the page?", confirmLabel: "Add" }))) return
    setSaving(true)
    setError(null)
    try {
      await createGalleryImage({
        title: mediaForm.title || (kind === "video" ? "Video" : "Image"),
        imageUrl: mediaForm.url,
        mediaId: mediaForm.mediaId,
        isActive: true,
        ...(kind === "video" ? { category: VIDEO_CATEGORY } : {}),
        ...routing(),
      })
      setAdding(null)
      setMediaForm({ title: "", url: "", mediaId: null })
      await load(selection)
      notifySaved(kind === "video" ? "Video added." : "Image added.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add")
    } finally {
      setSaving(false)
    }
  }

  async function removeDoc(d: Download) {
    if (!(await confirm({ title: "Delete", message: `Delete "${d.title}"?`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteDownload(d.id)
      await load(selection)
      notifySaved("Document deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete")
    }
  }

  async function removeGallery(g: GalleryImage, what: string) {
    if (!(await confirm({ title: "Remove", message: `Remove "${g.title}"?`, confirmLabel: "Remove", destructive: true }))) return
    try {
      await deleteGalleryImage(g.id)
      await load(selection)
      notifySaved(`${what} removed.`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove")
    }
  }

  const targetLabel = !target
    ? ""
    : target.kind === "page"
      ? ALL_PAGES.find((s) => s.value === target.section)?.label ?? target.section
      : departments.find((d) => d.id === target.departmentId)?.name ?? "Department"

  function AddButtons() {
    if (adding) return null
    const btn = "flex items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-admin-bg"
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setAdding("doc")} className={btn}><FileText className="h-4 w-4" /> Add document</button>
        <button type="button" onClick={() => setAdding("image")} className={btn}><ImageIcon className="h-4 w-4" /> Add image</button>
        <button type="button" onClick={() => setAdding("video")} className={btn}><VideoIcon className="h-4 w-4" /> Add video</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          Page Content
        </h1>
        <p className="text-sm text-slate-500">Pick a page or a department, then add or delete its documents, images and videos in one place.</p>
      </div>

      {/* Native select so pages and departments can sit under separate
          optgroup headings - SelectField only renders a flat list. */}
      <div className="max-w-md">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Which page or department?</label>
        <select
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          className="w-full rounded-lg border border-admin-border bg-white px-3 py-2.5 text-sm text-slate-700"
        >
          <option value="">Select…</option>
          <optgroup label="Pages">
            {pages.map((s) => (
              <option key={s.value} value={`page:${s.value}`}>{s.label}</option>
            ))}
          </optgroup>
          {departments.length > 0 && (
            <optgroup label="Departments">
              {departments.map((d) => (
                <option key={d.id} value={`dept:${d.id}`}>{d.name}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

      {!target ? (
        <p className="rounded-xl border border-dashed border-admin-border p-10 text-center text-sm text-slate-400">
          Choose a page or department above to manage its content.
        </p>
      ) : loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-admin-primary" /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">{targetLabel}</h2>
            <AddButtons />
          </div>

          {/* ADD FORMS */}
          {adding === "doc" && (
            <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
              <p className="text-sm font-semibold text-slate-700">New document</p>
              <TextField label="Title" value={docForm.title} onChange={(v) => setDocForm({ ...docForm, title: v })} required />
              <SelectField label="Category" value={docForm.category} onChange={(v) => setDocForm({ ...docForm, category: v as DownloadCategory })} options={CATEGORY_OPTIONS} />
              <MediaField label="File" url={docForm.fileUrl} mediaId={docForm.mediaId} onChange={(url, mediaId) => setDocForm({ ...docForm, fileUrl: url, mediaId })} accept={["DOCUMENT"]} required />
              <FormActions>
                <SecondaryButton onClick={() => setAdding(null)}>Cancel</SecondaryButton>
                <PrimaryButton onClick={saveDoc} disabled={saving || !docForm.title || !docForm.fileUrl}>{saving ? "Adding…" : "Add"}</PrimaryButton>
              </FormActions>
            </div>
          )}

          {(adding === "image" || adding === "video") && (
            <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="space-y-4 rounded-2xl border border-admin-border bg-white p-5">
              <p className="text-sm font-semibold text-slate-700">{adding === "video" ? "New video" : "New image"}</p>
              <TextField label="Caption / title" value={mediaForm.title} onChange={(v) => setMediaForm({ ...mediaForm, title: v })} />
              <MediaField
                label={adding === "video" ? "Video" : "Image"}
                url={mediaForm.url}
                mediaId={mediaForm.mediaId}
                onChange={(url, mediaId) => setMediaForm({ ...mediaForm, url, mediaId })}
                accept={adding === "video" ? ["VIDEO"] : ["IMAGE"]}
                required
              />
              <FormActions>
                <SecondaryButton onClick={() => setAdding(null)}>Cancel</SecondaryButton>
                <PrimaryButton onClick={() => saveMedia(adding)} disabled={saving || !mediaForm.url}>{saving ? "Adding…" : "Add"}</PrimaryButton>
              </FormActions>
            </div>
          )}

          {/* PAGE TEXT - the page's own wording. First, because it is the part
              of a page an editor most often comes here to change. Only shown
              for pages listed in the text registry; the rest of this screen
              still works for every page. */}
          {target.kind === "page" && PAGE_TEXT[target.section] && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <Type className="h-4 w-4" /> Page Text
              </h3>
              <PageTextEditor section={target.section} />
            </section>
          )}

          {/* TEXT TABLES - fee structures, intake tables, etc. Only for page
              targets: tables are keyed by pageSection, not by department. */}
          {target.kind === "page" && <PageTableEditor pageSection={target.section} />}

          {/* DOCUMENTS */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <FileText className="h-4 w-4" /> Documents ({docs.length})
            </h3>
            {docs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border p-5 text-center text-sm text-slate-400">No documents here yet.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl border border-admin-border bg-white px-3 py-3">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700">{d.title}</p>
                      <p className="truncate text-xs text-slate-500">{d.category}</p>
                    </div>
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-admin-primary hover:underline">Open</a>
                    <button type="button" onClick={() => removeDoc(d)} aria-label="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* IMAGES */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <ImageIcon className="h-4 w-4" /> Images ({images.length})
            </h3>
            {images.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border p-5 text-center text-sm text-slate-400">No images here yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((g) => (
                  <div key={g.id} className="overflow-hidden rounded-xl border border-admin-border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS image URL */}
                    <img src={g.imageUrl} alt={g.title} className="h-28 w-full object-cover" loading="lazy" />
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <p className="truncate text-xs font-medium text-slate-600">{g.title}</p>
                      <button type="button" onClick={() => removeGallery(g, "Image")} aria-label="Remove" className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* VIDEOS */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <VideoIcon className="h-4 w-4" /> Videos ({videos.length})
            </h3>
            {videos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border p-5 text-center text-sm text-slate-400">No videos here yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {videos.map((g) => (
                  <div key={g.id} className="overflow-hidden rounded-xl border border-admin-border bg-white">
                    <video src={g.imageUrl} controls preload="metadata" className="h-32 w-full bg-black object-cover" />
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <p className="truncate text-xs font-medium text-slate-600">{g.title}</p>
                      <button type="button" onClick={() => removeGallery(g, "Video")} aria-label="Remove" className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default function PageContentManager() {
  return (
    <PermissionGate permission="downloads.view">
      <PageContentInner />
    </PermissionGate>
  )
}
