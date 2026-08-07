import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import NamedCommittees from "@/components/committees/NamedCommittees";

﻿import Link from "next/link";

export const metadata = {
  title: "Startup Cell | K.S.R.M. College of Engineering",
  description:
    "K.S.R.M. College of Engineering Startup Cell supporting student entrepreneurs with incubation, mentorship, funding, and market access.",
};

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
          backgroundImage: "url('/banners/startup-cell.webp')",
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
          ><CmsText section="startup-cell" slot="innovation-startup-cell" /></h1>
          <p style={{ fontSize: 18, margin: "0 0 24px", opacity: 0.95 }}><CmsText section="startup-cell" slot="fostering-entrepreneurship-innovation" /></p>
          <div style={{ display: "flex", gap: 8, fontSize: 14, justifyContent: "center" }}>
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
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <p
            style={{
              fontSize: 16,
              color: "#555",
              lineHeight: 1.8,
              textAlign: "justify",
              maxWidth: 900,
              margin: "0 auto",
            }}
          ><CmsText section="startup-cell" slot="the-ksrmce-innovation-startup-cell" multiline /></p>
        </div>
      </section>

      {/* Committee - was a hardcoded array (7 names baked into the page, no
          way to edit them without a code change). Now an ordinary CMS
          committee like every other one on the site (Admin -> Committees),
          matched by name - so the client can add/remove/rename members
          themselves. */}
      <NamedCommittees names={["Innovation & Startup Cell Committee"]} background="#F5EFE4" />

      {/* Objectives */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              margin: "0 0 48px",
              textAlign: "center",
            }}
          ><CmsText section="startup-cell" slot="our-objectives" /></h2>
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
    
      <PageResources section="startup-cell" />
      </main>
  );
}
