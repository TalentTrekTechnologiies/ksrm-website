import Link from "next/link";

export const metadata = {
  title: "Startup Cell | KSRM College of Engineering",
  description:
    "KSRM College of Engineering Startup Cell supporting student entrepreneurs with incubation, mentorship, funding, and market access.",
};

const committee = [
  {
    name: "Dr. V.S.S. Murthy",
    role: "Professor & Principal",
    position: "Chairman",
    focus: "Administration",
  },
  {
    name: "Dr. M. Venkata Narayana",
    role: "Professor, ECE",
    position: "Convenor",
    focus: "Electronics & Communication",
  },
  {
    name: "Dr. T. Mariprasath",
    role: "Associate Professor, CSE",
    position: "Coordinator",
    focus: "Computer Science",
  },
  {
    name: "Dr. P. Kishore",
    role: "Assistant Professor, ECE",
    position: "Co-Coordinator",
    focus: "Electronics & Communication",
  },
  {
    name: "Dr. S. Nageswara Rao",
    role: "Associate Professor, ME",
    position: "Member",
    focus: "Mechanical Engineering",
  },
  {
    name: "Sri V. Gopi Tilak",
    role: "Assistant Professor, EEE",
    position: "Member",
    focus: "Electrical & Electronics",
  },
  {
    name: "Dr. P. Lokeshwara Reddy",
    role: "Assistant Professor, CSE",
    position: "Member",
    focus: "Computer Science",
  },
];

const objectives = [
  "Identify and nurture startup ideas among students and faculty",
  "Provide mentoring, guidance, and technical support to entrepreneurs",
  "Facilitate access to funding, incubation, and acceleration resources",
  "Promote innovation through workshops, seminars, and hackathons",
  "Build partnerships with industry, investors, and government agencies",
  "Foster a culture of entrepreneurship and risk-taking",
];

export default function StartupCellPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      {/* Hero */}
      <section
        style={{
          backgroundImage: "url('/header.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 280,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 20,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 8, fontSize: 14, color: "#fff" }}>
            <Link href="/" style={{ color: "#D4A500" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/campus-life" style={{ color: "#D4A500" }}>
              Campus Life
            </Link>
            <span>/</span>
            <span>Innovation &amp; Startup Cell</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <p
            style={{
              fontSize: 16,
              color: "#555",
              lineHeight: 1.8,
              textAlign: "justify",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            The KSRMCE Innovation &amp; Startup Cell operates under the
            National Innovation and Startup Policy (NISP), fostering
            entrepreneurship and innovation among students and faculty. The
            cell mentors aspiring entrepreneurs, supports startup ideas, and
            aligns with the AP State Innovation and Startup Policy, creating
            an ecosystem for transforming ideas into viable businesses.
          </p>
        </div>
      </section>

      {/* Committee */}
      <section style={{ padding: "72px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              margin: "0 0 48px",
              textAlign: "center",
            }}
          >
            Committee Members
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              marginTop: 40,
            }}
          >
            {committee.map((member) => (
              <div
                key={member.name}
                style={{
                  background:
                    "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
                  color: "#fff",
                  padding: 24,
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {member.name}
                </h4>
                <p style={{ fontSize: 12, margin: "6px 0", opacity: 0.9 }}>
                  {member.role}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    marginTop: 8,
                    color: "#D4A500",
                  }}
                >
                  {member.position}
                </p>
                <p style={{ fontSize: 11 }}>{member.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              margin: "0 0 48px",
              textAlign: "center",
            }}
          >
            Our Objectives
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
              marginTop: 40,
            }}
          >
            {objectives.map((objective) => (
              <div
                key={objective}
                style={{
                  background: "#fff",
                  border: "1px solid #eef0f3",
                  borderRadius: 8,
                  borderLeft: "4px solid #D4A500",
                  padding: 24,
                }}
              >
                <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: 0 }}>
                  {objective}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
