import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export const metadata = {
  title: "Professional Chapters | K.S.R.M. College of Engineering",
  description:
    "Department-led professional chapters and student associations at K.S.R.M. College of Engineering, Kadapa - Technical Club (CSE), Echo Club (ECE), EEE Club, Civil Engineers Association and Mechanical Engineer Association.",
  alternates: { canonical: "/campus-life/professional-chapters" },
};

/**
 * Professional Chapters.
 *
 * One chapter per engineering department. The array below only fixes how many
 * cards render and which department each belongs to - every visible word is a
 * page-text slot, so a chapter can be renamed or re-described from Page
 * Content without touching this file. Documents (activity reports, event
 * notices) are uploaded against this page's section like any other.
 */
const chapters = [
  {
    dept: "CSE",
    name: "Technical Club",
    blurb: "Coding contests, hackathons, technical talks and peer workshops for Computer Science students.",
    href: "/departments/cse",
  },
  {
    dept: "ECE",
    name: "Echo Club",
    blurb: "Electronics and communication projects, circuit design events and industry sessions.",
    href: "/departments/ece",
  },
  {
    dept: "EEE",
    name: "EEE Club",
    blurb: "Electrical engineering seminars, energy projects and student-led technical activities.",
    href: "/departments/eee",
  },
  {
    dept: "CEA",
    name: "Civil Engineers Association",
    blurb: "Site visits, surveying and structural design events for Civil Engineering students.",
    href: "/departments/civil",
  },
  {
    dept: "ME",
    name: "Mechanical Engineer Association",
    blurb: "Workshops, design competitions and industry interaction for Mechanical Engineering students.",
    href: "/departments/mechanical",
  },
];

export default function ProfessionalChaptersPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .pc-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .pc-container { padding: 0 20px; } }
        .pc-hero {
          position: relative; background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          padding: 92px 0; overflow: hidden;
        }
        .pc-hero::after {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .pc-hero > * { position: relative; z-index: 2; }
        .pc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .pc-card {
          display: flex; flex-direction: column; background: #fff; border: 1px solid #eef0f3;
          border-radius: 12px; padding: 28px 24px; text-decoration: none;
          transition: box-shadow .18s, transform .18s, border-color .18s;
        }
        .pc-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(43,52,144,.12); border-color: #dfe3ea; }
        .pc-badge {
          align-self: flex-start; background: #2B3490; color: #FFE619; font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 12.5px; letter-spacing: .6px; padding: 4px 12px; border-radius: 20px; margin-bottom: 14px;
        }
        .pc-name { font-family: 'Rajdhani', sans-serif; font-size: 21px; font-weight: 700; color: #1a1a2e; margin: 0 0 10px; }
        .pc-blurb { color: #666; font-size: 15px; line-height: 1.7; margin: 0 0 16px; flex: 1; }
        .pc-link { color: #2B3490; font-size: 13.5px; font-weight: 700; }
      `}</style>

      <section className="pc-hero">
        <div className="pc-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
            <CmsText section="professional-chapters" slot="hero.title" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "14px 0 0", maxWidth: 760 }}>
            <CmsText section="professional-chapters" slot="hero.subtitle" />
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 0" }}>
        <div className="pc-container">
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, maxWidth: 900, margin: "0 0 40px" }}>
            <CmsText section="professional-chapters" slot="intro" multiline />
          </p>

          <div className="pc-grid">
            {chapters.map((c, i) => (
              <a className="pc-card" href={c.href} key={c.dept}>
                <span className="pc-badge">{c.dept}</span>
                <h2 className="pc-name">
                  <CmsText section="professional-chapters" slot={`chapters.${i}.name`} />
                </h2>
                <p className="pc-blurb">
                  <CmsText section="professional-chapters" slot={`chapters.${i}.blurb`} multiline />
                </p>
                <span className="pc-link">Visit department →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <PageResources section="professional-chapters" />
    </main>
  );
}
