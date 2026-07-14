"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"
import MediaPicker from "./MediaPicker"
import { TextField } from "./CmsForm"
import type { Media } from "@/lib/media-api"

export interface CmsImageValue {
  url: string
  alt: string
  caption?: string
}

/**
 * Current image preview + Replace/URL + Alt Text + Caption - the structured
 * image editor requested for About (and reusable anywhere else an image is
 * content, not just a bare URL textbox).
 */
export default function CmsImageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: CmsImageValue
  onChange: (value: CmsImageValue) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleSelect(_media: Media, url: string) {
    onChange({ ...value, url })
    setPickerOpen(false)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>

      <div className="flex items-center gap-4 rounded-lg border border-admin-border bg-admin-bg p-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-admin-border bg-white">
          {value.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value.url}
              alt={value.alt}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <ImageOff className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-600">{value.url || "No image selected"}</p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-2 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-admin-primary hover:bg-admin-primary/5"
          >
            Choose from Media Library
          </button>
          <details className="mt-2 text-xs text-slate-500">
            <summary className="cursor-pointer select-none font-medium">Or paste a URL directly (legacy)</summary>
            <div className="mt-2">
              <TextField
                label="Image path or URL"
                value={value.url}
                onChange={(url) => onChange({ ...value, url })}
                required
              />
            </div>
          </details>
        </div>
      </div>

      <TextField
        label="Alt text"
        value={value.alt}
        onChange={(alt) => onChange({ ...value, alt })}
        required
        helperText="Describes the image for screen readers and SEO."
      />
      <TextField
        label="Caption"
        value={value.caption ?? ""}
        onChange={(caption) => onChange({ ...value, caption })}
      />
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} accept={["IMAGE"]} onSelect={handleSelect} />
    </div>
  )
}
