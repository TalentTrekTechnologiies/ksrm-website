import Link from "next/link";

export const metadata = {
  title: "Student Chapters | K.S.R.M. College of Engineering",
  description: "Department student chapters have moved to each department's own page.",
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
 * This page used to list five hardcoded club names, each linking out to a
 * department page with nothing chapter-specific on it. Real chapters - About,
 * Committee, Events, activity reports - now live in a Student Chapter section
 * on each department's own page (components/departments/StudentChapter.tsx),
 * reachable from the navbar's Departments menu.
 *
 * This route is kept as a plain notice rather than deleted, so a bookmarked
 * or search-indexed link does not 404 - this is a static export, so an actual
 * HTTP redirect is not available; a page that tells a visitor where to go is
 * the honest equivalent here.
 */
export default function ProfessionalChaptersMovedPage() {
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
            Student Chapters have moved
          </h1>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, margin: "0 0 40px" }}>
            Each department&rsquo;s student chapter - its committee, events and activity reports - is
            now on that department&rsquo;s own page.
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
