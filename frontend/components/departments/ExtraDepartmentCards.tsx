"use client"

import Link from "next/link"
import { getDepartmentsPublic, isAcademicDepartment } from "@/lib/departments-api"
import { useLiveData } from "@/lib/use-live-data"
import { canonicalDepartmentSlug } from "@/lib/department-slugs"

/**
 * Cards for departments the index page's own list does not name.
 *
 * The seven curated cards stay exactly as they are: their headings and blurbs
 * are CmsText slots keyed by array position ("DEPARTMENTS.3.name"), so
 * inserting a card into that list would silently re-point every slot after it
 * at the wrong department. Appending instead leaves them alone.
 *
 * This is what makes a department created in the CMS show up here at all. The
 * grid was a fixed list in code, so a new department appeared nowhere on the
 * public site however correctly it had been created.
 *
 * Name, short name and tagline come from the department's own record - nothing
 * is written for it here, so a card says only what an admin has actually
 * entered.
 */
export default function ExtraDepartmentCards({ knownSlugs }: { knownSlugs: string[] }) {
  const known = new Set(knownSlugs.map((s) => s.trim().toLowerCase()))

  const extras = useLiveData(
    () =>
      getDepartmentsPublic().then((all) =>
        // Compared on the published slug, so the CMS's "mechanical" is
        // recognised as the curated "mech" card and not added a second time.
        all.filter(
          (d) =>
            d.isActive &&
            isAcademicDepartment(d) &&
            !known.has(canonicalDepartmentSlug(d.slug).toLowerCase()),
        ),
      ),
    // knownSlugs is a literal defined at module scope in the parent, so the
    // set is stable across renders and this only ever runs on mount.
    [],
  )

  if (!extras?.length) return null

  return (
    <>
      {extras.map((d) => (
        <Link key={d.slug} href={`/departments/${canonicalDepartmentSlug(d.slug)}`} className="dh-card">
          {d.shortName && (
            <span
              style={{
                display: "inline-block",
                background: "#FFE619",
                color: "#1a1a2e",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                padding: "3px 10px",
                borderRadius: 5,
                marginBottom: 12,
              }}
            >
              {d.shortName}
            </span>
          )}
          <h2
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 21,
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 8px",
            }}
          >
            {d.name}
          </h2>
          {d.tagline && (
            <p style={{ color: "#666", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{d.tagline}</p>
          )}
          <span
            style={{
              color: "#2B3490",
              fontSize: 14,
              fontWeight: 700,
              display: "inline-block",
              marginTop: 14,
            }}
          >
            View department →
          </span>
        </Link>
      ))}
    </>
  )
}
