"use client"

import { getFacultyPublic, Faculty } from "@/lib/faculty-api"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"
import CmsText from "@/components/CmsText"
import FacultyGrid from "@/components/faculty/FacultyGrid"

/**
 * The Central Library's staff, shown on the Library page.
 *
 * Same approach as the Examination Section: these are ordinary Faculty records
 * carrying department = "Central Library", so they inherit the Media Library
 * photo picker, the Move up/down ordering and the site-wide faculty-photos
 * switch for free. The Librarian is the record flagged isHod and gets the gold
 * treatment a department gives its HOD.
 *
 * Card styling mirrors ExamSectionStaff (and through it the department faculty
 * cards) so the page reads as part of the same site.
 */
const SECTION = "Central Library"

export default function LibraryStaff() {
  const staff = useLiveData<Faculty[]>(
    () => getFacultyPublic(SECTION).catch(() => [] as Faculty[]),
    [],
  )
  // One switch controls faculty photos across the whole site; honour it here so
  // this page never disagrees with the department pages.
  const settings = useLiveData<Record<string, string>>(() => getPublicSiteSettings(), [])
  const settingsLoaded = settings !== null
  const showPhotos = settings?.["faculty_show_photos"] === "true"

  if (!staff || staff.length === 0 || !settingsLoaded) return null

  return (
    <section style={{ width: "100%", background: "#ffffff", padding: "72px 0" }}>
      <style>{`
        .lst-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
        .lst-sub { color: #666; font-size: 15.5px; margin: 0 0 26px; }

        .lst-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .lst-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
        .lst-card.head { border: 2px solid #D4A500; box-shadow: 0 8px 32px rgba(255, 230, 25, 0.12); }
        .lst-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); }
        .lst-photo { position: relative; width: 100%; aspect-ratio: 3 / 3.5; overflow: hidden; background: linear-gradient(135deg, #2B3490, #1e2570); display: flex; align-items: center; justify-content: center; }
        .lst-photo img { width: 100%; height: 100%; object-fit: cover; }
        .lst-badge { position: absolute; top: 12px; left: 12px; background: #FFE619; color: #1a1a2e; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'Rajdhani', sans-serif; }
        .lst-initials { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; }
        .lst-initials p { color: #D4A500; font-size: 20px; font-weight: 700; font-family: 'Rajdhani', sans-serif; margin: 0; }
        .lst-info { padding: 18px 20px; }
        .lst-info h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .lst-desig { color: #2B3490; font-size: 13.5px; font-weight: 600; margin: 0; }
        .lst-meta { color: #777; font-size: 13px; margin: 6px 0 0; }

        /* Photos off - the compact list the department pages fall back to. */
        .lst-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
        .lst-row { background: #fff; border: 1px solid #eef0f3; border-left: 3px solid #2B3490; border-radius: 10px; padding: 13px 16px; }
        .lst-row.head { border-left-color: #D4A500; }
      `}</style>

      <div className="responsive-container">
        <h2 className="lst-title"><CmsText section="library" slot="staff.heading" /></h2>
        <p className="lst-sub"><CmsText section="library" slot="staff.lead" /></p>

        <FacultyGrid faculty={staff} showPhotos={showPhotos} headLabel="Librarian" />
      </div>
    </section>
  )
}
