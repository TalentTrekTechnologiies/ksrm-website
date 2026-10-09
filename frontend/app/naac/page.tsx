"use client";

import type { ReactNode } from "react";
import { mediaFile } from "@/lib/api-base";
import PageResources from "@/components/PageResources";
import CmsText, { usePageTextValue } from "@/components/CmsText";
import { useLiveData } from "@/lib/use-live-data";
import { resolveFileUrl } from "@/lib/api-base";
import { getNaacCertificate, NaacCertificate } from "@/lib/naac-certificate";
import { NAAC_FEEDBACK_FORMS, NAAC_TABS, NaacTabId } from "@/lib/naac-tabs";

/**
 * NAAC, laid out as the college's IQAC outline gives it: thirteen sections,
 * each a tab, in the outline's order (lib/naac-tabs.ts).
 *
 * Five of them - AQARs, Minutes, the Student Satisfaction Survey, Stakeholders
 * Feedback and Annual Reports - used to be tabs on the IQAC page. They moved
 * here with their page sections unchanged, so nothing filed under them had to
 * be re-filed; the upload screens only relabel where they show.
 *
 * Sections that had no section of their own (DVV, SSR, AAA, ...) each get one
 * ("naac.dvv" and so on) for new uploads, and also pull in what the old-site
 * migration left in the broad "naac" section, by group heading or title. The
 * "Other NAAC Documents" block at the foot leaves out exactly what those
 * sections claim, so no document is listed twice - the Examinations page
 * showed 1,885 documents twice for want of that.
 */

const criteria = [
  { n: 1, title: "Curricular Aspects", text: "Curriculum design, academic flexibility and enrichment programmes" },
  { n: 2, title: "Teaching-Learning & Evaluation", text: "Student enrollment, teaching methods and evaluation reforms" },
  { n: 3, title: "Research, Innovations & Extension", text: "Research output, patents, consultancy and extension activities" },
  { n: 4, title: "Infrastructure & Learning Resources", text: "Physical facilities, library, IT infrastructure" },
  { n: 5, title: "Student Support & Progression", text: "Student services, scholarships, career guidance and alumni" },
  { n: 6, title: "Governance, Leadership & Management", text: "Institutional governance, finance and administration" },
  { n: 7, title: "Institutional Values & Best Practices", text: "Gender equity, environmental consciousness and best practices" },
];

// Only documents that actually resolve. The SSR and the DVV Clarifications
// pointed at ksrmce.ac.in/NAAC.php and /DVV2.php - pages of the old site,
// which that domain no longer serves. Shown under Code of Conduct.
const codeOfConductDocs = [
  { name: "Institution Core Values", href: mediaFile(168) },
  { name: "Code of Professional Conduct", href: mediaFile(169) },
];

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

// Title and group patterns, as regex SOURCES (PageResources compiles them,
// case-insensitively). Each section pulls the migrated documents that match;
// "Other NAAC Documents" leaves out all of them.
//
// Minutes: "minutes", not "minute" - a NAAC document titled "1 One minute
// talk" is not a set of minutes; \bmom\b avoids "moment".
const MINUTES_TITLE = "minutes|\\bmom\\b|agenda";
const MINUTES_FALLBACK_SECTIONS = ["iqac", "iqac.aqar", "naac"];
const DVV_GROUP = "^dvv\\d*$";
const DVV_TITLE = "\\bdvv\\b";
const SSR_GROUP = "^ssr$";
const SSR_TITLE = "\\bssr\\b|self[\\s-]*study";
const AAA_TITLE = "academic.{0,30}audit|\\baaa\\b";
const CODE_TITLE = "code of (conduct|ethic)";
const POLICY_TITLE = "\\bpolic(y|ies)\\b|hand ?book";
const FEEDBACK_TITLE = "feedback";
const BEST_TITLE = "best practice";
const DISTINCT_TITLE = "distinctive";
const CLAIMED_TITLES = [DVV_TITLE, SSR_TITLE, MINUTES_TITLE, AAA_TITLE, CODE_TITLE, POLICY_TITLE, FEEDBACK_TITLE, BEST_TITLE, DISTINCT_TITLE].join("|");
const CLAIMED_GROUPS = "^(dvv\\d*|ssr)$";
const NAAC_ONLY = ["naac"];

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />
    </svg>
  );
}

