"use client";

import PageResources from "@/components/PageResources";
import { getDepartmentProgrammesPublic, DepartmentProgramme } from "@/lib/department-programmes-api";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";
import { isBcaProgramme, BCA_FROM_YEAR } from "@/lib/bca-programme";

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

/**
 * Approved by the college for an intake of 60 from AY 2026-27.
 *
 * Unlike the other fallbacks in this file, this one renders even when the CMS
 * has programmes, because BCA is approved and has to appear on the site now.
 * The moment an admin adds a BCA programme under Admin -> Academics, the CMS
 * row takes over and this is not used - so revising the intake stays an admin
 * edit, exactly like every other programme here.
 *
 * No duration or regulation is stated: the college gave the intake and the
 * academic year, and neither of the others, so neither is shown.
 */
const bcaRows = [
  { name: "Bachelor of Computer Applications", code: "BCA", intake: 60, nba: false },
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

function CourseTable({
  id,
  title,
  regulation,
  note,
  totalIntake,
  rows,
}: {
  /** Anchor target, so a menu entry can link straight to one table. */
  id?: string;
  title: string;
  /** Omitted for a programme whose regulation code the college has not issued
   *  yet - the segment is dropped rather than showing a made-up code. */
  regulation?: string;
  /** Free line under the title, e.g. when a programme starts. */
  note?: string;
  totalIntake: number;
  rows: { name: string; code: string; intake: number; nba: boolean }[];
}) {
  return (
    // scroll-margin-top keeps the heading clear of the sticky header when the
    // page is opened at #bca rather than scrolled to.
    <div id={id} style={id ? { scrollMarginTop: 120 } : undefined}>
      <h3 className="ci-table-title">{title}</h3>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
        {regulation && (
          <>
            Regulation: <strong>{regulation}</strong> |{" "}
          </>
        )}
        Total Intake: <strong className="ci-intake-number">{totalIntake} seats</strong>
        {note && (
          <>
            {" "}
            | <strong>{note}</strong>
          </>
        )}
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
  // Seats come from the same DepartmentProgramme rows the department pages
  // and the UG/PG admissions tables read, so a change to an intake shows up
  // everywhere at once instead of needing a second table kept in step here.
  const cmsProgrammes = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    [],
  );

  // Group into the tables the page shows. MBA is a PG programme in the CMS
  // and BCA a UG one, so both are split out of their level by name.
  //
  // The word boundaries here are a real backslash followed by b. They were
  // literal 0x08 backspace characters - which is what that escape means to a
  // string, but not to a regex - so the MBA test matched nothing: the MBA
  // table never rendered at all and MBA was listed under "M.Tech (2 Years)"
  // on the live site. Written by an editing script that unescaped them.
  const isBca = isBcaProgramme;
  const isMba = (p: DepartmentProgramme) => /\bMBA\b/i.test(p.name);

  const ugAll = (cmsProgrammes ?? []).filter((p) => p.level === "UG");
  // Kept out of the B.Tech table, and out of its intake total.
  const ug = ugAll.filter((p) => !isBca(p));
  const bca = ugAll.filter(isBca);
  const pgAll = (cmsProgrammes ?? []).filter((p) => p.level === "PG");
  const mba = pgAll.filter(isMba);
  const mtech = pgAll.filter((p) => !isMba(p));

  const toRows = (list: DepartmentProgramme[]) =>
    list.map((p) => ({
      name: p.name,
      code: p.code || p.department?.shortName || p.department?.name || "",
      intake: p.intake,
      // Never inferred - a programme is only marked accredited if an admin
      // actually recorded it against that programme.
      nba: Boolean(p.accreditation),
    }));

  const sum = (list: DepartmentProgramme[]) => list.reduce((t, p) => t + (p.intake || 0), 0);
  const hasCms = (cmsProgrammes ?? []).length > 0;

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
          /* Was /site-images/classroom2.jpg, which has never existed in this
             project - the hero fell back to the flat navy behind it. */
          background-image: url('/banners/courses-intake.webp');
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
          style={{ backgroundImage: "url('/banners/courses-intake.webp')", position: "relative" }}
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
          {approvals.map((a, i) => (
            <div className="ci-approval-badge" key={a}>
              <AwardIcon />
              {/* The array fixes how many badges show; each label is editable
                  at Page Content -> Academics -> Courses & Intake. */}
              <CmsText section="academics.courses-intake" slot={`approvals.${i}`} />
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
                <CmsText section="academics.courses-intake" slot="eapcetCode" />
              </div>
              <p style={{ margin: "8px 0 0", opacity: 0.9 }}><CmsText section="academics.courses-intake" slot="use-this-code-during-eapcet" /></p>
            </div>
          </div>
        </section>

        {/* TABLES */}
        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            {hasCms ? (
              <>
                {ug.length > 0 && <CourseTable title="B.Tech (4 Years)" regulation="R23UG" totalIntake={sum(ug)} rows={toRows(ug)} />}
                {mtech.length > 0 && <CourseTable title="M.Tech (2 Years)" regulation="R22PG" totalIntake={sum(mtech)} rows={toRows(mtech)} />}
                {mba.length > 0 && <CourseTable title="MBA (2 Years)" regulation="R25" totalIntake={sum(mba)} rows={toRows(mba)} />}
                {/* Falls back to the approved intake until an admin adds the
                    programme in the CMS - see bcaRows. */}
                <CourseTable
                  id="bca"
                  title="BCA"
                  note={BCA_FROM_YEAR}
                  totalIntake={bca.length > 0 ? sum(bca) : 60}
                  rows={bca.length > 0 ? toRows(bca) : bcaRows}
                />
              </>
            ) : (
              /* Only while the CMS has no programmes at all, or the API is
                 unreachable - so the page never renders empty. */
              <>
                <CourseTable title="B.Tech (4 Years)" regulation="R23UG" totalIntake={600} rows={btechRows} />
                <CourseTable title="M.Tech (2 Years)" regulation="R22PG" totalIntake={54} rows={mtechRows} />
                <CourseTable title="MBA (2 Years)" regulation="R25" totalIntake={60} rows={mbaRows} />
                <CourseTable id="bca" title="BCA" note={BCA_FROM_YEAR} totalIntake={60} rows={bcaRows} />
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