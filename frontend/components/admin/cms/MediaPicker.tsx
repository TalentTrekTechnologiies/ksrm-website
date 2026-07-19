"use client"

import { useEffect, useRef, useState } from "react"
import { X, Upload, Loader2, Search, ImageIcon, FileText, Video, Check } from "lucide-react"
import {
  getMediaAdmin,
  getMediaById,
  uploadMedia,
  type Media,
  type MediaType,
} from "@/lib/media-api"
import { ApiError } from "@/lib/api-client"

const IMAGE_VARIANT_CHOICES = ["THUMBNAIL", "SMALL", "MEDIUM", "LARGE", "HERO", "ORIGINAL"] as const

function typeIcon(type: MediaType) {
  if (type === "IMAGE") return <ImageIcon className="h-5 w-5" />
  if (type === "VIDEO") return <Video className="h-5 w-5" />
  return <FileText className="h-5 w-5" />
}

function previewUrl(media: Media): string | null {
  const thumb = media.variants.find((v) => v.variant === "THUMBNAIL" && v.format === "WEBP")
  return thumb?.url ?? null
}

function variantUrl(media: Media, variant: string): string | null {
  const match =
    media.variants.find((v) => v.variant === variant && v.format === "WEBP") ??
    media.variants.find((v) => v.variant === variant)
  return match?.url ?? null
}

/**
 * The one shared "Choose From Media Library" / "Upload New" modal every
 * module's forms are meant to use instead of a bare URL text field, once
 * they integrate (no module calls this yet - it's built and exported
 * standalone this pass). Emits the selected media plus a resolved variant
 * URL; the caller decides what to do with it (store `mediaId`, store the
 * URL, both).
 */
export default function MediaPicker({
  open,
  onClose,
  onSelect,
  accept,
}: {
  open: boolean
  onClose: () => void
  onSelect: (media: Media, url: string) => void
  accept?: MediaType[]
}) {
  const [tab, setTab] = useState<"library" | "upload">("library")
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Media | null>(null)
  const [variant, setVariant] = useState<string>("MEDIUM")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setTab("library")
    setSelected(null)
    setSearch("")
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const timeout = setTimeout(refresh, 250)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const result = await getMediaAdmin({
        q: search || undefined,
        type: accept && accept.length === 1 ? accept[0] : undefined,
        pageSize: 60,
      })
      const filtered = accept ? result.items.filter((m) => accept.includes(m.type)) : result.items
      setItems(filtered)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load media")
    } finally {
      setLoading(false)
    }
  }

  function confirmSelection() {
    if (!selected) return
    const url =
      selected.type === "IMAGE" ? variantUrl(selected, variant) ?? variantUrl(selected, "ORIGINAL") : variantUrl(selected, "ORIGINAL")
    if (!url) return
    onSelect(selected, url)
    onClose()
  }

  async function handleUploadFile(file: File) {
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    try {
      const result = await uploadMedia(file, {}, setUploadProgress)
      // Variants are generated asynchronously by the backend's processing
      // queue - result.media.variants is empty right after upload (or on a
      // deduplicated re-upload, already complete). Poll briefly until
      // processing finishes so the URL handed back actually resolves,
      // instead of handing the caller an empty string.
      const finished = await waitForProcessing(result.media.id)
      const url = finished
        ? variantUrl(finished, "MEDIUM") ?? variantUrl(finished, "ORIGINAL")
        : variantUrl(result.media, "MEDIUM") ?? variantUrl(result.media, "ORIGINAL")
      if (!url) {
        setError("Upload finished processing but no usable file was produced.")
        return
      }
      onSelect(finished ?? result.media, url)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function waitForProcessing(mediaId: number, timeoutMs = 20000): Promise<Media | null> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const media = await getMediaById(mediaId).catch(() => null)
      if (media && (media.processingStatus === "COMPLETED" || media.processingStatus === "FAILED")) {
        return media
      }
      await new Promise((resolve) => setTimeout(resolve, 700))
    }
    return null
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-admin-border px-5 py-3.5">
          <div className="flex gap-1 rounded-lg bg-admin-bg p-1">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === "library" ? "bg-white text-admin-primary shadow-sm" : "text-slate-500"}`}
            >
              Choose From Library
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === "upload" ? "bg-white text-admin-primary shadow-sm" : "text-slate-500"}`}
            >
              Upload New
            </button>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-admin-bg">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && <p className="border-b border-red-100 bg-red-50 px-5 py-2 text-xs text-red-700">{error}</p>}

        {tab === "library" ? (
          <>
            <div className="border-b border-admin-border px-5 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media..."
                  className="w-full rounded-lg border border-admin-border py-2 pl-9 pr-3 text-sm focus:border-admin-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-admin-primary" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No media found.</p>
              ) : (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {items.map((item) => {
                    const thumb = previewUrl(item)
                    const isSelected = selected?.id === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelected(item)
                          setVariant("MEDIUM")
                        }}
                        className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border-2 bg-admin-bg ${
                          isSelected ? "border-admin-primary ring-2 ring-admin-primary/20" : "border-transparent"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute right-1 top-1 z-10 rounded-full bg-admin-primary p-0.5 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={item.title ?? item.originalFilename} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-slate-400">{typeIcon(item.type)}</span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
                          {item.title || item.originalFilename}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-admin-border px-5 py-3">
              {selected?.type === "IMAGE" ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Size:
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="rounded border border-admin-border px-1.5 py-1 text-xs"
                  >
                    {IMAGE_VARIANT_CHOICES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={confirmSelection}
                disabled={!selected}
                className="rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Use selected
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 p-8">
            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-admin-border py-16">
                <Loader2 className="h-8 w-8 animate-spin text-admin-primary" />
                <p className="text-sm font-semibold text-slate-600">
                  {uploadProgress < 100 ? `${uploadProgress}%` : "Processing..."}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleUploadFile(file)
                }}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-admin-border py-16 text-slate-400 hover:border-admin-primary hover:text-admin-primary"
              >
                <Upload className="h-8 w-8" />
                <p className="text-sm font-semibold">Drop a file here, or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadFile(file)
                  }}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
