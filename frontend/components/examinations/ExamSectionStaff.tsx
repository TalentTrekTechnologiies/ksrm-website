"use client"

import { getFacultyPublic, Faculty } from "@/lib/faculty-api"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"
import FacultyGrid from "@/components/faculty/FacultyGrid"
import { resolveFileUrl } from "@/lib/api-base"

/** "Dr. M.V. Ravi Kishore Reddy" -> "MR". Shown when no photo is set. */
function initials(name: string): string {
  return name
    .replace(/^(Dr\.|Sri\.|Smt\.|Mr\.|Ms\.|Prof\.)\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

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

export default function ExamSectionStaff() {
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

  // The Controller is the isHod record, shown on their own above the team.
  // Falls back to the designation so a record that was never flagged isHod
  // still gets the prominent card rather than being lost in the grid.
  const coe =
    staff.find((f) => f.isHod) ?? staff.find((f) => /controller/i.test(f.designation ?? "")) ?? null
  const team = staff.filter((f) => f.id !== coe?.id)

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

        /* Controller card - mirrors the department HOD block (square photo,
           details beside it, gold accent for the head of the office). */
        .ess-coe {
          display: grid; grid-template-columns: 260px 1fr; gap: 28px;
          background: #fff; border: 1px solid #eef0f3; border-left: 4px solid #D4A500;
          border-radius: 12px; padding: 24px; margin-bottom: 40px;
          box-shadow: 0 8px 28px rgba(43,52,144,0.07);
        }
        .ess-coe-photo {
          width: 100%; aspect-ratio: 1 / 1; border-radius: 10px; overflow: hidden;
          background: linear-gradient(135deg, #2B3490, #1e2570);
          display: flex; align-items: center; justify-content: center;
        }
        .ess-coe-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .ess-coe-initials { color: #D4A500; font-family: 'Rajdhani', sans-serif; font-size: 40px; font-weight: 700; }
        .ess-coe-info { display: flex; flex-direction: column; justify-content: center; }
        .ess-coe-badge {
          align-self: flex-start; background: #FFE619; color: #1a1a2e;
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 11px;
          letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px;
          border-radius: 20px; margin-bottom: 10px;
        }
        .ess-coe-info h3 { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
        .ess-coe-desig { color: #2B3490; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px; }
        .ess-coe-qual { color: #666; font-size: 15px; margin: 0 0 4px; }
        .ess-coe-contact { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .ess-coe-contact a {
          background: rgba(255,230,25,0.16); color: #2B3490; font-size: 14px; font-weight: 600;
          padding: 9px 14px; border-radius: 6px; text-decoration: none; word-break: break-word;
        }
        .ess-coe-contact a:hover { background: #FFE619; }
        .ess-team-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #2B3490; margin: 0 0 16px; }

        @media (max-width: 720px) {
          .ess-coe { grid-template-columns: 1fr; gap: 18px; padding: 18px; }
          .ess-coe-photo { max-width: 220px; margin: 0 auto; }
          .ess-coe-info { text-align: center; align-items: center; }
          .ess-coe-badge { align-self: center; }
          .ess-coe-contact { justify-content: center; }
        }
      `}</style>

      <div className="ess-container">
        <h2 className="ess-title">Examination Section</h2>
        <p className="ess-sub">Controller of Examinations and the examination office team.</p>

        {/*
          The Controller gets a dedicated card with their photograph, the same
          treatment a department gives its HOD.

          Previously the whole section went through FacultyGrid, which hides
          every photo when the site-wide `faculty_show_photos` switch is off -
          so with that switch off the Controller appeared as a bare row while
          department HODs still showed their picture, because a department's HOD
          block renders its photo directly and never consulted that switch.
          The two were inconsistent for no reason a visitor could see.

          The office team below still honours the switch: it is the equivalent
          of a department's faculty list, which is exactly what that setting is
          meant to control.
        */}
        {coe && (
          <div className="ess-coe">
            <div className="ess-coe-photo">
              {coe.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
                <img src={resolveFileUrl(coe.photoUrl)} alt={coe.name} loading="lazy" decoding="async" />
              ) : (
                <span className="ess-coe-initials">{initials(coe.name)}</span>
              )}
            </div>
            <div className="ess-coe-info">
              <span className="ess-coe-badge">Controller of Examinations</span>
              <h3>{coe.name}</h3>
              {coe.designation && <p className="ess-coe-desig">{coe.designation}</p>}
              {coe.qualification && <p className="ess-coe-qual">{coe.qualification}</p>}
              {coe.specialization && <p className="ess-coe-qual">{coe.specialization}</p>}
              <div className="ess-coe-contact">
                {coe.email && <a href={`mailto:${coe.email}`}>{coe.email}</a>}
                {coe.phone &&
                  coe.phone.split(",").map((p) => {
                    const num = p.trim()
                    if (!num) return null
                    return (
                      <a key={num} href={`tel:${num.replace(/[^\d+]/g, "")}`}>
                        {num}
                      </a>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {team.length > 0 && (
          <>
            <h3 className="ess-team-title">Examination Office Team</h3>
            <FacultyGrid faculty={team} showPhotos={showPhotos} headLabel="Controller of Examinations" />
          </>
        )}
      </div>
    </section>
  )
}
