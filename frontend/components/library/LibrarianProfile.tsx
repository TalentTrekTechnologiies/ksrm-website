"use client"

import { useLibrarian } from "@/lib/use-library-librarian"
import { resolveFileUrl } from "@/lib/api-base";
import CmsText from "@/components/CmsText"

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

  const name = librarian?.name ?? FALLBACK.name
  const qualification = librarian?.qualification ?? FALLBACK.qualification
  const specialization = librarian?.specialization ?? FALLBACK.specialization
  const experience = librarian?.experience ?? FALLBACK.experience
  const photoUrl = resolveFileUrl(librarian?.photoUrl ?? "") || FALLBACK.photoUrl

  return (
    <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
      <div className="responsive-container">
        <h2 className="lib-h2">Librarian</h2>
        <p className="lib-lead">Profile of the Librarian, Central Library.</p>
        <div className="lib-librarian">
          <div>
            <div className="lib-librarian-photo">
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS or static asset */}
              <img
                src={photoUrl}
                alt={`${name}, Librarian`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              {name}
            </h3>
            <p style={{ color: "#2B3490", fontSize: 15, fontWeight: 600, margin: "4px 0 0" }}>Librarian</p>
            <dl>
              <dt>Educational Qualifications</dt>
              <dd>{qualification}</dd>
              <dt>Area of Specialisation</dt>
              <dd>{specialization}</dd>
              <dt>Work Experience</dt>
              <dd>{experience}</dd>
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
                  <a href="tel:+919441373732" style={{ color: "#2B3490", textDecoration: "none" }}><CmsText section="library" slot="contact.phone" /></a>
                )}
                {" · "}
                {librarian?.email ? (
                  <a href={`mailto:${librarian.email}`} style={{ color: "#2B3490", textDecoration: "none" }}>{librarian.email}</a>
                ) : (
                  <a href="mailto:library@ksrmce.ac.in" style={{ color: "#2B3490", textDecoration: "none" }}><CmsText section="library" slot="contact.email" /></a>
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
  return <>{librarian?.name ?? FALLBACK.name}</>
}
