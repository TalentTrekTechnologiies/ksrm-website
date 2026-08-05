import PageResources from "@/components/PageResources";
import PlacedCommittees from "@/components/committees/PlacedCommittees";
import CmsText from "@/components/CmsText";
import CommitteeRoster from "@/components/committees/CommitteeRoster";

﻿import Link from "next/link";

export const metadata = {
  title: "Grievance Redressal | K.S.R.M. College of Engineering",
  description:
    "K.S.R.M. College of Engineering grievance redressal system with fair, transparent and timely resolution for student complaints.",
};

const grievanceTypes = [
  {
    title: "Academic Grievances",
    description:
      "Issues related to examinations, evaluations, course content, faculty behavior, or academic standards.",
  },
  {
    title: "Hostel-Related Issues",
    description:
      "Problems concerning hostel facilities, management, discipline, or accommodation.",
  },
  {
    title: "Financial Matters",
    description:
      "Issues related to fee structure, refunds, scholarships, or financial irregularities.",
  },
  {
    title: "Disciplinary Concerns",
    description:
      "Appeal against disciplinary action or concerns about disciplinary processes.",
  },
  {
    title: "Harassment & Bullying",
    description:
      "Any form of harassment, bullying, discrimination, or unfair treatment.",
  },
  {
    title: "Infrastructure & Services",
    description:
      "Issues related to campus facilities, maintenance, canteen, or support services.",
  },
];

const processSteps = [
  {
    title: "File Complaint",
    description:
      "Submit grievance in writing to the Grievance Officer with detailed description and supporting documents.",
  },
  {
    title: "Acknowledgement",
    description:
      "Grievance Officer acknowledges receipt within 7 working days with reference number.",
  },
  {
    title: "Preliminary Investigation",
    description:
      "Initial review to verify if grievance is valid and determine appropriate resolution pathway.",
  },
  {
    title: "Hearing",
    description:
      "Opportunity for complainant to present case and provide evidence before the committee.",
  },
  {
    title: "Resolution",
    description:
      "Committee deliberates and issues written resolution with recommendations within 30 days.",
  },
  {
    title: "Appeal",
    description:
      "Unsatisfied parties can file appeal within 15 days for higher authority review.",
  },
];

const timeline = [
  { label: "Acknowledgement", value: "7 working days" },
  { label: "Resolution", value: "30 working days" },
  { label: "Appeal", value: "15 working days" },
];

export default function GrievanceRedressalPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      {/* Hero */}
      <section
        style={{
          backgroundImage: "url('/banners/grievance banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 40px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1760, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          ><CmsText section="grievance" slot="grievance-redressal" /></h1>
          <p style={{ fontSize: 18, margin: "0 0 24px", opacity: 0.95 }}><CmsText section="grievance" slot="fair-transparent-resolution" /></p>
          <div style={{ display: "flex", gap: 8, fontSize: 14, justifyContent: "center" }}>
            <Link href="/" style={{ color: "#D4A500", textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ color: "#D4A500" }}>/</span>
            <Link href="/campus-life" style={{ color: "#D4A500", textDecoration: "none" }}>
              Campus Life
            </Link>
            <span style={{ color: "#D4A500" }}>/</span>
            <span>Grievance Redressal</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{ padding: "56px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <p
            style={{
              color: "#555",
              fontSize: 16,
              lineHeight: 1.8,
              margin: 0,
              maxWidth: 820,
            }}
          ><CmsText section="grievance" slot="k-s-r-m-college" multiline /></p>
        </div>
      </section>

      {/* Policy statement */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              background: "#2B3490",
              color: "#fff",
              padding: 28,
              borderLeft: "4px solid #D4A500",
              borderRadius: 8,
              fontSize: 15,
              lineHeight: 1.8,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>ⓘ</span>
            <span>
              Every student has the right to file a grievance without fear
              of victimization or retaliation. The college is committed to
              providing a fair and transparent process for grievance
              redressal. All grievances will be treated with utmost
              confidentiality and resolved within the stipulated timelines.
              Any form of victimization for filing a genuine grievance is
              strictly prohibited and will result in disciplinary action.
            </span>
          </div>
        </div>
      </section>

      {/* Grievance Types */}
      <section style={{ padding: "72px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 40px",
            }}
          ><CmsText section="grievance" slot="types-of-grievances-addressed" /></h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {grievanceTypes.map((type) => (
              <div
                key={type.title}
                style={{
                  background: "#fff",
                  border: "1px solid #eef0f3",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#2B3490",
                    margin: "0 0 12px",
                  }}
                >
                  {type.title}
                </h3>
                <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6 }}>
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 40px",
            }}
          ><CmsText section="grievance" slot="grievance-resolution-process" /></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {processSteps.map((step, i) => (
              <div key={step.title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 44,
                    height: 44,
                    background: "#D4A500",
                    color: "#2B3490",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      margin: "0 0 4px",
                    }}
                  >
                    {step.title}
                  </h4>
                  <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              marginTop: 40,
            }}
          >
            {timeline.map((t) => (
              <div
                key={t.label}
                style={{
                  background: "#f4f3ef",
                  padding: 20,
                  borderRadius: 8,
                  textAlign: "center",
                  borderTop: "3px solid #2B3490",
                }}
              >
                <h4
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    margin: "0 0 8px",
                  }}
                >
                  {t.label}
                </h4>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2B3490",
                    margin: 0,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                  }}
                >
                  {t.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grievance Redressal Committee - driven by Admin -> Committees, type
          "Grievance Redressal". That type could be saved in the CMS but was
          rendered on no page at all, so anyone who entered the committee there
          watched it vanish. */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              fontFamily: "var(--font-rajdhani), sans-serif",
              color: "#2B3490",
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            <CmsText section="grievance" slot="grievance-redressal-committee" />
          </h2>
          <CommitteeRoster type="GRIEVANCE_REDRESSAL" emptyLabel="The committee roster will be published here shortly." />
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "72px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
              borderRadius: 12,
              padding: 40,
              color: "#fff",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 32,
            }}
          >
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#D4A500",
                  margin: 0,
                }}
              ><CmsText section="grievance" slot="chief-grievance-officer" /></h4>
              <p style={{ fontSize: 14, margin: "8px 0 0" }}><CmsText section="grievance" slot="available-for-grievance-filing-and" /></p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#D4A500",
                  margin: 0,
                }}
              ><CmsText section="grievance" slot="phone" /></h4>
              <p style={{ fontSize: 14, margin: "8px 0 0" }}>
                <a href="tel:+918554233333" style={{ color: "#D4A500", textDecoration: "none" }}>
                  +91 90003 32294
                </a>
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#D4A500",
                  margin: 0,
                }}
              ><CmsText section="grievance" slot="email" /></h4>
              <p style={{ fontSize: 14, margin: "8px 0 0" }}>
                <a
                  href="mailto:grievance@ksrmce.ac.in"
                  style={{ color: "#D4A500", textDecoration: "none" }}
                >
                  grievance@ksrmce.ac.in
                </a>
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#D4A500",
                  margin: 0,
                }}
              ><CmsText section="grievance" slot="office-hours" /></h4>
              <p style={{ fontSize: 14, margin: "8px 0 0" }}><CmsText section="grievance" slot="monday-to-friday-10-00" /></p>
            </div>
          </div>
        </div>
      </section>
    
      {/* Any committee the CMS points at this page - see PlacedCommittees.
          Renders nothing until one is pointed here. */}
      <PlacedCommittees placement="GRIEVANCE" heading="Committees" />

      <PageResources section="grievance" />
      </main>
  );
}
