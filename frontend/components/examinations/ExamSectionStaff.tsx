"use client"

import { getFacultyPublic, Faculty } from "@/lib/faculty-api"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"
import FacultyGrid from "@/components/faculty/FacultyGrid"

/**
 * The Examination Section's staff, shown at the top of the Examinations page.
 *
 * These are ordinary Faculty records carrying department = "Examination
 * Section", so they inherit everything that module already has: photos from the
 * Media Library, the Move up/down ordering, and the site-wide faculty-photos
 * switch. The Controller of Examinations is the record flagged isHod and gets
 * the same gold-bordered treatment a department gives its HOD.
 *
 * The card styling deliberately mirrors DepartmentPage's faculty cards - same
 * grid, photo ratio, initials fallback and info block - so the section reads as
 * part of the same site rather than a one-off.
 */
const SECTION = "Examination Section"

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Sri\.|Smt\.|Mr\.|Ms\.|Prof\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export default function ExamSectionStaff() {
  const staff = useLiveData<Faculty[]>(
    () => getFacultyPublic(SECTION).catch(() => [] as Faculty[]),
    [],
  )
  // One switch controls faculty photos across the whole site; honour it here so
  // this page never disagrees with the department pages.
  const settings = useLiveData<Record<string, string>>(() => getPublicSiteSettings(), [], { initialValue: {} })
  const showPhotos = (settings?.["faculty_show_photos"] ?? "true") !== "false"

  if (!staff || staff.length === 0) return null

  return (
    <section style={{ width: "100%", background: "#ffffff", padding: "56px 0" }}>
      <style>{`
        .ess-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .ess-container { padding: 0 20px; } }
        .ess-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; color: #2B3490; margin: 0 0 6px; }
        .ess-sub { color: #666; font-size: 15.5px; margin: 0 0 26px; }

        /* Mirrors .dept-faculty-* on the department pages. */
        .ess-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .ess-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
        .ess-card.coe { border: 2px solid #D4A500; box-shadow: 0 8px 32px rgba(255, 230, 25, 0.12); }
        .ess-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); }
        .ess-photo { position: relative; width: 100%; aspect-ratio: 3 / 3.5; border-radius: 12px 12px 0 0; overflow: hidden; background: linear-gradient(135deg, #2B3490, #1e2570); display: flex; align-items: center; justify-content: center; }
        .ess-photo img { width: 100%; height: 100%; object-fit: cover; }
        .ess-badge { position: absolute; top: 12px; left: 12px; background: #FFE619; color: #1a1a2e; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'Rajdhani', sans-serif; }
        .ess-initials { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; }
        .ess-initials p { color: #D4A500; font-size: 20px; font-weight: 700; font-family: 'Rajdhani', sans-serif; margin: 0; }
        .ess-info { padding: 20px; }
        .ess-info h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .ess-desig { color: #2B3490; font-size: 13.5px; font-weight: 600; margin: 0; }
        .ess-email { color: #777; font-size: 13px; margin: 6px 0 0; word-break: break-word; }

        /* Photos off - the same compact list the department pages fall back to. */
        .ess-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
        .ess-row { background: #fff; border: 1px solid #eef0f3; border-left: 3px solid #2B3490; border-radius: 10px; padding: 13px 16px; }
        .ess-row.coe { border-left-color: #D4A500; }
      `}</style>

      <div className="ess-container">
        <h2 className="ess-title">Examination Section</h2>
        <p className="ess-sub">Controller of Examinations and the examination office team.</p>

        <FacultyGrid faculty={staff} showPhotos={showPhotos} headLabel="Controller of Examinations" />
      </div>
    </section>
  )
}
