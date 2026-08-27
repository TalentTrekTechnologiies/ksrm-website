"use client";

import { Fragment } from "react";
import { mediaFile } from "@/lib/api-base";
import PlacedCommittees from "@/components/committees/PlacedCommittees";
import PageResources from "@/components/PageResources";
import CmsText, { usePageTextValue } from "@/components/CmsText";

const missionFunctions = [
  "Development of quality benchmarks",
  "Creating learner-centric environment",
  "Feedback from students & parents",
  "Dissemination of quality parameters",
  "Organization of workshops",
  "Documentation of improvements",
  "Quality Culture development",
  "Preparation of AQAR",
];

const strategies = [
  "Timely and progressive performance of academic, administrative tasks",
  "Relevance and quality of academic and research programmes",
  "Equitable access and affordability for all sections",
  "Optimization of modern methods of teaching and learning",
  "Credibility of evaluation procedures",
];

const qualityPolicy = [
  "By Imparting truly Global Focused Education",
  "By Creating World Class Professionals",
  "By Establishing Synergic Relationships with Research hub and Society",
  "By Developing State-of-art Infrastructure and Well Endowed Faculty",
  "By Imparting Knowledge Through Team Work and Incessant Effort",
];

const composition = [
  { name: "Prof. T. Nageswara Prasad", designation: "Principal", role: "Chairperson" },
  { name: "Mr. K. Madan Mohan Reddy", designation: "Vice-Chairman", role: "Management" },
  { name: "Prof. T. Nageswara Prasad", designation: "Dean, Academics", role: "Member" },
  { name: "Dr. M. Venkatanarayana", designation: "Dean, Research & Development", role: "Member" },
  { name: "Mr. A. Ramprakash Reddy", designation: "Dean, Faculty Affairs", role: "Member" },
  { name: "Dr. C. Ravindra Murthy", designation: "Dean, Students Affairs", role: "Member" },
  { name: "Mr. R. Nagaraju", designation: "Dean, Training and Placements", role: "Member" },
  { name: "Dr. N. Amaranatha Reddy", designation: "Dean, Alumni", role: "Member" },
  { name: "Dr. M. Venugopal", designation: "Dean, Industry Relations", role: "Member" },
  { name: "Dr. V. Giridhar", designation: "Dean, Industry Institution Interaction cell", role: "Member" },
  { name: "Dr. T. Elia", designation: "Dean, Innovation and Entrepreneurship", role: "Member" },
  { name: "Dr. M. V. Ravi Kishore Reddy", designation: "Controller of Examinations", role: "Member" },
  { name: "Dr. G. Chennakesava Reddy", designation: "HoD, CE", role: "Member" },
  { name: "Dr. A. Sudhakar", designation: "HoD, EEE", role: "Member" },
  { name: "Dr. D. Ravikanth", designation: "HoD, ME", role: "Member" },
  { name: "Dr. B. Bhaskar Reddy", designation: "HoD, ECE", role: "Member" },
  { name: "Dr. V. Lokeswara Reddy", designation: "HoD, CSE", role: "Member" },
  { name: "Dr. V. Ramachandra Reddy", designation: "HoD, H&S", role: "Member" },
  { name: "Dr. N. Suhasini", designation: "HoD, MBA", role: "Member" },
  { name: "Mrs. G. Sireesha", designation: "Manager, Broadcom, Bangalore", role: "Member" },
  { name: "Mr. S. Guru Sankar", designation: "MD, Chaitanya Chemicals, Kadapa (Industry)", role: "Member" },
  { name: "Mr. K. Subramanyam", designation: "Adolescent Health Coordinator, Mydukur, Kadapa (Dist.) (Parent)", role: "Member" },
  { name: "Mr. M. Vara Prasad Reddy", designation: "Deputy Executive Engineer, M.I Subdivision, Kadapa. (Alumni)", role: "Member" },
  { name: "Mr. M. Obul Das", designation: "DAS Educational & Welfare Society (NGO)", role: "Member" },
  { name: "Ms. K. Shanmukhi Lasya", designation: "Student", role: "Member" },
  { name: "Mr. B Bala Subramanyam", designation: "Student", role: "Member" },
  { name: "Ms. P. Sharmila", designation: "Student", role: "Member" },
  { name: "Dr. V. Vijaya Kishore", designation: "Prof., ECE", role: "Dean / Coordinator" },
  { name: "Dr. I. Srinivasula Reddy", designation: "Asso. Prof., CE", role: "Dy. Dean" },
  { name: "Mr. P. Suresh Praveen Kumar", designation: "Asst.  Prof., CE", role: "Asso. Dean" },
  { name: "Dr. G. Srihari", designation: "Prof., ECE", role: "Asso. Dean" },
  { name: "Mr. A. HariKrishna", designation: "Asst. Prof., ME", role: "Asso. Dean" },
  { name: "Dr. K. Pavan Kumar", designation: "Asso. Prof., ECE", role: "Asso. Dean" },
  { name: "Mrs. B. Swetha", designation: "Asst. Prof., CSE", role: "Asso. Dean" },
  { name: "Dr. M. Vijaya Bhaskar Reddy", designation: "Asst. Prof., H&S", role: "Asso. Dean" },
];