/**
 * The accreditation badge: the NAAC logo, the grade, and the term.
 *
 * Clicking it opens the certificate. Which document that is, is decided in
 * lib/naac-certificate.ts, shared with the admin box that replaces it.
 */
function NaacBadge() {
  const found = useLiveData<NaacCertificate | null>(() => getNaacCertificate().catch(() => null), []);
  const certificate = found?.doc;

  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
      <img src="/naac.png" alt="NAAC" className="naac-logo" loading="lazy" decoding="async" />
      <div className="naac-grade">A+</div>
      <div className="naac-badge-detail">Accredited 25-10-2024</div>
      <div className="naac-badge-detail">Valid for 5 years, until 2029</div>
      {certificate && <div className="naac-badge-cta">View the certificate &rarr;</div>}
    </>
  );

  if (!certificate) return <div className="naac-badge">{inner}</div>;

  return (
    <a className="naac-badge naac-badge-link" href={resolveFileUrl(certificate.fileUrl)} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

function FeedbackFormLink({ index }: { index: number }) {
  const href = usePageTextValue("naac", `feedbackForms.${index}.href`).trim();
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="naac-feedback-btn">
      <CmsText section="naac" slot={`feedbackForms.${index}.label`} />
    </a>
  );
}

/** A card per fixed document: the AQAR years and the survey years. */
function YearCards({ items, title, subtitle }: { items: { label: string; href: string }[]; title: string; subtitle: string }) {
  return (
    <div className="naac-year-grid">
      {items.map((r) => (
        <a href={r.href} target="_blank" rel="noopener noreferrer" className="naac-year-card" key={r.label}>
          <div className="naac-year-pdf">PDF</div>
          <div style={{ flex: 1 }}>
            <div className="naac-year-title">{title} {r.label}</div>
            <div className="naac-year-sub">{subtitle}</div>
          </div>
        </a>
      ))}
    </div>
  );
}

/** One section of the outline: anchor, heading (the tab's own label), body. */
function NaacSection({ id, index, children }: { id: NaacTabId; index: number; children: ReactNode }) {
  return (
    <section id={id} className={`naac-section${index % 2 ? " naac-section-alt" : ""}`}>
      <div className="responsive-container">
        <h2 className="naac-h2"><CmsText section="naac" slot={`tabs.${id}`} /></h2>
        {children}
      </div>
    </section>
  );
}

const SOON = "Documents will be published here.";

