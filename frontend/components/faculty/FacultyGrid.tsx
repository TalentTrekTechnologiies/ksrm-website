"use client"

import { useState } from "react"
import { Faculty } from "@/lib/faculty-api"
import FacultyProfileModal from "@/components/faculty/FacultyProfileModal"

/**
 * A department's faculty, as a compact grid.
 *
 * The previous cards were ~280px wide with a 3:3.5 portrait and every field
 * stacked underneath, so a department of forty staff ran to several screens of
 * scrolling and was hard to scan. These carry only what identifies a person -
 * photo, name, designation - and put the rest behind "View Profile", which is
 * also where publications and patents live. Roughly twice as many fit per row.
 *
 * Shared by the department pages, the Examination Section and the Library, so
 * faculty look the same everywhere they appear.
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

export default function FacultyGrid({
  faculty,
  showPhotos,
  /** Wording for the flagged record - "Head of Department", "Controller of Examinations". */
  headLabel = "Head of Department",
}: {
  faculty: Faculty[]
  showPhotos: boolean
  headLabel?: string
}) {
  const [open, setOpen] = useState<Faculty | null>(null)

  if (faculty.length === 0) return null

  return (
    <>
      <style>{`
        /* Compact: ~190px columns instead of 280, so a row holds far more. */
        .fg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
        @media (max-width: 520px) { .fg-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; } }

        .fg-card { background: #fff; border: 1px solid #eef0f3; border-radius: 10px; overflow: hidden; text-align: left; padding: 0; cursor: pointer; display: flex; flex-direction: column; transition: box-shadow .18s, transform .18s, border-color .18s; }
        .fg-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(43,52,144,.13); border-color: #dfe3ea; }
        .fg-card.head { border: 2px solid #D4A500; }

        /* Squarer than the old 3:3.5, which is most of the height saving. */
        .fg-photo { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; background: linear-gradient(135deg,#2B3490,#1e2570); display: flex; align-items: center; justify-content: center; }
        .fg-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
        .fg-initials { color: #D4A500; font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
        .fg-badge { position: absolute; top: 8px; left: 8px; background: #FFE619; color: #1a1a2e; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 10px; padding: 3px 8px; border-radius: 20px; }

        .fg-info { padding: 11px 13px 13px; flex: 1; display: flex; flex-direction: column; }
        .fg-name { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0; line-height: 1.25; }
        .fg-desig { color: #666; font-size: 12px; margin: 3px 0 0; line-height: 1.35; }
        .fg-more { margin-top: 9px; color: #2B3490; font-size: 12px; font-weight: 700; }

        /* Photos off - a dense list, the same behaviour the old cards had. */
        .fg-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 9px; }
        .fg-row { background: #fff; border: 1px solid #eef0f3; border-left: 3px solid #2B3490; border-radius: 9px; padding: 11px 14px; text-align: left; cursor: pointer; width: 100%; }
        .fg-row:hover { border-color: #cfd5e0; border-left-color: #2B3490; }
        .fg-row.head { border-left-color: #D4A500; }
      `}</style>

      {showPhotos ? (
        <div className="fg-grid">
          {faculty.map((f, i) => (
            <button
              type="button"
              key={`${f.id || "static"}-${i}`}
              className={`fg-card${f.isHod ? " head" : ""}`}
              onClick={() => setOpen(f)}
              aria-label={`View profile of ${f.name}`}
            >
              <div className="fg-photo">
                {f.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
                  <img
                    src={f.photoUrl}
                    alt={f.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  <span className="fg-initials">{initials(f.name)}</span>
                )}
                {f.isHod && <span className="fg-badge">{headLabel}</span>}
              </div>
              <div className="fg-info">
                <h3 className="fg-name">{f.name}</h3>
                <p className="fg-desig">{f.designation}</p>
                <span className="fg-more">View Profile →</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="fg-list">
          {faculty.map((f, i) => (
            <button
              type="button"
              key={`${f.id || "static"}-${i}`}
              className={`fg-row${f.isHod ? " head" : ""}`}
              onClick={() => setOpen(f)}
              aria-label={`View profile of ${f.name}`}
            >
              <h3 className="fg-name">{f.name}</h3>
              <p className="fg-desig">{f.designation}</p>
              <span className="fg-more">View Profile →</span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <FacultyProfileModal faculty={open} showPhoto={showPhotos} onClose={() => setOpen(null)} />
      )}
    </>
  )
}
