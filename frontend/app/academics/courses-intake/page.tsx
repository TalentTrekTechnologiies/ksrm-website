"use client";

import PageResources from "@/components/PageResources";
import { getPageTablesPublic, PageTable } from "@/lib/page-tables-api";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";

const btechRows = [
  { name: "Civil Engineering", code: "CE", intake: 60, nba: true },
  { name: "Computer Science & Engineering", code: "CSE", intake: 120, nba: true },
  { name: "CSE (Artificial Intelligence & Machine Learning)", code: "CSE-AIML", intake: 60, nba: false },
  { name: "CSE (Data Science)", code: "CSE-DS", intake: 60, nba: false },
  { name: "CSE (AI & ML Specialisation)", code: "CSE-AIML-S", intake: 60, nba: false },
  { name: "Electrical & Electronics Engineering", code: "EEE", intake: 60, nba: true },
  { name: "Electronics & Communication Engineering", code: "ECE", intake: 120, nba: true },
  { name: "Mechanical Engineering", code: "ME", intake: 60, nba: true },
];

const mtechRows = [
  { name: "Computer Science & Engineering", code: "M.Tech-CSE", intake: 18, nba: false },
  { name: "VLSI & Embedded Systems", code: "M.Tech-VLSI", intake: 18, nba: false },
  { name: "Structural Engineering", code: "M.Tech-SE", intake: 18, nba: false },
];

const mbaRows = [
  { name: "Master of Business Administration", code: "MBA", intake: 60, nba: false },
];

const approvals = [
  "AICTE Approved",
  "Affiliated to JNTUA",
  "UGC Autonomous",
  "NAAC Accredited",
  "NBA Accredited (select programmes)",
];

function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

/** Renders a CMS-managed intake table. Free-form columns, so adding a branch or
 *  revising an intake is an admin edit rather than a code change. */
