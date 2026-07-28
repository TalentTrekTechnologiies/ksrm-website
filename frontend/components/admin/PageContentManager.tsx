"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Trash2, FileText, Image as ImageIcon } from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import MediaField from "@/components/admin/cms/MediaField"
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
  PAGE_SECTIONS,
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

/**
 * "Pick a page → manage everything on it." One screen that gathers the
 * documents and images routed to a chosen public page (IQAC, NAAC, ...) so an
 * admin can add and delete a page's content in one place, instead of hunting
 * through the separate Documents and Gallery/Media managers. It's a focused
 * view over the same records those managers own - nothing new server-side.
 */

const CATEGORY_OPTIONS = [
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "QUESTION_PAPER", label: "Question Papers" },
  { value: "BROCHURE", label: "Brochures" },
  { value: "AFFIDAVIT", label: "Affidavits" },
  { value: "FORM", label: "Forms" },
  { value: "OTHER", label: "Other" },
]

// Videos ride the gallery table under this category; excluded from the photo
// grid here (they're managed with the Media Library's video tools).
const VIDEO_CATEGORY = "__video__"

const PAGE_OPTIONS = [{ value: "", label: "Select a page…" }, ...PAGE_SECTIONS]

function PageContentInner() {
  const { confirm, notifySaved } = useCmsConfirm()
  const [page, setPage] = useState("")
  const [docs, setDocs] = useState<Download[]>([])
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [addingDoc, setAddingDoc] = useState(false)
  const [docForm, setDocForm] = useState({ title: "", category: "OTHER" as DownloadCategory, fileUrl: "", mediaId: null as number | null })
  const [addingImage, setAddingImage] = useState(false)
  const [imgForm, setImgForm] = useState({ title: "", imageUrl: "", mediaId: null as number | null })

  async function load(section: string) {
    if (!section) {
      setDocs([])
      setImages([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [allDocs, allImages] = await Promise.all([getDownloadsAdmin(false), getGalleryAdmin(false)])
      setDocs(allDocs.filter((d) => d.pageSection === section))
      setImages(allImages.filter((g) => g.pageSection === section && g.category !== VIDEO_CATEGORY))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load this page's content")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page)
    setAddingDoc(false)
    setAddingImage(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function saveDoc() {
    if (!docForm.title || !docForm.fileUrl) return
    if (!(await confirm({ title: "Add document", message: "Add this document to the page? It goes live straight away.", confirmLabel: "Add" }))) return
    setSaving(true)
    setError(null)
    try {
      await createDownload({ title: docForm.title, category: docForm.category, fileUrl: docForm.fileUrl, mediaId: docForm.mediaId, pageSection: page, isActive: true })
      setAddingDoc(false)
      setDocForm({ title: "", category: "OTHER", fileUrl: "", mediaId: null })
      await load(page)
      notifySaved("Document added to the page.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add the document")
    } finally {
      setSaving(false)
    }
  }

  async function removeDoc(d: Download) {
    if (!(await confirm({ title: "Delete", message: `Delete "${d.title}" from this page? You can restore it from the Documents manager.`, confirmLabel: "Delete", destructive: true }))) return
    try {
      await deleteDownload(d.id)
      await load(page)
      notifySaved("Document deleted.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete")
    }
  }

  async function saveImage() {
    if (!imgForm.imageUrl) return
    if (!(await confirm({ title: "Add image", message: "Add this image to the page's gallery?", confirmLabel: "Add" }))) return
    setSaving(true)
    setError(null)
    try {
      await createGalleryImage({ title: imgForm.title || "Image", imageUrl: imgForm.imageUrl, mediaId: imgForm.mediaId, pageSection: page, isActive: true })
      setAddingImage(false)
      setImgForm({ title: "", imageUrl: "", mediaId: null })
      await load(page)
      notifySaved("Image added to the page.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add the image")
    } finally {
      setSaving(false)
    }
  }

  async function removeImage(g: GalleryImage) {
    if (!(await confirm({ title: "Remove", message: `Remove "${g.title}" from this page?`, confirmLabel: "Remove", destructive: true }))) return
    try {
      await deleteGalleryImage(g.id)
      await load(page)
      notifySaved("Image removed.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove")
    }
  }

  const pageLabel = PAGE_SECTIONS.find((s) => s.value === page)?.label ?? ""

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          Page Content
        </h1>
        <p className="text-sm text-slate-500">Pick a page, then add or delete all of its documents and images in one place.</p>
      </div>

      <div className="max-w-md">
        <SelectField label="Which page?" value={page} onChange={setPage} options={PAGE_OPTIONS} />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>
      )}

      {!page ? (
        <p className="rounded-xl border border-dashed border-admin-border p-10 text-center text-sm text-slate-400">
          Choose a page above to manage its content.
        </p>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* DOCUMENTS */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText className="h-5 w-5 text-admin-primary" /> Documents on {pageLabel}
              </h2>
              {!addingDoc && (
                <button type="button" onClick={() => setAddingDoc(true)} className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
                  <Plus className="h-4 w-4" /> Add document
                </button>
              )}
            </div>

            {addingDoc && (
              <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="mb-3 space-y-4 rounded-2xl border border-admin-border bg-white p-5">
                <TextField label="Title" value={docForm.title} onChange={(v) => setDocForm({ ...docForm, title: v })} required />
                <SelectField label="Category" value={docForm.category} onChange={(v) => setDocForm({ ...docForm, category: v as DownloadCategory })} options={CATEGORY_OPTIONS} />
                <MediaField label="File (PDF / document)" url={docForm.fileUrl} mediaId={docForm.mediaId} onChange={(url, mediaId) => setDocForm({ ...docForm, fileUrl: url, mediaId })} accept={["DOCUMENT"]} required />
                <FormActions>
                  <SecondaryButton onClick={() => setAddingDoc(false)}>Cancel</SecondaryButton>
                  <PrimaryButton onClick={saveDoc} disabled={saving || !docForm.title || !docForm.fileUrl}>{saving ? "Adding…" : "Add"}</PrimaryButton>
                </FormActions>
              </div>
            )}

            {docs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">No documents on this page yet.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-xl border border-admin-border bg-white px-3 py-3">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700">{d.title}</p>
                      <p className="truncate text-xs text-slate-500">{d.category}{!d.isActive && <span className="ml-2 font-semibold text-amber-600">Inactive</span>}</p>
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ImageIcon className="h-5 w-5 text-admin-primary" /> Images on {pageLabel}
              </h2>
              {!addingImage && (
                <button type="button" onClick={() => setAddingImage(true)} className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark">
                  <Plus className="h-4 w-4" /> Add image
                </button>
              )}
            </div>

            {addingImage && (
              <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="mb-3 space-y-4 rounded-2xl border border-admin-border bg-white p-5">
                <TextField label="Caption / title" value={imgForm.title} onChange={(v) => setImgForm({ ...imgForm, title: v })} />
                <MediaField label="Image" url={imgForm.imageUrl} mediaId={imgForm.mediaId} onChange={(url, mediaId) => setImgForm({ ...imgForm, imageUrl: url, mediaId })} accept={["IMAGE"]} required />
                <FormActions>
                  <SecondaryButton onClick={() => setAddingImage(false)}>Cancel</SecondaryButton>
                  <PrimaryButton onClick={saveImage} disabled={saving || !imgForm.imageUrl}>{saving ? "Adding…" : "Add"}</PrimaryButton>
                </FormActions>
              </div>
            )}

            {images.length === 0 ? (
              <p className="rounded-xl border border-dashed border-admin-border p-6 text-center text-sm text-slate-400">No images on this page yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((g) => (
                  <div key={g.id} className="group relative overflow-hidden rounded-xl border border-admin-border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CMS image URL */}
                    <img src={g.imageUrl} alt={g.title} className="h-32 w-full object-cover" loading="lazy" />
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <p className="truncate text-xs font-medium text-slate-600">{g.title}</p>
                      <button type="button" onClick={() => removeImage(g)} aria-label="Remove" className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
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