const compositionGroups: Record<number, string> = {
  0: "Chairperson: Head of the Institution",
  1: "Management Members",
  2: "Senior Administrative Officers",
  12: "Senior Teachers",
  19: "Employer / Industry / Stake holder / Members",
  22: "Alumni / Local Society/ Student",
  27: "IQAC Core Team",
};

/**
 * Where the minutes actually are, as opposed to where they belong.
 *
 * Nothing has ever been filed under "iqac.minutes" - the migration brought the
 * PDFs across but not the page section they belong to, so the IQAC MOM papers
 * sit under "naac" and the committee minutes under "iqac.aqar" and "iqac".
 * The section therefore rendered empty under ten year buttons that did not
 * open, which is what "the minutes are not opening" was.
 *
 * Same mechanism the Examinations page uses for the same reason: scan the
 * broad sections documents were bulk-uploaded to, and keep the ones whose
 * title says what they are. Re-filing them in the CMS makes this redundant,
 * and nothing here breaks when that happens - a document filed correctly is
 * found by the section, not the fallback.
 */
const MINUTES_FALLBACK_SECTIONS = ["iqac", "iqac.aqar", "naac"];

/**
 * Deliberately "minutes" and not "minute": a NAAC document titled "1 One
 * minute talk" is not a set of minutes. mom likewise avoids matching
 * "moment" or a word ending in "mom".
 */
const MINUTES_TITLE = "minutes|\\bmom\\b|agenda";

const aqarReports = [
  { label: "2021-2022", href: mediaFile(229) },
  { label: "2020-2021", href: mediaFile(226) },
  { label: "2019-2020", href: mediaFile(230) },
  { label: "2018-2019", href: mediaFile(221) },
  { label: "2017-2018", href: mediaFile(222) },
  { label: "2016-2017", href: mediaFile(224) },
  { label: "2015-2016", href: mediaFile(225) },
  { label: "2014-2015", href: mediaFile(227) },
  { label: "2013-2014", href: mediaFile(228) },
];

const surveys = [
  { label: "2023-2024", href: mediaFile(220) },
  { label: "2021-2022", href: mediaFile(223) },
  { label: "2020-2021", href: mediaFile(232) },
  { label: "2019-2020", href: mediaFile(219) },
  { label: "2018-2019", href: mediaFile(231) },
];

// Labels only. Each form's URL comes from Page Content -> IQAC -> "Feedback
// form links", and a form with no URL is not rendered at all - see
// FeedbackFormLink below. These used to point at AlumniFeedback.php and its
// four siblings on the old site; that domain serves this site now, so all
// five handed the visitor the homepage back instead of a form.
const feedbackForms = [
  { label: "Alumni Feedback" },
  { label: "Student Feedback" },
  { label: "Parent Feedback" },
  { label: "Teacher Feedback" },
  { label: "Employer Feedback" },
];

