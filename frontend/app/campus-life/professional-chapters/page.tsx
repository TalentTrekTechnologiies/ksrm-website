import Link from "next/link";

export const metadata = {
  title: "Professional Chapters | K.S.R.M. College of Engineering",
  description:
    "Department student professional chapters at K.S.R.M. College of Engineering, Kadapa - committee, events and activity reports for each department's own chapter.",
  alternates: { canonical: "/campus-life/professional-chapters" },
};

const DEPARTMENTS = [
  { name: "Civil Engineering", href: "/departments/civil" },
  { name: "Computer Science and Engineering", href: "/departments/cse" },
  { name: "Electrical and Electronics", href: "/departments/eee" },
  { name: "Electronics and Communication Engineering", href: "/departments/ece" },
  { name: "Mechanical Engineering", href: "/departments/mechanical" },
  { name: "Humanities and Sciences", href: "/departments/hs" },
  { name: "Management Studies (MBA)", href: "/departments/mba" },
];

/**
 * Professional Chapters - the landing page for every department's student
 * chapter. This used to list five hardcoded club names as dead-end cards,
 * each linking to a department page with nothing chapter-specific on it.
 *
 * The real content - About, Committee, Events, activity reports - lives in a
 * Student Chapter section on each department's own page
 * (components/departments/StudentChapter.tsx), department-scoped in the CMS
 * so each department's coordinators edit only their own. This page is the
 * one place that lists all of them together, matching the navbar's
 * "Professional Chapters" entry, which points here and then lists the same
 * departments as indented links directly in the dropdown.
 */
export default function ProfessionalChaptersPage() {
  return (
    <main style={{ background: "#ffffff", minHeight: "60vh" }}>
      <section style={{ padding: "96px 0 88px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 800,
              color: "#2B3490",
              margin: "0 0 16px",
            }}
          >
            Professional Chapters
          </h1>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, margin: "0 0 40px" }}>
            Each department runs its own student professional chapter - committee, events and
            activity reports below, on that department&rsquo;s page.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, textAlign: "left" }}>
            {DEPARTMENTS.map((d) => (
              <Link
                key={d.href}
                href={`${d.href}#student-chapter`}
                style={{
                  display: "block",
                  background: "#f7f8fa",
                  border: "1px solid #eef0f3",
                  borderRadius: 10,
                  padding: "16px 18px",
                  textDecoration: "none",
                  color: "#1a1a2e",
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                {d.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
