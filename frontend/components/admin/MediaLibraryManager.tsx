"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Upload,
  Loader2,
  AlertTriangle,
  X,
  Copy,
  ImageIcon,
  FileText,
  Video,
  History,
  RotateCcw,
  Crop as CropIcon,
  RefreshCw,
  FolderInput,
  Download,
  Check,
} from "lucide-react"
import PermissionGate from "@/components/admin/cms/PermissionGate"
import CmsToolbar from "@/components/admin/cms/CmsToolbar"
import CmsFolderTree from "@/components/admin/cms/CmsFolderTree"
import CmsLoadingState from "@/components/admin/cms/CmsLoadingState"
import { ApiError } from "@/lib/api-client"
import {
  getMediaAdmin,
  getMediaFolders,
  getMediaFacets,
  getMediaStats,
  getMediaUsages,
  getMediaVersions,
  uploadMedia,
  bulkUploadMedia,
  updateMedia,
  replaceMedia,
  cropMedia,
  deleteMedia,
  bulkDeleteMedia,
  restoreMedia,
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
  rollbackMediaVersion,
  type Media,
  type MediaFolder,
  type MediaUsage,
  type MediaVersion,
  type MediaStats,
  type MediaType,
} from "@/lib/media-api"
import { resolveUsageRoute } from "@/lib/media-usage-routes"
import { PAGE_SECTIONS, getDownloadsAdmin, createDownload, deleteDownload } from "@/lib/downloads-api"
import { getGalleryAdmin, createGalleryImage, deleteGalleryImage } from "@/lib/gallery-api"
import { formatBytes } from "@/lib/format-bytes"
import { useCmsConfirm } from "@/components/admin/cms/CmsConfirmProvider"
import { mediaFile as mediaFileUrl } from "@/lib/api-base"

const CROP_PRESETS = [
  { key: "HERO_BANNER", label: "Hero Banner" },
  { key: "SQUARE", label: "Square" },
  { key: "FACULTY_PORTRAIT", label: "Faculty Portrait" },
]

