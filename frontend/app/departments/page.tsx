import type { Metadata } from "next";
import Link from "next/link";
import CmsText from "@/components/CmsText";
import ExtraDepartmentCards from "@/components/departments/ExtraDepartmentCards";
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Departments",
  description: "Engineering departments at K.S.R.M. College of Engineering, Kadapa - Civil, CSE, ECE, EEE, Mechanical, Humanities & Sciences and Management Studies.",
  path: "/departments",
});

/**
 * Departments index. This route previously held a scraped HTML dump of a
 * redirect response (from an old "recover pages from the deployed site" pass),
 * so it rendered nothing but the surrounding chrome - clicking Departments in
 * the nav appeared to show only the footer. It is a top-level nav item and an
 * indexable URL in the sitemap, so it now lists the departments rather than
 * bouncing straight to one of them.
 */
const DEPARTMENTS = [
  { slug: "cse", name: "Computer Science & Engineering", short: "CSE", blurb: "Software, AI & ML, data science and computing systems." },
  { slug: "ece", name: "Electronics & Communication Engineering", short: "ECE", blurb: "Embedded systems, VLSI, signal processing and communications." },
  { slug: "eee", name: "Electrical & Electronics Engineering", short: "EEE", blurb: "Power systems, control, machines and renewable energy." },
  { slug: "civil", name: "Civil Engineering", short: "CE", blurb: "Structures, geotechnical, transportation and water resources." },
  { slug: "mech", name: "Mechanical Engineering", short: "ME", blurb: "Design, thermal, manufacturing and CAD/CAM." },
  { slug: "mba", name: "Management Studies", short: "MBA", blurb: "Business administration, finance, marketing and HR." },
  { slug: "hs", name: "Humanities & Sciences", short: "H&S", blurb: "Mathematics, physics, chemistry and communication skills." },
];

/**
 * Slugs the curated list above already covers, alias forms included - the CMS
 * calls Mechanical "mechanical" while this page links to "mech", and without
 * both spellings it would be listed twice.
 */
const KNOWN_SLUGS = [
  ...DEPARTMENTS.map((d) => d.slug),
  "mechanical",
  "humanities-sciences",
  "mca",
];

export default function DepartmentsIndexPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .dh-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .dh-container { padding: 0 20px; } }
        .dh-hero { position: relative; background-image: url('/site-images/blocktop.webp'); background-size: cover; background-position: center; background-color: #2B3490; padding: 92px 0; overflow: hidden; }
        .dh-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,26,74,0.72) 0%, rgba(20,26,74,0.86) 100%); }
        .dh-hero > * { position: relative; z-index: 2; }
        .dh-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .dh-card { display: block; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; text-decoration: none; transition: box-shadow .2s, transform .2s; background: #fff; }
        .dh-card:hover { box-shadow: 0 10px 28px rgba(0,0,0,.08); transform: translateY(-2px); }
      `}</style>

      <section className="dh-hero">
        <div className="dh-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}><CmsText section="departments" slot="departments" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "14px 0 0", maxWidth: 720 }}><CmsText section="departments" slot="seven-departments-offering-undergraduate-postgra" /></p>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="dh-container">
          <div className="dh-grid">
            {DEPARTMENTS.map((d, _i) => (
              <Link key={d.slug} href={`/departments/${d.slug}`} className="dh-card">
                <span style={{ display: "inline-block", background: "#FFE619", color: "#1a1a2e", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, padding: "3px 10px", borderRadius: 5, marginBottom: 12 }}>
                  {d.short}
                </span>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 21, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}><CmsText section="departments" slot={`DEPARTMENTS.${_i}.name`} /></h2>
                <p style={{ color: "#666", fontSize: 15, lineHeight: 1.6, margin: 0 }}><CmsText section="departments" slot={`DEPARTMENTS.${_i}.blurb`} /></p>
                <span style={{ color: "#2B3490", fontSize: 14, fontWeight: 700, display: "inline-block", marginTop: 14 }}>View department →</span>
              </Link>
            ))}
            {/* Departments added in the CMS since this list was written. */}
            <ExtraDepartmentCards knownSlugs={KNOWN_SLUGS} />
          </div>
        </div>
      </section>
    </main>
  );
}