function FeedbackFormLink({ index }: { index: number }) {
  const href = usePageTextValue("iqac", `feedbackForms.${index}.href`).trim();
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="iqac-feedback-btn">
      <CmsText section="iqac" slot={`feedbackForms.${index}.label`} />
    </a>
  );
}


/**
 * `slot` is the tab's permanent id in Page Content, not its position here.
 *
 * These labels are edited as tabs.N.label, and N used to be the array index.
 * Removing the Apex Bodies tab therefore slid Contact up into Apex Bodies'
 * wording - the tab row still read "Apex Bodies" with the section gone. Pinned
 * ids mean a tab can be removed or reordered without disturbing the rest; 5,
 * which was Apex Bodies, stays retired.
 */
const tabs = [
  { slot: 0, label: "About IQAC", id: "about" },
  { slot: 1, label: "Composition", id: "composition" },
  { slot: 2, label: "Minutes & Agenda", id: "minutes" },
  { slot: 3, label: "AQAR Reports", id: "aqar" },
  { slot: 4, label: "Student Survey", id: "survey" },
  { slot: 7, label: "Annual Reports", id: "annual-reports" },
  { slot: 6, label: "Contact", id: "contact" },
];

export default function IQACPage() {
  const rows = composition;

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .iqac-tab-btn {
          background: #2B3490; color: #D4A500; padding: 8px 16px; border-radius: 6px; font-weight: 600;
          font-size: 14px; border: none; cursor: pointer; text-decoration: none; white-space: nowrap;
        }
        .iqac-about-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-bottom: 48px; }
        @media (max-width: 1024px) { .iqac-about-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
        @media (max-width: 640px) { .iqac-about-grid { grid-template-columns: 1fr; gap: 20px; } }

        .iqac-table-wrapper { overflow-x: auto; }
        .iqac-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
        .iqac-table thead tr { background: #2B3490; color: white; }
        .iqac-table th { padding: 14px 16px; text-align: left; font-size: 14px; font-weight: 700; }
        .iqac-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
        .iqac-group-row td {
          background: #eef1ff; color: #2B3490; font-weight: 800; font-size: 14px;
          font-family: var(--font-rajdhani), sans-serif; letter-spacing: .2px;
        }
        @media (max-width: 640px) { .iqac-table th, .iqac-table td { padding: 10px 12px; font-size: 13px; } }

        .iqac-doc-link {
          background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; display: flex;
          align-items: center; gap: 16px; text-decoration: none; transition: all 0.2s;
        }
        .iqac-feedback-btn {
          background: #2B3490; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;
          font-size: 15px; font-weight: 600; display: inline-block;
        }
        .iqac-contact-link {
          display: flex; gap: 12px; padding: 10px 16px; background: rgba(255,230,25,0.1); border-radius: 4px;
          color: #2B3490; font-weight: 600; font-size: 15px; text-decoration: none; margin-bottom: 8px;
        }
      `}</style>

      {/* HERO */}
      <section style={{ backgroundImage: "url('/banners/iqac.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#2B3490", padding: "80px 0", color: "white", position: "relative", minHeight: 320, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
          <div className="responsive-container">
            <div style={{ display: "inline-block", background: "#D4A500", color: "#2B3490", padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
              Quality Assurance
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}><CmsText section="iqac" slot="internal-quality-assurance-cell" /></h1>
            <p style={{ fontSize: 20, fontWeight: 600, color: "#D4A500", margin: "0 0 24px" }}><CmsText section="iqac" slot="iqac-k-s-r-m" /></p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, maxWidth: 700, margin: 0 }}><CmsText section="iqac" slot="iqac-was-established-on-18" multiline /></p>
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "16px 0", overflowX: "auto" }}>
        <div className="responsive-container">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {tabs.map((t) => (
              <button key={t.id} className="iqac-tab-btn" onClick={() => scrollTo(t.id)}><CmsText section="iqac" slot={`tabs.${t.slot}.label`} /></button>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}><CmsText section="iqac" slot="about-iqac" /></h2>
          <div className="iqac-about-grid">
            <div style={{ background: "#f9f9f9", borderTop: "4px solid #D4A500", borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}><CmsText section="iqac" slot="aim" /></h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 12, display: "flex", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: "#D4A500", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  To develop a system for conscious, consistent and catalytic action to improve academic and
                  administrative performance.
                </li>
                <li style={{ fontSize: 14, color: "#555", lineHeight: 1.8, display: "flex", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: "#D4A500", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  To promote measures for institutional functioning towards quality enhancement through
                  internalization of quality culture.
                </li>
              </ul>
            </div>
            <div style={{ background: "#f9f9f9", borderTop: "4px solid #2B3490", borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}><CmsText section="iqac" slot="strategies" /></h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {strategies.map((s) => (
                  <li key={s} style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 8, display: "flex", gap: 8 }}>
                    <span style={{ width: 5, height: 5, background: "#D4A500", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: "#f9f9f9", borderTop: "4px solid #e63946", borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}><CmsText section="iqac" slot="functions" /></h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {missionFunctions.map((f) => (
                  <li key={f} style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 6, display: "flex", gap: 8 }}>
                    <span style={{ width: 4, height: 4, background: "#D4A500", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #2B3490, #1a1d4d)", borderRadius: 12, padding: 40, color: "white" }}>
            <h3 style={{ color: "#D4A500", fontSize: 22, fontWeight: 700, marginBottom: 16 }}><CmsText section="iqac" slot="quality-policy" /></h3>
            <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.8 }}><CmsText section="iqac" slot="k-s-r-m-is" /></p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {qualityPolicy.map((q) => (
                <li key={q} style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: "#D4A500", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* COMPOSITION */}
      <section id="composition" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}><CmsText section="iqac" slot="iqac-composition-35-members" /></h2>
          <div className="iqac-table-wrapper">
            <table className="iqac-table">
              <thead>
                <tr><th>S.No</th><th>Name</th><th>Designation</th><th>Designation in IQAC</th></tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <Fragment key={i}>
                    {compositionGroups[i] && (
                      <tr className="iqac-group-row" key={`group-${i}`}>
                        <td colSpan={4}>{compositionGroups[i]}</td>
                      </tr>
                    )}
                    <tr style={{ background: i % 2 === 0 ? "white" : "#f9f9f9" }}>
                      <td style={{ color: "#2B3490", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ color: "#333" }}>
                        {c.name}
                      </td>
                      <td style={{ color: "#666" }}>
                        {c.designation}
                      </td>
                      <td>
                        {c.role === "Chairperson" || c.role === "Dean / Coordinator" ? (
                          <span style={{ background: "#2B3490", color: "#D4A500", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                            {c.role}
                          </span>
                        ) : c.role}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          {/* Anything uploaded to "IQAC -> Composition" in Documents. */}
          <PageResources section="iqac.composition" embedded />
      </section>

      {/* MINUTES */}
      <section id="minutes" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}><CmsText section="iqac" slot="minutes-of-meeting" /></h2>
          {/* The ten year buttons that used to be here rendered a chevron and
              did nothing at all - no handler, no panel, no documents behind
              them. They were a mock-up of an accordion, so every visitor who
              clicked a year got no response and concluded the minutes were
              broken. Real documents replace them; PageResources already groups
              by the document's group label, so a year heading comes from the
              upload rather than from a list hardcoded here that stopped at
              2022-23 regardless of what had been published since. */}
          <PageResources
            section="iqac.minutes"
            fallbackSections={MINUTES_FALLBACK_SECTIONS}
            fallbackTitlePattern={MINUTES_TITLE}
            emptyText="Minutes of IQAC meetings will be published here."
          />
        </div>
      </section>

      {/* AQAR */}
      <section id="aqar" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}><CmsText section="iqac" slot="aqar-reports" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {aqarReports.map((r) => (
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="iqac-doc-link" key={r.label}>
                <div style={{ background: "#eef1ff", width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#2B3490", flexShrink: 0 }}>PDF</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#2B3490", fontSize: 14, marginBottom: 4 }}>AQAR Report {r.label}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>Annual Quality Assurance Report</div>
                </div>
                <div style={{ fontSize: 18, color: "#D4A500" }}>Download</div>
              </a>
            ))}
          </div>
        </div>
          {/* Anything uploaded to "IQAC -> Aqar" in Documents. */}
          <PageResources section="iqac.aqar" embedded />
      </section>

      {/* SURVEY */}
      <section id="survey" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}><CmsText section="iqac" slot="student-satisfaction-survey" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 48 }}>
            {surveys.map((s) => (
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="iqac-doc-link" key={s.label}>
                <div style={{ background: "#eef1ff", width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#2B3490", flexShrink: 0 }}>PDF</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#2B3490", fontSize: 14, marginBottom: 4 }}>Survey {s.label}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>Student Satisfaction Report</div>
                </div>
                <div style={{ fontSize: 18, color: "#D4A500" }}>Download</div>
              </a>
            ))}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 20, textAlign: "center" }}><CmsText section="iqac" slot="feedback-forms" /></h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {feedbackForms.map((f, _i) => (
              <FeedbackFormLink key={f.label} index={_i} />
            ))}
          </div>
        </div>
          {/* Anything uploaded to "IQAC -> Survey" in Documents. */}
          <PageResources section="iqac.survey" embedded />
      </section>

      {/* ANNUAL REPORTS - separate from AQAR Reports above (Annual Quality
          Assurance Report is a distinct, NAAC-specific document from the
          institution's general Annual Report). Three documents that had been
          filed under AQAR by title-guessing during migration were moved here
          to this pageSection ("iqac.annualreports") since that is what they
          actually are. */}
      <section id="annual-reports" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}><CmsText section="iqac" slot="annual-reports-heading" /></h2>
          <PageResources section="iqac.annualreports" embedded maxVisible={10} />
        </div>
      </section>

      {/* The Governing Body, Academic Council and Finance Committee used to sit
          here behind an "Apex Bodies" tab. They are the college's governance,
          not its quality assurance, and now live on About - which is where the
          menu had always pointed. The "IQAC -> Apex Bodies" upload target is
          gone with the section; nothing had been filed under it. */}

      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}><CmsText section="iqac" slot="contact-iqac" /></h2>
          <div style={{ maxWidth: 600, margin: "0 auto", border: "2px solid #D4A500", borderRadius: 12, padding: 40 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#2B3490", marginBottom: 8 }}>Internal Quality Assurance Cell (IQAC)</div>
            <div style={{ fontSize: 15, color: "#666", marginBottom: 32 }}>K.S.R.M. College of Engineering (Autonomous)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="mailto:dean.iqac@ksrmce.ac.in" className="iqac-contact-link"><span>Email</span><span>dean.iqac@ksrmce.ac.in</span></a>
              <a href="mailto:iqac@ksrmce.ac.in" className="iqac-contact-link"><span>Email</span><span>iqac@ksrmce.ac.in</span></a>
              <a href="tel:+918499918303" className="iqac-contact-link"><span>Phone</span><span>+91 8499918303</span></a>
              <a href="tel:+918985717578" className="iqac-contact-link"><span>Phone</span><span>+91 8985717578</span></a>
            </div>
          </div>
        </div>
      </section>
      {/* Any committee the CMS points at this page - see PlacedCommittees.
          Renders nothing until one is pointed here. */}
      <PlacedCommittees placement="IQAC" heading="Committees" />

      <PageResources section="iqac" />
    </main>
  );
}
