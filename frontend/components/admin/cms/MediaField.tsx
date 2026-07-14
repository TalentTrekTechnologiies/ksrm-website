"use client"

import { useState } from "react"
import { FolderOpen, ImageIcon, FileText, Video as VideoIcon } from "lucide-react"
import MediaPicker from "./MediaPicker"
import { TextField } from "./CmsForm"
import type { Media, MediaType } from "@/lib/media-api"

function typeIcon(accept?: MediaType[]) {
  if (accept?.length === 1 && accept[0] === "VIDEO") return VideoIcon
  if (accept?.length === 1 && accept[0] === "DOCUMENT") return FileText
  return ImageIcon
}

/**
 * The reusable "Choose from Media Library / Upload New" field every
 * module's editor form uses instead of a bare URL text box - extracted
 * from the ad-hoc block `HeroEditor.tsx` first built inline, so Gallery,
 * News, Events, Faculty, Departments, Placements, Committees, Downloads,
 * Site Settings, Research, Admissions, Testimonials, Recruiters, and
 * Campus Videos all render and behave identically.
 *
 * Manages its own picker-open state; the caller only tracks the resulting
 * `url` (persisted into whatever legacy string column the module still
 * has) and `mediaId` (persisted into the new nullable reference column).
 * A "paste a URL directly" fallback stays available under a
 * `<details>` disclosure for the legacy manual-entry path - picking a URL
 * there clears mediaId, matching the unlink contract every backend
 * service's DTO already implements (`mediaId: null` on save).
 */
export default function MediaField({
  label,
  url,
  mediaId,
  onChange,
  accept,
  required,
  urlPlaceholder,
}: {
  label: string
  url: string
  mediaId: number | null
  onChange: (url: string, mediaId: number | null) => void
  accept?: MediaType[]
  required?: boolean
  urlPlaceholder?: string
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const Icon = typeIcon(accept)
  const isImage = url && (!accept || accept.includes("IMAGE"))

  function handleSelect(media: Media, pickedUrl: string) {
    onChange(pickedUrl, media.id)
    setPickerOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="flex items-center gap-3 rounded-lg border border-admin-border bg-admin-bg p-3">
        <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white text-slate-400">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <p className="min-w-0 flex-1 truncate text-xs text-slate-600">{url || "No file set"}</p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-admin-primary hover:bg-admin-primary/5"
        >
          <FolderOpen className="h-3.5 w-3.5" /> Choose from Media Library
        </button>
      </div>
      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer select-none font-medium">Or paste a URL directly (legacy)</summary>
        <div className="mt-2">
          <TextField
            label={label}
            value={url}
            onChange={(v) => onChange(v, null)}
            placeholder={urlPlaceholder}
          />
        </div>
      </details>

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} accept={accept} onSelect={handleSelect} />
    </div>
  )
}
