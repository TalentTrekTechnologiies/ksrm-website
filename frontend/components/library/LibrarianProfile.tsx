"use client"

import { useLibrarian } from "@/lib/use-library-librarian"
import { resolveFileUrl } from "@/lib/api-base";
import CmsText from "@/components/CmsText"
import CmsContactLink from "@/components/CmsContactLink"

// Kept only for the identity fields Faculty has no column for. Everything
// else used to be a second, disconnected copy of facts the Faculty record
// (edited from Admin -> Departments -> Central Library -> Faculty, the same
// record shown in the staff grid below) already holds - two places to update
// the same person's qualification was exactly the kind of drift this page
// keeps running into. Editing the Librarian's name, qualification,
// specialisation, experience or photo now only has one place to happen.
const FALLBACK = {
  name: "Dr. N. Ravisankar Reddy, Ph.D",
  qualification: "M.A., B.Ed., M.L.I.Sc., Ph.D",
  specialization: "Digital Resources",
  experience: "16 years",
  photoUrl: "/library/ravi.jpg",
}

/**
 * The Librarian's profile block, above the editable staff grid.
 *
 * Identity fields (name, qualification, specialisation, experience, photo)
 * come from the same Faculty record the staff grid shows - the one flagged
 * isHod for the Central Library department - so there is exactly one place
 * to correct any of them. Joining date, prior experience and publications
 * have no Faculty column to hold them, so those stay page-text (Page
 * Content -> Library -> Page Text), editable but independent of the record.
 */
export default function LibrarianProfile() {
  const librarian = useLibrarian()

  // The CMS record when there is one - and then ONLY the record: an empty
  // field is left out, not filled from FALLBACK, which described the previous
  // Librarian (the page showed his "Digital Resources" against the current
  // Librarian's empty specialisation). FALLBACK only when no one is flagged,
  // and nothing while the list is still loading.
  const loading = librarian === undefined
  const person = librarian ?? (loading ? null : FALLBACK)
  const name = person?.name ?? ""
  const role = librarian?.designation?.trim() || "Librarian"
  const details: [string, string | null | undefined][] = [
    ["Educational Qualifications", person?.qualification],
    ["Area of Specialisation", person?.specialization],
    ["Work Experience", person?.experience],
  ]
  const photoUrl = librarian
    ? resolveFileUrl(librarian.photoUrl ?? "")
    : loading
      ? ""
      : FALLBACK.photoUrl

  return (
    <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
      <div className="responsive-container">
        <h2 className="lib-h2">Librarian</h2>
        <p className="lib-lead">Profile of the Librarian, Central Library.</p>
        <div className="lib-librarian">
          <div>
            <div className="lib-librarian-photo">
              {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- CMS or static asset
              <img
                src={photoUrl}
                alt={`${name}, ${role}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              )}
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              {name}
            </h3>
            {/* The record's own designation - the staff list below shows the
                same person, and the two said "Librarian" and "Assistant
                Librarian". */}
            <p style={{ color: "#2B3490", fontSize: 15, fontWeight: 600, margin: "4px 0 0" }}>{loading ? "" : role}</p>
            <dl>
              {details
                .filter(([, value]) => value?.trim())
                .map(([label, value]) => (
                  <div key={label} style={{ display: "contents" }}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              <dt>Date of Joining K.S.R.M.C.E.</dt>
              <dd><CmsText section="library" slot="librarian.joiningDate" /></dd>
              <dt>Previous Experience</dt>
              <dd><CmsText section="library" slot="librarian.previousExperience" multiline /></dd>
              <dt>Publications</dt>
              <dd><CmsText section="library" slot="librarian.publications" /></dd>
              <dt>Contact</dt>
              <dd>
                {librarian?.phone ? (
                  <a href={`tel:${librarian.phone}`} style={{ color: "#2B3490", textDecoration: "none" }}>{librarian.phone}</a>
                ) : (
                  <CmsContactLink section="library" slot="contact.phone" kind="tel" style={{ color: "#2B3490", textDecoration: "none" }} />
                )}
                {" · "}
                {librarian?.email ? (
                  <a href={`mailto:${librarian.email}`} style={{ color: "#2B3490", textDecoration: "none" }}>{librarian.email}</a>
                ) : (
                  <CmsContactLink section="library" slot="contact.email" kind="mailto" style={{ color: "#2B3490", textDecoration: "none" }} />
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Just the name, for the page's "Contact" card further down - which needs to
 * name the Librarian without repeating the whole profile block. Sharing
 * useLibrarian() rather than a separate page-text slot means there is one
 * live answer to "who is the Librarian", not two that can disagree.
 */
export function LibrarianName() {
  const librarian = useLibrarian()
  if (librarian === undefined) return null
  return <>{librarian?.name ?? FALLBACK.name}</>
}
