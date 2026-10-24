"use client"

import { AlertTriangle, ExternalLink, MapPin } from "lucide-react"
import { describeDestination, destinationText, type UploadDraft } from "@/lib/upload-destinations"

/**
 * "Where this will appear" - shown on the upload forms, updating as the page,
 * heading and title are filled in, so staff know before publishing where a
 * document lands (and are warned when it would land nowhere visitors look).
 *
 * With several files it groups them: on the Examinations page two files in one
 * batch can go to different blocks because of their titles.
 */
export default function UploadDestinationHint({ drafts }: { drafts: UploadDraft[] }) {
  if (drafts.length === 0) return null
  const groups = new Map<string, { text: string; href: string | null; warning?: string; count: number }>()
  for (const d of drafts) {
    const dest = describeDestination(d)
    const text = destinationText(dest)
    const g = groups.get(text) ?? { text, href: dest.href, warning: dest.warning, count: 0 }
    g.count++
    groups.set(text, g)
  }
  const list = [...groups.values()]
  const several = drafts.length > 1

  return (
    <div className="space-y-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold text-sky-900">
        <MapPin className="h-4 w-4" /> Where {several ? "these will" : "this will"} appear on the website
      </p>
      {list.map((g) => (
        <div key={g.text} className="pl-5">
          <p className="flex flex-wrap items-center gap-x-2 text-sky-900">
            {several && list.length > 1 && (
              <span className="font-semibold">
                {g.count} file{g.count === 1 ? "" : "s"} →
              </span>
            )}
            <span>{g.text}</span>
            {g.href && (
              <a
                href={g.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-admin-primary hover:underline"
              >
                View page <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </p>
          {g.warning && (
            <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {g.warning}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
