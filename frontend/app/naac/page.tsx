"use client";

import { mediaFile } from "@/lib/api-base";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import { useLiveData } from "@/lib/use-live-data";
import { resolveFileUrl } from "@/lib/api-base";

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
// which that domain no longer serves, so both returned the new site's own
// shell and the visitor got the homepage back instead of a report. "AQAR
// 2023-24" was href="#", which went nowhere at all.
//
// They are not replaced with guesses: the real files go in Page Content ->
// NAAC and appear in the documents block at the foot of this page.
const documents = [
  { name: "Institution Core Values", href: mediaFile(168) },
  { name: "Code of Professional Conduct", href: mediaFile(169) },
];

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
 * Clicking it opens the certificate. That document comes from the CMS rather
 * than a hardcoded path - the two links this page used to carry pointed at the
 * old site and returned the homepage - so it becomes a link only once a
 * certificate is actually uploaded.
 */
function NaacBadge() {
  const docs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "naac").catch(() => [] as Download[]),
    [],
  );
  const certificate = (docs ?? []).find((d) => /certificat|accreditation/i.test(d.title)) ?? (docs ?? [])[0];

  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
      <img src="/naac.png" alt="NAAC" className="naac-logo" />
      <div className="naac-grade">A+</div>
      <div className="naac-badge-detail">Accredited 25-10-2024</div>
      <div className="naac-badge-detail">Valid for 5 years, until 2029</div>
      {certificate && <div className="naac-badge-cta">View the certificate &rarr;</div>}
    </>
  );

  if (!certificate) return <div className="naac-badge">{inner}</div>;

  return (
    <a
      className="naac-badge naac-badge-link"
      href={resolveFileUrl(certificate.fileUrl)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  );
}

export default function NAACPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .naac-hero {
          position: relative; background-image: url('/banners/naac.png'); background-size: cover;
          background-position: center; background-color: #2B3490; min-height: 280px; display: flex;
          align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .naac-hero::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none;
        }
        .naac-hero > * { position: relative; z-index: 2; }
        .naac-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .naac-breadcrumb a { color: #D4A500; text-decoration: none; }
        .naac-badge {
          background: #f7f8fa; border: 2px solid #D4A500; border-radius: 12px; padding: 40px; text-align: center;
          margin: 48px auto; max-width: 500px;
        }
        .naac-logo { width: 110px; height: auto; margin: 0 auto 18px; display: block; }
        .naac-badge-link { display: block; text-decoration: none; transition: transform .15s, box-shadow .15s; }
        .naac-badge-link:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(43,52,144,.16); }
        .naac-badge-cta { margin-top: 16px; color: #2B3490; font-weight: 700; font-size: 14px; }
        .naac-grade { font-family: 'Rajdhani', sans-serif; font-size: clamp(29px, 7.7vw, 48px); font-weight: 700; color: #D4A500; margin-bottom: 12px; }
        .naac-badge-detail { font-size: 17px; color: #555; margin: 8px 0; }
        .naac-criteria-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; }
        .naac-criteria-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; transition: all 0.2s; }
        .naac-criteria-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.1); border-color: #D4A500; }
        .naac-criteria-number { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #D4A500; margin-bottom: 12px; }
        .naac-criteria-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .naac-criteria-card p { color: #666; font-size: 15px; line-height: 1.6; margin: 0; }
        .naac-document-item {
          background: #f7f8fa; border: 1px solid #eef0f3; padding: 20px; border-radius: 8px; margin-bottom: 16px;
          display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;
        }
        .naac-document-item:hover { background: #eef1ff; border-color: #2B3490; }
        .naac-document-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 600; color: #1a1a2e; margin: 0; }
        .naac-document-link {
          background: #2B3490; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;
          font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .naac-document-link:hover { background: #D4A500; color: #2B3490; }
        .naac-cta-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 48px auto; max-width: 600px; }
        .naac-cta-button {
          background: #2B3490; color: #fff; padding: 20px 40px; border-radius: 8px; font-weight: 700;
          text-decoration: none; text-align: center; transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
        }
        .naac-cta-button:hover { background: #D4A500; color: #2B3490; transform: translateY(-2px); }

        @media (max-width: 1024px) { .naac-criteria-grid { grid-template-columns: repeat(2, 1fr); } .naac-cta-buttons { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .naac-criteria-grid { grid-template-columns: 1fr; }
          .naac-document-item { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <section className="naac-hero">
        <div className="responsive-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="naac" slot="naac" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="naac" slot="national-assessment-and-accreditation-council" /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0, textAlign: "center" }}><CmsText section="naac" slot="k-s-r-m-college" multiline /></p>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          {/* The badge described the superseded cycle: B++ at 2.88, which is
              the B++ band, expiring 2026. The current award is A+ for five
              years from 25-10-2024.

              The CGPA is gone. It was carried over from the old cycle and the
              certificate quotes only the grade and the term, so the figure was
              never confirmed - better absent than wrong on the page that
              exists to state the accreditation.

              The logo links to the certificate when one is uploaded (Documents
              -> NAAC, with "certificate" in the title). Until then it is a
              plain badge rather than a link that goes nowhere. */}
          <NaacBadge />
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px", textAlign: "center" }}><CmsText section="naac" slot="naac-accreditation-criteria" /></h2>
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

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}><CmsText section="naac" slot="key-documents" /></h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "32px 0" }}>
            {documents.map((d, _i) => (
              <li className="naac-document-item" key={d.name}>
                <h4><CmsText section="naac" slot={`documents.${_i}.name`} /></h4>
                <a href={d.href} target="_blank" rel="noopener noreferrer" className="naac-document-link">
                  <DownloadIcon />View
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "#ffffff", textAlign: "center" }}>
        <div className="responsive-container">
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}><CmsText section="naac" slot="explore-naac-documentation" /></h3>
          {/* The two buttons here linked to the same dead old-site pages as
              the list above. Removed rather than repointed at a guess. */}
          <p style={{ color: "#666", fontSize: 15, margin: 0 }}>
            The Self Study Report, DVV Clarifications and AQAR reports are published in the documents below.
          </p>
        </div>
      </section>
      <PageResources section="naac" />
    </main>
  );
}
