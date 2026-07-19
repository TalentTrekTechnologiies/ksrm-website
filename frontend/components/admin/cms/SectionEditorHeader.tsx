import Link from "next/link"
import CmsStatusBadge from "./CmsStatusBadge"
import type { SectionStatus } from "@/lib/homepage-api"

/**
 * The "Homepage / Vision — Manage the Vision section..." page header every
 * section editor starts with, per the approved mockup - one component so
 * every editor's header is pixel-identical, not four hand-copied ones.
 */
export default function SectionEditorHeader({
  title,
  description,
  status,
}: {
  title: string
  description: string
  status?: SectionStatus
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        <Link href="/admin/homepage" className="hover:text-admin-primary hover:underline">
          Homepage
        </Link>{" "}
        / {title}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 style={{ fontFamily: "var(--font-admin-heading)" }} className="bg-gradient-to-r from-admin-primary via-admin-primary-light to-slate-700 bg-clip-text text-2xl font-bold text-transparent">
          {title}
        </h1>
        {status && <CmsStatusBadge status={status} />}
      </div>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}
