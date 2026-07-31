"use client"

import { getFacultyPublic, Faculty } from "@/lib/faculty-api"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The Examination Section's staff, shown on the Examinations page.
 *
 * These are ordinary Faculty records carrying department = "Examination
 * Section", so they inherit everything that module already has: photos from the
 * Media Library, the Move up/down ordering, and the site-wide faculty-photos
 * switch. The Controller of Examinations is the record flagged isHod, and is
 * presented larger and first - the same treatment a department gives its HOD.
 *
 * Nothing here is hardcoded: staff add, remove, reorder and photograph these
 * people from Departments -> Faculty like any other entry.
 */
const SECTION = "Examination Section"

export default function ExamSectionStaff() {
  const staff = useLiveData<Faculty[]>(
    () => getFacultyPublic(SECTION).catch(() => [] as Faculty[]),
    [],
  )
  // One switch controls faculty photos across the whole site; honour it here so
  // the Examinations page never disagrees with the department pages.
  const settings = useLiveData<Record<string, string>>(() => getPublicSiteSettings(), [], { initialValue: {} })
  const showPhotos = (settings?.["faculty_show_photos"] ?? "true") !== "false"

  if (!staff || staff.length === 0) return null

  const coe = staff.find((s) => s.isHod) ?? null
  const rest = staff.filter((s) => s.id !== coe?.id)

  return (
    <section style={{ width: "100%", background: "#f7f8fa", padding: "56px 0" }}>
      <style>{`
        .ess-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .ess-container { padding: 0 20px; } }
        .ess-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; color: #2B3490; margin: 0 0 28px; text-align: center; }
        .ess-coe { display: flex; align-items: center; gap: 22px; background: #fff; border: 1px solid #eef0f3; border-left: 5px solid #D4A500; border-radius: 14px; padding: 22px; margin-bottom: 26px; }
        @media (max-width: 560px) { .ess-coe { flex-direction: column; text-align: center; } }
        .ess-coe img { width: 104px; height: 104px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 3px solid #FFE619; }
        .ess-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; }
        .ess-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 18px; text-align: center; }
        .ess-card img { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; display: block; border: 2px solid #eef0f3; }
        .ess-name { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .ess-desig { font-size: 13px; color: #666; margin: 0; }
        /* Photos off: a compact list instead of cards, matching how the
           department pages behave under the same switch. */
        .ess-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
        .ess-row { background: #fff; border: 1px solid #eef0f3; border-radius: 10px; padding: 12px 16px; }
      `}</style>

      <div className="ess-container">
        <h2 className="ess-title">Examination Section</h2>

        {coe && (
          <div className="ess-coe">
            {showPhotos && coe.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
              <img src={coe.photoUrl} alt={coe.name} onError={(e) => (e.currentTarget.style.display = "none")} />
            )}
            <div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: "0 0 4px" }}>
                {coe.name}
              </p>
              <p style={{ color: "#D4A500", fontSize: 15, fontWeight: 700, margin: 0 }}>{coe.designation}</p>
              {coe.email && <p style={{ color: "#666", fontSize: 14, margin: "6px 0 0" }}>{coe.email}</p>}
            </div>
          </div>
        )}

        {rest.length > 0 &&
          (showPhotos ? (
            <div className="ess-grid">
              {rest.map((s) => (
                <div key={s.id} className="ess-card">
                  {s.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
                    <img src={s.photoUrl} alt={s.name} onError={(e) => (e.currentTarget.style.display = "none")} />
                  )}
                  <p className="ess-name">{s.name}</p>
                  <p className="ess-desig">{s.designation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="ess-list">
              {rest.map((s) => (
                <div key={s.id} className="ess-row">
                  <p className="ess-name">{s.name}</p>
                  <p className="ess-desig">{s.designation}</p>
                </div>
              ))}
            </div>
          ))}
      </div>
    </section>
  )
}