/** What each section shows, in the outline's order. */
const SECTION_BODY: Record<NaacTabId, ReactNode> = {
  "accreditation-letter": <NaacBadge />,
  aqars: (
    <>
      <YearCards items={aqarReports} title="AQAR" subtitle="Annual Quality Assurance Report" />
      {/* Minutes filed under AQAR during the migration show under Minutes. */}
      <PageResources section="iqac.aqar" embedded leaveOut={{ titlePattern: MINUTES_TITLE }} />
    </>
  ),
  dvv: (
    <PageResources section="naac.dvv" embedded fallbackSections={NAAC_ONLY} fallbackGroupPattern={DVV_GROUP} fallbackTitlePattern={DVV_TITLE} emptyText={SOON} />
  ),
  ssr: (
    <PageResources section="naac.ssr" embedded fallbackSections={NAAC_ONLY} fallbackGroupPattern={SSR_GROUP} fallbackTitlePattern={SSR_TITLE} emptyText={SOON} />
  ),
  minutes: (
    <PageResources
      section="iqac.minutes"
      embedded
      fallbackSections={MINUTES_FALLBACK_SECTIONS}
      fallbackTitlePattern={MINUTES_TITLE}
      emptyText="Minutes of IQAC meetings will be published here."
    />
  ),
  survey: (
    <>
      <YearCards items={surveys} title="Survey" subtitle="Student Satisfaction Report" />
      <PageResources section="iqac.survey" embedded />
    </>
  ),
  aaa: <PageResources section="naac.aaa" embedded fallbackSections={NAAC_ONLY} fallbackTitlePattern={AAA_TITLE} emptyText={SOON} />,
  "code-of-conduct": (
    <>
      <ul className="naac-doc-list">
        {codeOfConductDocs.map((d, _i) => (
          <li className="naac-document-item" key={d.name}>
            <h4><CmsText section="naac" slot={`documents.${_i}.name`} /></h4>
            <a href={d.href} target="_blank" rel="noopener noreferrer" className="naac-document-link">
              <DownloadIcon />View
            </a>
          </li>
        ))}
      </ul>
      <PageResources section="naac.code-of-conduct" embedded fallbackSections={NAAC_ONLY} fallbackTitlePattern={CODE_TITLE} />
    </>
  ),
  policies: <PageResources section="naac.policies" embedded fallbackSections={NAAC_ONLY} fallbackTitlePattern={POLICY_TITLE} emptyText={SOON} />,
  feedback: (
    <>
      <div className="naac-feedback-row">
        {NAAC_FEEDBACK_FORMS.map((label, i) => (
          <FeedbackFormLink key={label} index={i} />
        ))}
      </div>
      <PageResources section="naac.feedback" embedded fallbackSections={NAAC_ONLY} fallbackTitlePattern={FEEDBACK_TITLE} emptyText={SOON} />
    </>
  ),
  "best-practices": <PageResources section="naac.best-practices" embedded fallbackSections={NAAC_ONLY} fallbackTitlePattern={BEST_TITLE} emptyText={SOON} />,
  distinctiveness: <PageResources section="naac.distinctiveness" embedded fallbackSections={NAAC_ONLY} fallbackTitlePattern={DISTINCT_TITLE} emptyText={SOON} />,
  "annual-reports": <PageResources section="iqac.annualreports" embedded maxVisible={10} emptyText={SOON} />,
};

