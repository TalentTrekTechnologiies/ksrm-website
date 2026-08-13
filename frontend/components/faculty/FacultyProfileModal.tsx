"use client"

import { useEffect, useState } from "react"
import { Faculty } from "@/lib/faculty-api"
import {
  ACHIEVEMENT_TYPES,
  FacultyAchievement,
  FacultyAchievementType,
  getFacultyAchievementsPublic,
} from "@/lib/faculty-achievements-api"
import { getResearchPublic, ResearchRecord } from "@/lib/research-api"
import { resolveFileUrl } from "@/lib/api-base"

/**
 * The full profile behind a faculty card's "View Profile".
 *
 * The card itself carries only a name and designation - enough to find
 * someone. Everything else lives here, which is what lets the grid be compact
 * without losing information.
 *
 * Achievements load when the modal opens rather than with the faculty list: a
 * department of forty staff would otherwise fetch every publication of every
 * member to render a grid that shows none of them.
 */

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Sri\.|Smt\.|Mr\.|Ms\.|Prof\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function year(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear())
}

function fullDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export default function FacultyProfileModal({
  faculty,
  showPhoto,
  onClose,
}: {
  faculty: Faculty
  showPhoto: boolean
  onClose: () => void
}) {
  // id 0 means this record is static page data, not a CMS row, so there is
  // nothing to look up - start resolved-and-empty rather than fetching.
  const [achievements, setAchievements] = useState<FacultyAchievement[] | null>(
    faculty.id ? null : [],
  )
  const [research, setResearch] = useState<ResearchRecord[]>([])

  useEffect(() => {
    if (!faculty.id) return
    let cancelled = false
    // Two separate stores hold a person's work, and both are edited from the
    // same faculty form: FacultyAchievement (the "Profile Records" editor) and
    // Research (the "Department Research Output" editor, which also feeds the
    // Research page). A patent entered in either one is a patent, so this
    // reads both rather than leaving whichever the admin happened to pick
    // invisible here. Failure of one must not hide the other, hence allSettled.
    Promise.allSettled([
      getFacultyAchievementsPublic(faculty.id),
      getResearchPublic(undefined, faculty.id),
    ]).then(([a, r]) => {
      if (cancelled) return
      setAchievements(a.status === "fulfilled" ? a.value : [])
      setResearch(r.status === "fulfilled" ? r.value : [])
    })
    return () => {
      cancelled = true
    }
  }, [faculty.id])

  // Escape closes, and the page behind must not scroll while this is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  // A Research row's `type` is free text ("Publication" / "Patent" / "Project")
  // rather than the achievement enum, so map it onto the same headings and
  // present both stores as one list. Anything unrecognised lands under
  // Publications rather than being dropped.
  const researchAsAchievements: FacultyAchievement[] = research
    .filter((r) => r.isActive !== false)
    .map((r) => {
      const t = (r.type || "").toUpperCase()
      const type: FacultyAchievementType =
        t === "PATENT" ? "PATENT" : t === "BOOK" ? "BOOK" : "PUBLICATION"
      return {
        id: -r.id, // negative so it cannot collide with a FacultyAchievement id
        facultyId: r.facultyId ?? faculty.id,
        type,
        title: r.title,
        detail: r.journal || null,
        referenceNo: null,
        date: r.year ? `${r.year}-01-01T00:00:00.000Z` : null,
        status: null,
        url: r.doiOrLink || r.attachmentUrl || null,
        sortOrder: 0,
        isActive: true,
        deletedAt: null,
        deletedBy: null,
        version: 1,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }
    })

  const allRecords = [...(achievements ?? []), ...researchAsAchievements]

  const grouped = ACHIEVEMENT_TYPES
    // DETAIL rows belong with Experience and Phone below, not as an
    // achievement list of their own.
    .filter((t) => t.value !== "DETAIL")
    .map((t) => ({
      ...t,
      items: allRecords.filter((a) => a.type === t.value),
    }))
    .filter((g) => g.items.length > 0)

  const details: { label: string; value: string | null }[] = [
    { label: "Designation", value: faculty.designation },
    { label: "Qualification", value: faculty.qualification },
    { label: "Department", value: faculty.department },
    { label: "Specialisation", value: faculty.specialization },
    { label: "Experience", value: faculty.experience },
    { label: "Email", value: faculty.email },
    { label: "Phone", value: faculty.phone },
    // Anything the fixed columns do not cover, added from the CMS as an
    // "Extra Detail" and appearing here in the order it was entered.
    ...(achievements ?? [])
      .filter((a) => a.type === "DETAIL")
      .map((a) => ({ label: a.title, value: a.detail })),
  ].filter((d) => d.value)

  return (
    <div className="fp-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={faculty.name}>
      <style>{`
        .fp-overlay { position: fixed; inset: 0; background: rgba(12,16,40,.72); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .fp-modal { background: #fff; border-radius: 14px; width: 100%; max-width: 860px; max-height: 88vh; overflow: auto; position: relative; }
        .fp-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,.95); font-size: 20px; line-height: 1; cursor: pointer; z-index: 3; box-shadow: 0 2px 10px rgba(0,0,0,.22); }

        .fp-head { display: grid; grid-template-columns: 150px 1fr; gap: 24px; padding: 28px; border-bottom: 1px solid #eef0f3; align-items: start; }
        .fp-photo { width: 150px; aspect-ratio: 3 / 3.4; border-radius: 12px; overflow: hidden; background: linear-gradient(135deg,#2B3490,#1e2570); display: flex; align-items: center; justify-content: center; }
        .fp-photo img { width: 100%; height: 100%; object-fit: cover; }
        .fp-initials { color: #D4A500; font-family: 'Rajdhani', sans-serif; font-size: 30px; font-weight: 700; }
        .fp-name { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .fp-desig { color: #2B3490; font-size: 15px; font-weight: 600; margin: 4px 0 0; }
        .fp-hod { display: inline-block; background: #FFE619; color: #1a1a2e; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 20px; margin-top: 8px; }
        .fp-dl { display: grid; grid-template-columns: 130px 1fr; gap: 0; margin: 16px 0 0; }
        .fp-dl dt { font-size: 13px; font-weight: 700; color: #2B3490; padding: 7px 0; border-top: 1px solid #f1f3f6; }
        .fp-dl dd { font-size: 14px; color: #444; margin: 0; padding: 7px 0; border-top: 1px solid #f1f3f6; word-break: break-word; }

        .fp-body { padding: 24px 28px 30px; }
        .fp-group { margin-bottom: 26px; }
        .fp-group h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
        .fp-count { background: #eef1ff; color: #2B3490; font-size: 12px; font-weight: 700; padding: 2px 9px; border-radius: 20px; }
        .fp-item { border-left: 3px solid #2B3490; background: #fafbfc; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 9px; }
        .fp-item.patent { border-left-color: #D4A500; }
        .fp-item-title { font-size: 14.5px; font-weight: 600; color: #1a1a2e; margin: 0; line-height: 1.45; }
        .fp-item-meta { color: #666; font-size: 13px; margin: 5px 0 0; line-height: 1.5; }
        .fp-item-meta a { color: #2B3490; }
        .fp-chip { display: inline-block; background: #fff; border: 1px solid #e3e6ec; color: #555; font-size: 11.5px; padding: 2px 8px; border-radius: 5px; margin-right: 6px; }
        .fp-empty { color: #888; font-size: 14px; }
        .fp-item.id { border-left-color: #6b7280; }
        .fp-id-value { color: #2B3490; font-weight: 700; margin-left: 8px; }

        @media (max-width: 640px) {
          .fp-head { grid-template-columns: 1fr; gap: 16px; padding: 22px; }
          .fp-photo { width: 120px; }
          .fp-dl { grid-template-columns: 1fr; }
          .fp-dl dd { padding-top: 0; border-top: none; }
          .fp-body { padding: 20px; }
        }
      `}</style>

      <div className="fp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="fp-close" onClick={onClose} aria-label="Close">×</button>

        <div className="fp-head">
          <div className="fp-photo">
            {showPhoto && faculty.photoUrl ? (
              // Media Library photos are stored as "/api/media/..." and need
              // resolving against the API base - see the note in FacultyGrid.
              // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
              <img src={resolveFileUrl(faculty.photoUrl)} alt={faculty.name} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none" }} />
            ) : (
              <span className="fp-initials">{initials(faculty.name)}</span>
            )}
          </div>
          <div>
            <h2 className="fp-name">{faculty.name}</h2>
            <p className="fp-desig">{faculty.designation}</p>
            {faculty.isHod && <span className="fp-hod">Head of Department</span>}
            <dl className="fp-dl">
              {details.map((d) => (
                <div key={d.label} style={{ display: "contents" }}>
                  <dt>{d.label}</dt>
                  <dd>
                    {d.label === "Email" ? <a href={`mailto:${d.value}`} style={{ color: "#2B3490" }}>{d.value}</a> : d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Hidden entirely when there is nothing to show, rather than
            announcing an absence - a profile with no publications should just
            end after the details. */}
        <div className="fp-body" style={grouped.length === 0 && achievements !== null ? { display: "none" } : undefined}>
          {achievements === null ? (
            <p className="fp-empty">Loading…</p>
          ) : (
            grouped.map((g) => (
              <div className="fp-group" key={g.value}>
                <h3>
                  {g.plural} <span className="fp-count">{g.items.length}</span>
                </h3>
                {g.items.map((a) =>
                  a.type === "PROFILE_ID" ? (
                    <div className="fp-item id" key={a.id}>
                      <p className="fp-item-title">
                        {a.title}
                        {a.detail && <span className="fp-id-value">{a.detail}</span>}
                      </p>
                      {a.url && (
                        <p className="fp-item-meta">
                          <a href={a.url} target="_blank" rel="noopener noreferrer">Open profile →</a>
                        </p>
                      )}
                    </div>
                  ) : (
                  <div className={`fp-item${a.type === "PATENT" ? " patent" : ""}`} key={a.id}>
                    <p className="fp-item-title">{a.title}</p>
                    <p className="fp-item-meta">
                      {/* A patent's date is its date of issue, so label it. */}
                      {a.date && (
                        <span className="fp-chip">
                          {a.type === "PATENT" ? `Issued ${fullDate(a.date)}` : year(a.date)}
                        </span>
                      )}
                      {a.status && <span className="fp-chip">{a.status}</span>}
                      {a.referenceNo && <span className="fp-chip">{a.referenceNo}</span>}
                      {a.detail && <span>{a.detail}</span>}
                      {a.url && (
                        <>
                          {" "}
                          <a href={a.url} target="_blank" rel="noopener noreferrer">View →</a>
                        </>
                      )}
                    </p>
                  </div>
                  ),
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
