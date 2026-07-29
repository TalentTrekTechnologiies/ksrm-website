import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Placements | K.S.R.M. College of Engineering",
  description: "Training & Placements at K.S.R.M. College of Engineering - recruiters, placement records, internships, MoUs and training programmes.",
  alternates: { canonical: "/placements" },
};

/**
 * Placements index. This route previously held a scraped HTML dump of a redirect
 * response (from an old "recover pages from the deployed site" pass), so it
 * rendered nothing but the surrounding chrome. It is a top-level nav item and
 * an indexable URL in the sitemap, so it now lists its sections.
 */
const LINKS = [
  { label: "Overview", href: "/placements/overview", blurb: "Placement statistics and highlights." },
  { label: "Our Recruiters", href: "/placements/our-recruiters", blurb: "Companies that recruit from campus." },
  { label: "Placement Record", href: "/placements/placements-record", blurb: "Year-wise placement records." },
  { label: "Trainings", href: "/placements/trainings", blurb: "Pre-placement training programmes." },
  { label: "Internships", href: "/placements/internships", blurb: "Internship opportunities and partners." },
  { label: "MoUs", href: "/placements/mous", blurb: "Industry memoranda of understanding." },
];

export default function PlacementsIndexPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .hb-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .hb-container { padding: 0 20px; } }
        .hb-hero { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); padding: 72px 0; }
        .hb-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .hb-card { display: block; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; text-decoration: none; background: #fff; transition: box-shadow .2s, transform .2s; }
        .hb-card:hover { box-shadow: 0 10px 28px rgba(0,0,0,.08); transform: translateY(-2px); }
      `}</style>

      <section className="hb-hero">
        <div className="hb-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
            Placements
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "14px 0 0", maxWidth: 720 }}>1200+ students placed, 200+ recruiting companies.</p>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="hb-container">
          <div className="hb-grid">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hb-card">
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>{l.label}</h2>
                <p style={{ color: "#666", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{l.blurb}</p>
                <span style={{ color: "#2B3490", fontSize: 14, fontWeight: 700, display: "inline-block", marginTop: 14 }}>Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
