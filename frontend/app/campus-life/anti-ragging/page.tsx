import Link from "next/link";

export const metadata = {
  title: "Anti-Ragging | KSRM College of Engineering",
  description:
    "KSRM College of Engineering anti-ragging policy with zero tolerance, helpline numbers, and support for students.",
};

const helplines = [
  { label: "National Helpline", number: "1800-5500-22" },
  { label: "College Helpline", number: "+91-8554-233333" },
  {
    label: "Anti-Ragging Committee",
    number: "+91-8554-233333 (Ext: 380)",
  },
];

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

const committee = [
  { name: "Dr. [Principal Name]", designation: "Principal", role: "Chairman" },
  {
    name: "Dr. [Dean Name]",
    designation: "Dean of Student Affairs",
    role: "Convenor",
  },
  { name: "Mr. [Faculty Name]", designation: "Faculty Member", role: "Member" },
  { name: "Ms. [Faculty Name]", designation: "Faculty Member", role: "Member" },
  {
    name: "[Senior Student Name]",
    designation: "Senior Student Representative",
    role: "Member",
  },
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
          backgroundImage: "url('/header.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 240,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 20,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 8, fontSize: 14, color: "#fff" }}>
            <Link href="/" style={{ color: "#D4A500", textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ color: "#D4A500" }}>/</span>
            <Link href="/campus-life" style={{ color: "#D4A500", textDecoration: "none" }}>
              Campus Life
            </Link>
            <span style={{ color: "#D4A500" }}>/</span>
            <span>Anti-Ragging</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{ padding: "56px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <p
            style={{
              color: "#555",
              fontSize: 16,
              lineHeight: 1.8,
              margin: 0,
              maxWidth: 820,
            }}
          >
            KSRM College of Engineering has implemented a strict
            zero-tolerance anti-ragging policy. The college is committed to
            creating a safe, inclusive, and harassment-free environment for
            all students. Ragging in any form is strictly prohibited and
            will result in severe disciplinary action.
          </p>
        </div>
      </section>

      {/* Policy warning box */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
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
              Prohibition Act and various state laws. KSRM College of
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
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 40px",
            }}
          >
            Helpline Numbers
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            {helplines.map((h) => (
              <div
                key={h.label}
                style={{
                  background: "#e74c3c",
                  color: "#fff",
                  borderRadius: 12,
                  padding: 28,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 28 }}>📞</div>
                <div
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    opacity: 0.9,
                  }}
                >
                  {h.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {h.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Constitutes / Punishments */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
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
              >
                What Constitutes Ragging
              </h3>
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
              >
                Punishments
              </h3>
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
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 40px",
            }}
          >
            Anti-Ragging Committee Members
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Name", "Designation", "Role"].map((h) => (
                    <th
                      key={h}
                      style={{
                        background: "#2B3490",
                        color: "#fff",
                        padding: 14,
                        textAlign: "left",
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {committee.map((member, i) => (
                  <tr
                    key={member.name}
                    style={{ background: i % 2 === 0 ? "#f4f3ef" : "transparent" }}
                  >
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#555", fontWeight: 600 }}>
                      {member.name}
                    </td>
                    <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#555" }}>
                      {member.designation}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid #eef0f3",
                        color: "#2B3490",
                        fontWeight: 700,
                      }}
                    >
                      {member.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How to Report */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 40px",
            }}
          >
            How to Report Ragging
          </h2>
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
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 24px",
            }}
          >
            Anti-Ragging Affidavits
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#555",
              lineHeight: 1.7,
              maxWidth: 820,
              marginBottom: 40,
            }}
          >
            All students and parents must submit anti-ragging affidavits at
            the time of admission, confirming their commitment to adhering
            to the anti-ragging policy.
          </p>
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
    </main>
  );
}
