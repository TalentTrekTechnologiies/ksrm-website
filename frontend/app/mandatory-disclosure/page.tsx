import type { Metadata } from "next";
import PageResources from "@/components/PageResources";
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Mandatory Disclosure",
  description: "Statutory disclosures for K.S.R.M. College of Engineering, Kadapa - AICTE mandatory disclosure and EOA letters, NAAC and NBA accreditation status, UGC autonomy, governance policies and RTI information.",
  path: "/mandatory-disclosure",
});

/**
 * Mandatory Disclosure.
 *
 * Statutory paperwork the college is required to publish: AICTE disclosures and
 * EOA letters, accreditation and autonomy letters, governance policies, RTI
 * rules. The previous site had this as aicte.php and none of it had been
 * carried over, so the documents were unreachable here.
 *
 * The page is deliberately just a heading and PageResources: every document is
 * a CMS record grouped by heading, so the exam and admin offices can add next
 * year's EOA letter themselves without this file changing.
 */
export default function MandatoryDisclosurePage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .md-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .md-container { padding: 0 20px; } }
        .md-hero { position: relative; background-image: url('/site-images/blocktop.webp'); background-size: cover; background-position: center; background-color: #2B3490; padding: 92px 0; overflow: hidden; }
        .md-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,26,74,0.74) 0%, rgba(20,26,74,0.88) 100%); }
        .md-hero > * { position: relative; z-index: 2; }
        .md-note { background: #f7f8fa; border-left: 4px solid #2B3490; border-radius: 0 10px 10px 0; padding: 18px 22px; margin: 40px 0 0; color: #555; font-size: 15px; line-height: 1.7; }
      `}</style>

      <section className="md-hero">
        <div className="md-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
            Mandatory Disclosure
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "14px 0 0", maxWidth: 760 }}>
            Statutory information published in accordance with AICTE, UGC and JNTUA requirements.
          </p>
        </div>
      </section>

      <section style={{ padding: "56px 0 8px" }}>
        <div className="md-container">
          <p className="md-note" style={{ marginTop: 0 }}>
            All documents below are published by K.S.R.M. College of Engineering. For any clarification,
            or to request information under the Right to Information Act, please write to{" "}
            <a href="mailto:principal@ksrmce.ac.in" style={{ color: "#2B3490", fontWeight: 600 }}>
              principal@ksrmce.ac.in
            </a>
            .
          </p>
        </div>
      </section>

      <PageResources section="mandatory-disclosure" docsTitle="Disclosure Documents" />
    </main>
  );
}
