import Link from "next/link";
import PlacedCommittees from "@/components/committees/PlacedCommittees";
import AntiRaggingContacts from "@/components/campus/AntiRaggingContacts";
import PageResources from "@/components/PageResources";
import AntiRaggingCommittee from "@/components/campus-life/AntiRaggingCommittee";
import CmsText from "@/components/CmsText";

export const metadata = {
  title: "Anti-Ragging | K.S.R.M. College of Engineering",
  description:
    "K.S.R.M. College of Engineering anti-ragging policy with zero tolerance, helpline numbers, and support for students.",
};


const whatConstitutes = [
  "Any conduct by which a student subjects another student to torture, physical abuse, or psychological harassment",
  "Forcing seniors and juniors into humiliating acts or situations",
  "Coercing juniors to participate in unethical or illegal activities",
  "Ostracizing, insulting, or demeaning remarks towards any student",
  "Use of abusive language or threats against any student",
  "Forcing students to perform stunts or endure unnecessary hardship",
  "Unauthorized use of personal spaces or belongings",
  "Any form of intimidation or bullying",
];

const punishments = [
  "Immediate suspension from hostel and college premises",
  "Expulsion from the institution",
  "Criminally prosecuted under Section 144 (Unlawful Assembly) and 506 (Criminal Intimidation) of IPC",
  "Submission to police for prosecutions",
  "Fine as per institutional norms",
  "Loss of educational opportunity in premier institutions",
  "Permanent criminal record affecting future employment",
  "Court-ordered community service and rehabilitation",
];

const reportingSteps = [
  "Contact the Anti-Ragging Committee directly using helpline numbers",
  "Report to your class mentor or hostel warden immediately",
  "Approach the Dean of Student Affairs in person",
  "Send written complaint to anti-ragging@ksrmce.ac.in with details",
  "File complaint with local police authorities",
  "Report anonymously through college notice boards or suggestion boxes",
  "Contact parents/guardians who can escalate to college administration",
];

const affidavits = [
  {
    title: "Student Affidavit",
    description:
      "Declaration by students confirming no ragging has occurred or will occur",
    href: "/documents/affidavit/student-anti-ragging.pdf",
  },
  {
    title: "Parent/Guardian Affidavit",
    description:
      "Declaration by parents confirming their child will not engage in ragging",
    href: "/documents/affidavit/parent-anti-ragging.pdf",
  },
];

export default function AntiRaggingPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      {/* Hero */}
      <section
        style={{
          backgroundImage: "url('/banners/anti-ragging.webp')",
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
          ><CmsText section="anti-ragging" slot="anti-ragging" /></h1>
          <p style={{ fontSize: 18, margin: "0 0 24px", opacity: 0.95 }}><CmsText section="anti-ragging" slot="zero-tolerance-policy" /></p>
          <div style={{ display: "flex", gap: 8, fontSize: 14, justifyContent: "center" }}>
            <Link href="/" style={{ color: "#D4A500", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/campus-life" style={{ color: "#D4A500", textDecoration: "none" }}>
              Campus Life
            </Link>
            <span>/</span>
            <span>Anti-Ragging</span>
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
          ><CmsText section="anti-ragging" slot="k-s-r-m-college" multiline /></p>
        </div>
      </section>

      {/* Policy warning box */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              background: "#e74c3c",
              border: "2px solid #c0392b",
              borderRadius: 8,
              padding: 28,
              color: "#fff",
              fontSize: 15,
              lineHeight: 1.8,
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              ⚠️
            </div>
            <div>
              Ragging is a serious criminal offense under the Ragging
              Prohibition Act and various state laws. K.S.R.M. College of
              Engineering strictly prohibits ragging of any kind. Students
              found indulging in ragging shall be subject to immediate
              expulsion and legal proceedings. All staff members are
              duty-bound to report any incidents of ragging to the
              Anti-Ragging Committee immediately.
            </div>
          </div>
        </div>
      </section>

      {/* Helplines */}
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
          ><CmsText section="anti-ragging" slot="helpline-numbers" /></h2>
          <AntiRaggingContacts />
        </div>
      </section>

      {/* What Constitutes / Punishments */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 32,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #eef0f3",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: "0 0 20px",
                  paddingBottom: 12,
                  borderBottom: "2px solid #2B3490",
                }}
              ><CmsText section="anti-ragging" slot="what-constitutes-ragging" /></h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {whatConstitutes.map((item) => (
                  <li
                    key={item}
                    style={{
                      color: "#555",
                      fontSize: 13,
                      lineHeight: 1.6,
                      paddingLeft: 20,
                      position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: "#e74c3c", fontWeight: "bold" }}>
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #eef0f3",
                borderRadius: 12,
                padding: 28,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  margin: "0 0 20px",
                  paddingBottom: 12,
                  borderBottom: "2px solid #2B3490",
                }}
              ><CmsText section="anti-ragging" slot="punishments" /></h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {punishments.map((item) => (
                  <li
                    key={item}
                    style={{
                      color: "#555",
                      fontSize: 13,
                      lineHeight: 1.6,
                      paddingLeft: 20,
                      position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: "#e74c3c", fontWeight: "bold" }}>
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Committee table */}
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
          ><CmsText section="anti-ragging" slot="anti-ragging-committee-members" /></h2>
          <AntiRaggingCommittee />
        </div>
      </section>

      {/* How to Report */}
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
          ><CmsText section="anti-ragging" slot="how-to-report-ragging" /></h2>
          <ol style={{ listStyleType: "decimal", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {reportingSteps.map((step) => (
              <li key={step} style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Affidavits */}
      <section style={{ padding: "72px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 24px",
            }}
          ><CmsText section="anti-ragging" slot="anti-ragging-affidavits" /></h2>
          <p
            style={{
              fontSize: 15,
              color: "#555",
              lineHeight: 1.7,
              maxWidth: 820,
              marginBottom: 40,
            }}
          ><CmsText section="anti-ragging" slot="all-students-and-parents-must" multiline /></p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {affidavits.map((a) => (
              <div
                key={a.title}
                style={{
                  background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
                  color: "#fff",
                  borderRadius: 12,
                  padding: 28,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {a.title}
                </h3>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {a.description}
                </p>
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#D4A500",
                    color: "#2B3490",
                    padding: "10px 16px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textDecoration: "none",
                    width: "fit-content",
                    margin: "0 auto",
                  }}
                >
                  ⬇ Download PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Any committee the CMS points at this page - see PlacedCommittees.
          Renders nothing until one is pointed here. */}
      <PlacedCommittees placement="ANTI_RAGGING" heading="Committees" />

      <PageResources section="anti-ragging" />
    </main>
  );
}