function typeIcon(type: MediaType) {
  if (type === "IMAGE") return <ImageIcon className="h-4 w-4" />
  if (type === "VIDEO") return <Video className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

function thumbUrl(media: Media): string | null {
  const t = media.variants.find((v) => v.variant === "THUMBNAIL" && v.format === "WEBP")
  return t?.url ?? null
}

function originalUrl(media: Media): string | null {
  const o = media.variants.find((v) => v.variant === "ORIGINAL" && v.format === "SOURCE")
  return o?.url ?? media.variants[0]?.url ?? null
}

// mediaFileUrl (a deterministic servable URL for a media id, safe even right
// after upload before variants exist) now comes from api-base - see the import
// at the top. It used to be reimplemented here byte-for-byte, carrying its own
// `|| "http://localhost:4000"`, so a production build with no
// NEXT_PUBLIC_API_URL wrote localhost URLs straight into the database.

// Publishes a media file to a page section: images -> that page's Gallery,
// documents -> that page's Downloads (under an optional group heading).
// Throws for videos (no page target).
async function publishMediaToPage(media: Media, section: string, groupLabel?: string): Promise<void> {
  const title = media.title || media.originalFilename
  const url = mediaFileUrl(media.id)
  if (media.type === "IMAGE") {
    await createGalleryImage({ title, imageUrl: url, mediaId: media.id, pageSection: section })
  } else if (media.type === "VIDEO") {
    // Videos ride the Gallery module too, tagged so PageResources renders a
    // <video> player. Keep this category string in sync with PageResources.
    await createGalleryImage({ title, imageUrl: url, mediaId: media.id, pageSection: section, category: "__video__" })
  } else {
    await createDownload({ title, category: "OTHER", fileUrl: url, mediaId: media.id, pageSection: section, groupLabel: groupLabel || null })
  }
}

function MediaLibraryManagerInner() {
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
  const [items, setItems] = useState<Media[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { confirm, notifySaved } = useCmsConfirm()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<MediaType | "">("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [facets, setFacets] = useState<{ categories: string[]; tags: string[] }>({ categories: [], tags: [] })
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  // "Show on page" chosen before uploading: uploaded files are auto-published
  // to this page section (image -> Gallery, document -> Downloads).
  const [uploadSection, setUploadSection] = useState("")
  // Optional grouping heading for uploaded documents (e.g. "AY 2025-26").
  const [uploadGroup, setUploadGroup] = useState("")
  const [detailItem, setDetailItem] = useState<Media | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ item: Media; usages: MediaUsage[] } | null>(null)
  const [moveTargetIds, setMoveTargetIds] = useState<number[] | null>(null)
  const pageSize = 24
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const result = await getMediaAdmin({
        q: search || undefined,
        type: typeFilter || undefined,
        category: categoryFilter || undefined,
        folderId: selectedFolderId ?? undefined,
        page,
        pageSize,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  async function refreshSidebar() {
    try {
      const [f, fc, s] = await Promise.all([getMediaFolders(), getMediaFacets(), getMediaStats()])
      setFolders(f)
      setFacets(fc)
      setStats(s)
    } catch {
      // Non-critical - the main grid still works without stats/facets.
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, categoryFilter, selectedFolderId, page])

  useEffect(() => {
    refreshSidebar()
  }, [])

  // Poll while any visible item is still processing, so newly-uploaded
  // rows flip from a spinner to real thumbnails without a manual refresh.
  useEffect(() => {
    const hasPending = items.some((i) => i.processingStatus === "PENDING" || i.processingStatus === "PROCESSING")
    if (!hasPending) return
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    try {
      let uploaded: Media[] = []
      if (fileArray.length === 1) {
        const res = await uploadMedia(fileArray[0], { folderId: selectedFolderId ?? undefined }, setUploadProgress)
        if (res.media) uploaded = [res.media]
      } else {
        const res = await bulkUploadMedia(fileArray, { folderId: selectedFolderId ?? undefined }, setUploadProgress)
        uploaded = res.results.filter((r) => r.success && r.media).map((r) => r.media as Media)
      }

      // Auto-publish to the chosen page section (image -> Gallery, doc -> Downloads).
      if (uploadSection) {
        let published = 0
        for (const m of uploaded) {
          try {
            await publishMediaToPage(m, uploadSection, uploadGroup)
            published++
          } catch {
            // one failure shouldn't abort the rest; surfaced below
          }
        }
        if (published < uploaded.length) {
          setError(`Uploaded, but couldn't publish ${uploaded.length - published} file(s) to the page.`)
        }
      }

      await refresh()
      await refreshSidebar()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function requestDelete(item: Media, force = false) {
    try {
      await deleteMedia(item.id, force)
      setConfirmDelete(null)
      await refresh()
      await refreshSidebar()
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        const usages = await getMediaUsages(item.id).catch(() => [])
        setConfirmDelete({ item, usages })
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to delete")
      }
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!(await confirm({ title: "Delete", message: `Delete ${selectedIds.size} item(s)? You can restore them afterwards.`, confirmLabel: "Delete", destructive: true }))) return
    const result = await bulkDeleteMedia([...selectedIds])
    const failed = result.results.filter((r) => !r.success).length
    if (failed > 0) setError(`${failed} of ${selectedIds.size} could not be deleted (still in use).`)
    setSelectedIds(new Set())
    await refresh()
    await refreshSidebar()
  }

  async function handleRestore(item: Media) {
    await restoreMedia(item.id)
    await refresh()
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function openDetails(item: Media) {
    setDetailItem(item)
  }

  async function handleMoveConfirm(targetFolderId: number | null) {
    if (!moveTargetIds) return
    setError(null)
    const results = await Promise.allSettled(
      moveTargetIds.map((id) => {
        const item = items.find((i) => i.id === id)
        if (!item) return Promise.resolve()
        return updateMedia(id, { folderId: targetFolderId, version: item.version })
      }),
    )
    const failed = results.filter((r) => r.status === "rejected").length
    if (failed > 0) setError(`${failed} of ${moveTargetIds.length} could not be moved.`)
    setMoveTargetIds(null)
    setSelectedIds(new Set())
    await refresh()
    await refreshSidebar()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="text-2xl font-bold text-slate-900">
            Media Library
          </h1>
          <p className="text-sm text-slate-500">
            Centralized upload/asset storage. No module builds its own upload system.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <label data-tour="media-show-on-page" className="flex items-center gap-2 rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-slate-600">
            <span className="whitespace-nowrap font-semibold text-slate-600">Show on page:</span>
            <select
              value={uploadSection}
              onChange={(e) => setUploadSection(e.target.value)}
              disabled={uploading}
              className="max-w-[240px] bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
              title="Files you upload will be published to this page (images → Gallery, documents → Downloads)."
            >
              <option value="">Don&apos;t show on a page (just store)</option>
              {PAGE_SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          {uploadSection && (
            <input
              type="text"
              value={uploadGroup}
              onChange={(e) => setUploadGroup(e.target.value)}
              disabled={uploading}
              placeholder="Group (e.g. AY 2025-26)"
              title="Optional heading documents are grouped under on the page (e.g. AY 2025-26, B.Tech)."
              className="max-w-[200px] rounded-lg border border-admin-border bg-white px-3 py-2 text-sm text-slate-700"
            />
          )}
          <button
            type="button"
            data-tour="media-upload"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? `Uploading ${uploadProgress}%` : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["IMAGE", "VIDEO", "DOCUMENT"] as MediaType[]).map((t) => (
            <div key={t} style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-xl border border-admin-border bg-white p-4">
              <div className="flex items-center gap-2 text-slate-400">{typeIcon(t)}<span className="text-xs font-semibold uppercase">{t}s</span></div>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.counts[t]}</p>
            </div>
          ))}
          <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-xl border border-admin-border bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Storage Used</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatBytes(stats.totalSizeBytes)}</p>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
        }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]"
      >
        <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="h-fit rounded-xl border border-admin-border bg-white p-3">
          <CmsFolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelect={(id) => {
              setSelectedFolderId(id)
              setPage(1)
            }}
            onCreateFolder={async (name, parentId) => {
              await createMediaFolder({ name, parentId: parentId ?? undefined })
              await refreshSidebar()
            }}
            onRenameFolder={async (id, name) => {
              await updateMediaFolder(id, { name })
              await refreshSidebar()
            }}
            onDeleteFolder={async (id) => {
              try {
                await deleteMediaFolder(id)
                await refreshSidebar()
              } catch (err) {
                setError(err instanceof ApiError ? err.message : "Failed to delete folder")
              }
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex overflow-hidden rounded-lg border border-admin-border w-fit">
            {([
              { key: "", label: "All" },
              { key: "IMAGE", label: "Images" },
              { key: "VIDEO", label: "Videos" },
              { key: "DOCUMENT", label: "Documents" },
            ] as { key: MediaType | ""; label: string }[]).map((tab) => (
              <button
                key={tab.key || "all"}
                type="button"
                onClick={() => {
                  setTypeFilter(tab.key)
                  setPage(1)
                }}
                className={`px-3.5 py-2 text-sm font-semibold ${
                  typeFilter === tab.key ? "bg-admin-primary text-white" : "bg-white text-slate-500 hover:bg-admin-bg"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <CmsToolbar
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            searchPlaceholder="Search media..."
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            bulkActions={[
              { label: "Move to...", onClick: () => setMoveTargetIds([...selectedIds]) },
              { label: "Delete", onClick: handleBulkDelete, danger: true },
            ]}
            filters={
              <div className="flex items-center gap-2">
                {facets.categories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setPage(1)
                    }}
                    className="rounded-lg border border-admin-border px-2.5 py-2 text-sm"
                  >
                    <option value="">All categories</option>
                    {facets.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
            }
          />

          {loading ? (
            <CmsLoadingState label="Loading media..." />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-admin-border bg-admin-bg py-16 text-center">
              <Upload className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No media yet</p>
              <p className="text-xs text-slate-400">Drag and drop files here, or use the Upload button.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => {
                const isSelected = selectedIds.has(item.id)
                const isDeleted = item.deletedAt !== null
                const isProcessing = item.processingStatus === "PENDING" || item.processingStatus === "PROCESSING"
                const thumb = thumbUrl(item)
                return (
                  <div
                    key={item.id}
                    style={{ boxShadow: "var(--shadow-admin-card)" }}
                    className={`relative flex flex-col overflow-hidden rounded-xl border bg-white ${
                      isSelected ? "border-admin-primary ring-2 ring-admin-primary/20" : "border-admin-border"
                    }`}
                  >
                    <label className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md bg-white/90 shadow">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="h-3.5 w-3.5"
                        aria-label="Select"
                      />
                    </label>
                    {isDeleted && (
                      <span className="absolute right-2 top-2 z-10 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 shadow">
                        Deleted
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => openDetails(item)}
                      className="flex aspect-square items-center justify-center bg-admin-bg"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
                      ) : thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={item.title ?? item.originalFilename} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-slate-300">{typeIcon(item.type)}</span>
                      )}
                    </button>

                    <div className="p-2">
                      <p className="truncate text-xs font-semibold text-slate-700">{item.title || item.originalFilename}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(item.sizeBytes)}</p>
                    </div>

                    <div className="flex items-center justify-end gap-1 border-t border-admin-border px-1.5 py-1">
                      {isDeleted ? (
                        <button type="button" onClick={() => handleRestore(item)} className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-600" aria-label="Restore">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <>
                          <button type="button" onClick={() => setMoveTargetIds([item.id])} className="rounded-lg p-1.5 text-slate-400 hover:text-admin-primary" aria-label="Move to folder">
                            <FolderInput className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => requestDelete(item)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-600" aria-label="Delete">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
                Previous
              </button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Cannot delete - file is in use</h3>
            <p className="mt-1 text-xs text-slate-500">
              &ldquo;{confirmDelete.item.title || confirmDelete.item.originalFilename}&rdquo; is referenced in {confirmDelete.usages.length} place(s):
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg bg-admin-bg p-2">
              {confirmDelete.usages.map((u, i) => (
                <li key={i} className="text-xs text-slate-600">
                  {u.module} #{u.recordId} ({u.field})
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => requestDelete(confirmDelete.item, true)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete anyway (Super Admin)
              </button>
            </div>
          </div>
        </div>
      )}

      {detailItem && (
        <MediaDetailsDrawer
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onChanged={async (updated) => {
            setDetailItem(updated)
            await refresh()
          }}
        />
      )}

      {moveTargetIds && (
        <MoveToFolderModal
          folders={folders}
          count={moveTargetIds.length}
          onClose={() => setMoveTargetIds(null)}
          onConfirm={handleMoveConfirm}
        />
      )}
    </div>
  )
}

function MoveToFolderModal({
  folders,
  count,
  onClose,
  onConfirm,
}: {
  folders: MediaFolder[]
  count: number
  onClose: () => void
  onConfirm: (targetFolderId: number | null) => void
}) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
        <h3 className="text-sm font-bold text-slate-900">
          Move {count} item{count === 1 ? "" : "s"} to folder
        </h3>
        <div className="mt-3 max-h-64 space-y-0.5 overflow-y-auto rounded-lg border border-admin-border p-2">
          <CmsFolderTree
            folders={folders}
            selectedFolderId={selected}
            onSelect={setSelected}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selected)}
            className="flex items-center gap-1.5 rounded-lg bg-admin-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Check className="h-3.5 w-3.5" /> Move here
          </button>
        </div>
      </div>
    </div>
  )
}

interface Publication {
  kind: "download" | "gallery"
  id: number
  pageSection: string
}

function sectionLabel(value: string): string {
  return PAGE_SECTIONS.find((s) => s.value === value)?.label ?? value
}

/**
 * "Show on page" control in the media detail drawer. Publishing a file to a
 * page section creates the appropriate consumer record (image -> Gallery,
 * document -> Downloads), both keyed by mediaId + pageSection, so the file
 * surfaces on that page's PageResources block. Auto-routes by file type.
 */
function PagePublishPanel({ item }: { item: Media }) {
  const [pubs, setPubs] = useState<Publication[] | null>(null)
  const [selected, setSelected] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const publishable = item.type === "IMAGE" || item.type === "DOCUMENT" || item.type === "VIDEO"
  const target = item.type === "DOCUMENT" ? "Downloads & Resources" : item.type === "VIDEO" ? "Videos" : "Gallery"

  async function load() {
    try {
      const [dls, gals] = await Promise.all([
        getDownloadsAdmin(false, undefined, item.id).catch(() => []),
        getGalleryAdmin(false, undefined, item.id).catch(() => []),
      ])
      const list: Publication[] = [
        ...dls.filter((d) => d.pageSection).map((d) => ({ kind: "download" as const, id: d.id, pageSection: d.pageSection as string })),
        ...gals.filter((g) => g.pageSection).map((g) => ({ kind: "gallery" as const, id: g.id, pageSection: g.pageSection as string })),
      ]
      setPubs(list)
    } catch {
      setPubs([])
    }
  }

  useEffect(() => {
    setPubs(null)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  async function publish() {
    if (!selected) return
    const url = originalUrl(item)
    if (!url) {
      setErr("This file is still processing — try again in a moment.")
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const title = item.title || item.originalFilename
      if (item.type === "IMAGE") {
        await createGalleryImage({ title, imageUrl: url, mediaId: item.id, pageSection: selected })
      } else if (item.type === "VIDEO") {
        await createGalleryImage({ title, imageUrl: url, mediaId: item.id, pageSection: selected, category: "__video__" })
      } else {
        await createDownload({ title, category: "OTHER", fileUrl: url, mediaId: item.id, pageSection: selected })
      }
      setSelected("")
      await load()
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to publish")
    } finally {
      setBusy(false)
    }
  }

  async function unpublish(pub: Publication) {
    setBusy(true)
    setErr(null)
    try {
      if (pub.kind === "download") await deleteDownload(pub.id)
      else await deleteGalleryImage(pub.id)
      await load()
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to remove")
    } finally {
      setBusy(false)
    }
  }

  const available = PAGE_SECTIONS.filter((s) => !pubs?.some((p) => p.pageSection === s.value))

  return (
    <div className="rounded-xl border border-admin-border bg-admin-bg/40 p-3.5">
      <p className="text-sm font-semibold text-slate-700">Show on page</p>
      <p className="mt-1 text-xs text-slate-500">
        {publishable ? `Publishing adds this file to a page's ${target} block.` : "Only images and documents can be published to a page."}
      </p>

      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}

      {pubs && pubs.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {pubs.map((p) => (
            <span key={`${p.kind}-${p.id}`} className="inline-flex items-center gap-1 rounded-full bg-admin-primary/10 px-2.5 py-1 text-xs font-medium text-admin-primary">
              {sectionLabel(p.pageSection)}
              <button type="button" disabled={busy} onClick={() => unpublish(p)} className="text-admin-primary/70 hover:text-admin-primary disabled:opacity-40" aria-label="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {publishable && (
        <div className="mt-2.5 flex items-center gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={busy}
            className="min-w-0 flex-1 rounded-lg border border-admin-border px-3 py-2 text-sm"
          >
            <option value="">Add to a page…</option>
            {available.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={publish}
            disabled={busy || !selected}
            className="shrink-0 rounded-lg bg-admin-primary px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? "…" : "Publish"}
          </button>
        </div>
      )}
    </div>
  )
}

function MediaDetailsDrawer({
  item,
  onClose,
  onChanged,
}: {
  item: Media
  onClose: () => void
  onChanged: (item: Media) => void
}) {
  // Its own hook call - this drawer is a sibling component, not nested inside
  // MediaLibraryManagerInner, so it can't reach that one's `confirm`.
  const { confirm, notifySaved } = useCmsConfirm()
  const [usages, setUsages] = useState<MediaUsage[]>([])
  const [versions, setVersions] = useState<MediaVersion[]>([])
  const [title, setTitle] = useState(item.title ?? "")
  const [altText, setAltText] = useState(item.altText ?? "")
  const [caption, setCaption] = useState(item.caption ?? "")
  const [description, setDescription] = useState(item.description ?? "")
  const [copyright, setCopyright] = useState(item.copyright ?? "")
  const [photographer, setPhotographer] = useState(item.photographer ?? "")
  const [keywords, setKeywords] = useState(item.tags.join(", "))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [cropPreset, setCropPreset] = useState(CROP_PRESETS[0].key)

  useEffect(() => {
    getMediaUsages(item.id).then(setUsages).catch(() => undefined)
    getMediaVersions(item.id).then(setVersions).catch(() => undefined)
  }, [item.id])

  async function handleSave() {
    if (!(await confirm({ title: "Save changes?", message: "Save your changes? They go live on the public site straight away.", confirmLabel: "Save" }))) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateMedia(item.id, {
        title,
        altText,
        caption,
        description,
        copyright,
        photographer,
        tags: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        version: item.version,
      })
      onChanged(updated)
      notifySaved("Your changes have been saved.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleReplace(file: File) {
    setSaving(true)
    setError(null)
    try {
      const updated = await replaceMedia(item.id, file)
      onChanged(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to replace")
    } finally {
      setSaving(false)
    }
  }

  async function handleCrop() {
    if (!item.width || !item.height) return
    setSaving(true)
    setError(null)
    try {
      const updated = await cropMedia(item.id, {
        cropPreset,
        x: 0,
        y: 0,
        width: item.width,
        height: item.height,
      })
      onChanged(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to crop")
    } finally {
      setSaving(false)
    }
  }

  async function handleRollback(versionId: number) {
    setSaving(true)
    setError(null)
    try {
      const updated = await rollbackMediaVersion(item.id, versionId)
      onChanged(updated)
      setVersions(await getMediaVersions(item.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to roll back")
    } finally {
      setSaving(false)
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-admin-border px-5 py-3.5">
          <h3 className="text-sm font-bold text-slate-900">File Details</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-admin-bg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          {(() => {
            const preview = originalUrl(item)
            return preview && item.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={item.title ?? item.originalFilename} className="w-full rounded-lg border border-admin-border" />
            ) : null
          })()}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Metadata</p>
            <label className="block text-xs font-semibold text-slate-500">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-500">Alt Text</label>
            <input value={altText} onChange={(e) => setAltText(e.target.value)} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-500">Caption</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-500">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-500">Copyright</label>
            <input value={copyright} onChange={(e) => setCopyright(e.target.value)} placeholder="© 2026 KSRM College of Engineering" className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-500">Photographer</label>
            <input value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-500">Keywords (comma-separated)</label>
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="campus, hero, engineering" className="w-full rounded-lg border border-admin-border px-3 py-2 text-sm" />
            <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-admin-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
              Save
            </button>
          </div>

          <PagePublishPanel item={item} />

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Variants</p>
            <ul className="space-y-1">
              {item.variants.map((v, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-admin-bg px-2.5 py-1.5 text-xs">
                  <span>{v.variant} · {v.format}{v.width ? ` · ${v.width}x${v.height}` : ""}</span>
                  <span className="flex items-center gap-2">
                    <button type="button" onClick={() => copyUrl(v.url)} className="flex items-center gap-1 font-semibold text-admin-primary">
                      <Copy className="h-3 w-3" /> {copiedUrl === v.url ? "Copied" : "Copy URL"}
                    </button>
                    <a
                      href={v.url}
                      download={`${item.title || item.originalFilename}-${v.variant.toLowerCase()}`}
                      className="flex items-center gap-1 font-semibold text-slate-500 hover:text-admin-primary"
                    >
                      <Download className="h-3 w-3" />
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {item.type === "IMAGE" && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><CropIcon className="h-3.5 w-3.5" /> Crop</p>
              <div className="flex items-center gap-2">
                <select value={cropPreset} onChange={(e) => setCropPreset(e.target.value)} className="flex-1 rounded-lg border border-admin-border px-2 py-1.5 text-xs">
                  {CROP_PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
                <button type="button" onClick={handleCrop} disabled={saving} className="rounded-lg border border-admin-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
                  Apply
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><RefreshCw className="h-3.5 w-3.5" /> Replace file</p>
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              disabled={saving}
              className="w-full rounded-lg border border-dashed border-admin-border px-3 py-2 text-xs font-semibold text-slate-500 hover:border-admin-primary hover:text-admin-primary"
            >
              Choose new file
            </button>
            <input ref={replaceInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplace(e.target.files[0])} />
          </div>

          {versions.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><History className="h-3.5 w-3.5" /> Version history</p>
              <ul className="space-y-1">
                {versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-2.5 py-1.5 text-xs">
                    <span>v{v.versionNumber} · {new Date(v.createdAt).toLocaleString()}</span>
                    <button type="button" onClick={() => handleRollback(v.id)} disabled={saving} className="font-semibold text-admin-primary disabled:opacity-50">
                      Roll back
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Used In</p>
            {usages.length === 0 ? (
              <p className="text-xs text-slate-400">Not referenced anywhere yet.</p>
            ) : (
              <ul className="space-y-1">
                {usages.map((u) => {
                  const route = resolveUsageRoute(u.module, u.recordId)
                  return (
                    <li key={u.id} className="flex items-center justify-between rounded-lg bg-admin-bg px-2.5 py-1.5 text-xs">
                      <span>&#10003; {u.module} #{u.recordId}</span>
                      {route && (
                        <a href={route} className="font-semibold text-admin-primary hover:underline">
                          Open
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MediaLibraryManager() {
  return (
    <PermissionGate permission="media.view">
      <MediaLibraryManagerInner />
    </PermissionGate>
  )
}