export default function NAACPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .naac-hero {
          position: relative; background-image: url('/banners/naac.webp'); background-size: cover;
          background-position: center; background-color: #2B3490; min-height: 280px; display: flex;
          align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .naac-hero::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none;
        }
        .naac-hero > * { position: relative; z-index: 2; }

        /* Below the site's own sticky menu bar (48px, 56px under 900px wide),
           which otherwise covers this one completely once the page scrolls. */
        .naac-tabs { position: sticky; top: 48px; z-index: 100; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 14px 0; }
        .naac-tabs-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
        .naac-tab-btn {
          background: #2B3490; color: #D4A500; padding: 8px 14px; border-radius: 6px; font-weight: 600;
          font-size: 14px; border: none; cursor: pointer; white-space: nowrap;
        }
        .naac-tab-btn:hover, .naac-tab-btn:focus-visible { background: #1e2570; color: #fff; outline: none; }

        .naac-section { padding: 64px 0; background: #ffffff; scroll-margin-top: 130px; }
        @media (max-width: 900px) { .naac-tabs { top: 56px; } .naac-section { scroll-margin-top: 140px; } }
        .naac-section-alt { background: #f7f8fa; }
        .naac-h2 {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700;
          color: #2B3490; margin: 0 0 32px; text-align: center;
        }

        .naac-badge {
          background: #fff; border: 2px solid #D4A500; border-radius: 12px; padding: 40px; text-align: center;
          margin: 0 auto; max-width: 500px;
        }
        .naac-logo { width: 110px; height: auto; margin: 0 auto 18px; display: block; }
        .naac-badge-link { display: block; text-decoration: none; transition: transform .15s, box-shadow .15s; }
        .naac-badge-link:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(43,52,144,.16); }
        .naac-badge-cta { margin-top: 16px; color: #2B3490; font-weight: 700; font-size: 14px; }
        .naac-grade { font-family: 'Rajdhani', sans-serif; font-size: clamp(29px, 7.7vw, 48px); font-weight: 700; color: #D4A500; margin-bottom: 12px; }
        .naac-badge-detail { font-size: 17px; color: #555; margin: 8px 0; }

        .naac-year-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .naac-year-card {
          background: white; border: 1px solid #ddd; border-radius: 8px; padding: 18px; display: flex;
          align-items: center; gap: 14px; text-decoration: none; transition: border-color .2s, box-shadow .2s;
        }
        .naac-year-card:hover { border-color: #2B3490; box-shadow: 0 6px 18px rgba(43,52,144,.10); }
        .naac-year-pdf {
          background: #eef1ff; width: 44px; height: 44px; border-radius: 6px; display: flex; align-items: center;
          justify-content: center; font-size: 12px; font-weight: 700; color: #2B3490; flex-shrink: 0;
        }
        .naac-year-title { font-weight: 700; color: #2B3490; font-size: 14px; margin-bottom: 4px; }
        .naac-year-sub { font-size: 12px; color: #999; }

        .naac-doc-list { list-style: none; padding: 0; margin: 0 0 8px; }
        .naac-document-item {
          background: #f7f8fa; border: 1px solid #eef0f3; padding: 20px; border-radius: 8px; margin-bottom: 16px;
          display: flex; justify-content: space-between; align-items: center; gap: 12px; transition: all 0.2s;
        }
        .naac-document-item:hover { background: #eef1ff; border-color: #2B3490; }
        .naac-document-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 600; color: #1a1a2e; margin: 0; }
        .naac-document-link {
          background: #2B3490; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;
          font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .naac-document-link:hover { background: #D4A500; color: #2B3490; }

        .naac-feedback-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-bottom: 8px; }
        .naac-feedback-row:empty { display: none; }
        .naac-feedback-btn {
          background: #2B3490; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;
          font-size: 15px; font-weight: 600; display: inline-block;
        }

        .naac-criteria-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0 0; }
        .naac-criteria-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; transition: all 0.2s; }
        .naac-criteria-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.1); border-color: #D4A500; }
        .naac-criteria-number { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #D4A500; margin-bottom: 12px; }
        .naac-criteria-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .naac-criteria-card p { color: #666; font-size: 15px; line-height: 1.6; margin: 0; }

        @media (max-width: 1024px) { .naac-criteria-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .naac-criteria-grid { grid-template-columns: 1fr; }
          .naac-document-item { flex-direction: column; align-items: flex-start; }
          .naac-section { padding: 48px 0; }
        }
      `}</style>

      <section className="naac-hero">
        <div className="responsive-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="naac" slot="naac" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="naac" slot="national-assessment-and-accreditation-council" /></p>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0, textAlign: "center" }}><CmsText section="naac" slot="k-s-r-m-college" multiline /></p>
          </div>
        </div>
      </section>

      <nav className="naac-tabs" aria-label="NAAC sections">
        <div className="responsive-container">
          <div className="naac-tabs-row">
            {NAAC_TABS.map((t) => (
              <button key={t.id} type="button" className="naac-tab-btn" onClick={() => scrollTo(t.id)}>
                <CmsText section="naac" slot={`tabs.${t.id}`} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {NAAC_TABS.map((t, i) => (
        <NaacSection key={t.id} id={t.id} index={i}>
          {SECTION_BODY[t.id]}
        </NaacSection>
      ))}

      <section style={{ padding: "64px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="naac-h2"><CmsText section="naac" slot="naac-accreditation-criteria" /></h2>
          <div className="naac-criteria-grid">
            {criteria.map((c, _i) => (
              <div className="naac-criteria-card" key={c.n}>
                <div className="naac-criteria-number">Criterion {c.n}</div>
                <h3><CmsText section="naac" slot={`criteria.${_i}.title`} /></h3>
                <p><CmsText section="naac" slot={`criteria.${_i}.text`} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Whatever no section above claims - the criteria-wise evidence the
          old site was organised by. */}
      <PageResources
        section="naac"
        docsTitle="Other NAAC Documents"
        leaveOut={{ groupPattern: CLAIMED_GROUPS, titlePattern: CLAIMED_TITLES }}
      />
    </main>
  );
}