function CmsCourseTable({ table }: { table: PageTable }) {
  return (
    <div>
      <h3 className="ci-programme-title">{table.title}</h3>
      {table.footnote && <p style={{ fontSize: 13, color: "#666", margin: "4px 0 8px" }}>{table.footnote}</p>}
      <div className="ci-table-wrapper">
        <table className="ci-table">
          <thead>
            <tr>{table.columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className={ci === 0 ? "ci-branch-name" : ci === 2 ? "ci-intake-number" : undefined}>
                    {ci === 1 ? <span className="ci-code-badge">{cell}</span>
                      : ci === 3 && cell === "NBA" ? <span className="ci-nba-badge">NBA</span>
                      : ci === 3 ? <span style={{ color: "#999" }}>{cell}</span>
                      : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CourseTable({
  title,
  regulation,
  totalIntake,
  rows,
}: {
  title: string;
  regulation: string;
  totalIntake: number;
  rows: { name: string; code: string; intake: number; nba: boolean }[];
}) {
  return (
    <div>
      <h3 className="ci-table-title">{title}</h3>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
        Regulation: <strong>{regulation}</strong> | Total Intake:{" "}
        <strong className="ci-intake-number">{totalIntake} seats</strong>
      </p>
      <div className="ci-table-wrapper">
        <table className="ci-table">
          <thead>
            <tr>
              <th>Branch / Programme</th>
              <th>Code</th>
              <th>Intake</th>
              <th>Accreditation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}>
                <td className="ci-branch-name">{r.name}</td>
                <td><span className="ci-code-badge">{r.code}</span></td>
                <td className="ci-intake-number">{r.intake}</td>
                <td>{r.nba ? <span className="ci-nba-badge">NBA</span> : <span style={{ color: "#999" }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CoursesIntakePage() {
  // Intake tables come from the CMS; the built-in tables below stay as a
  // fallback so the page never renders empty.
  const cmsTables = useLiveData<PageTable[]>(
    () => getPageTablesPublic("academics.courses-intake").catch(() => [] as PageTable[]),
    [],
  );

  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .ci-hero {
          position: relative;
          background-image: url('/site-images/classroom2.jpg');
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }
        .ci-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
          z-index: 0;
        }
        .ci-hero > * {
          position: relative;
          z-index: 1;
        }
        .ci-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #D4A500;
        }
        .ci-hero-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.08;
          margin: 0;
        }
        .ci-hero-tagline {
          color: rgba(255,255,255,0.85);
          font-size: 19px;
          line-height: 1.6;
          margin: 16px 0 0;
          font-weight: 400;
          max-width: 700px;
        }
        .ci-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-top: 24px;
        }
        .ci-breadcrumb a { color: #D4A500; text-decoration: none; }
        .ci-breadcrumb a:hover { opacity: 0.8; }
        .ci-breadcrumb span { color: #D4A500; }

        .ci-approvals-strip {
          background: #D4A500;
          padding: 24px 0;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ci-approval-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #2B3490;
          color: #fff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
        }

        .ci-eapcet-box {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 32px;
          border-radius: 12px;
          text-align: center;
          margin-top: 40px;
        }
        .ci-eapcet-label { font-size: 15px; opacity: 0.9; }
        .ci-eapcet-code {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(29px, 7.7vw, 48px);
          font-weight: 700;
          color: #D4A500;
          margin: 12px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ci-table-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 40px 0 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #D4A500;
        }
        .ci-table-wrapper {
          overflow-x: auto;
          border: 1px solid #eef0f3;
          border-radius: 8px;
        }
        .ci-table { width: 100%; border-collapse: collapse; font-size: 15px; }
        .ci-table thead th {
          background: #2B3490;
          color: #fff;
          padding: 16px;
          text-align: left;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ci-table tbody td { padding: 14px 16px; border-bottom: 1px solid #eef0f3; color: #555; }
        .ci-table tbody tr:nth-child(odd) { background: #f4f3ef; }
        .ci-table tbody tr:hover { background: #fffaed; }
        .ci-branch-name { font-weight: 600; color: #1a1a2e; }
        .ci-code-badge {
          display: inline-block;
          background: #eef1ff;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
        }
        .ci-intake-number {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: #2B3490;
          font-size: 16px;
        }
        .ci-nba-badge {
          display: inline-block;
          background: #D4A500;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
        }

        .ci-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .ci-contact-item h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #D4A500;
          margin: 0;
        }
        .ci-contact-item p { font-size: 15px; margin: 8px 0 0; line-height: 1.6; }
        .ci-contact-item a { color: #D4A500; text-decoration: none; }
        .ci-contact-item a:hover { opacity: 0.8; }

        @media (max-width: 900px) {
          .ci-contact-card { grid-template-columns: 1fr; gap: 24px; }
          .ci-table { font-size: 13px; }
          .ci-table thead th, .ci-table tbody td { padding: 10px; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        {/* HERO */}
        <section
          className="ci-hero"
          style={{ backgroundImage: "url('/banners/courses-intake.png')", position: "relative" }}
        >
          <div className="responsive-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "72px 0" }}>
              <div className="ci-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 className="ci-hero-title"><CmsText section="academics.courses-intake" slot="courses-offered-intake" /></h1>
              <p className="ci-hero-tagline"><CmsText section="academics.courses-intake" slot="aicte-approved-programmes-with-strong" /></p>
            </div>
          </div>
        </section>

        {/* APPROVALS STRIP */}
        <section className="ci-approvals-strip">
          {approvals.map((a) => (
            <div className="ci-approval-badge" key={a}>
              <AwardIcon />
              {a}
            </div>
          ))}
        </section>

        {/* INTRO + EAPCET */}
        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}><CmsText section="academics.courses-intake" slot="k-s-r-m-college" multiline /></p>
            <div className="ci-eapcet-box">
              <div className="ci-eapcet-label">Common Entrance Test Code</div>
              <div className="ci-eapcet-code">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12 }}>
                  <path d="M12 7v14" />
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                </svg>
                K.S.R.M.
              </div>
              <p style={{ margin: "8px 0 0", opacity: 0.9 }}><CmsText section="academics.courses-intake" slot="use-this-code-during-eapcet" /></p>
            </div>
          </div>
        </section>

        {/* TABLES */}
        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            {cmsTables && cmsTables.length > 0 ? (
              cmsTables.map((t) => <CmsCourseTable key={t.id} table={t} />)
            ) : (
              <>
                <CourseTable title="B.Tech (4 Years)" regulation="R23UG" totalIntake={600} rows={btechRows} />
                <CourseTable title="M.Tech (2 Years)" regulation="R22PG" totalIntake={54} rows={mtechRows} />
                <CourseTable title="MBA (2 Years)" regulation="R25" totalIntake={60} rows={mbaRows} />
              </>
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <div className="ci-contact-card">
              <div className="ci-contact-item">
                <h4><CmsText section="academics.courses-intake" slot="admissions-office" /></h4>
                <p><CmsText section="academics.courses-intake" slot="for-enquiries-regarding-courses-and" /></p>
              </div>
              <div className="ci-contact-item">
                <h4><CmsText section="academics.courses-intake" slot="phone" /></h4>
                <p><a href="tel:+918143731980">+91 8143731980 / 08562 295972</a></p>
              </div>
              <div className="ci-contact-item">
                <h4><CmsText section="academics.courses-intake" slot="email" /></h4>
                <p><a href="mailto:principal@ksrmce.ac.in">principal@ksrmce.ac.in</a></p>
              </div>
            </div>
          </div>
        </section>
      
      <PageResources section="academics.courses-intake" />
      </main>
    </>
  );
}