"use client";

const nbaPrograms = [
  "Computer Science & Engineering (B.Tech) - Valid until 2026",
  "Electronics & Communication Engineering (B.Tech) - Valid until 2025",
  "Electrical & Electronics Engineering (B.Tech) - Valid until 2026",
  "Civil Engineering (B.Tech) - Valid until 2025",
  "Mechanical Engineering (B.Tech) - Valid until 2026",
];

const nirfStats = [
  { label: "Engineering", value: "Top 200" },
  { label: "Overall", value: "Top 500" },
  { label: "Innovation", value: "Top 300" },
];

export default function AccreditationPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .acc-hero {
          position: relative; background-image: url('/banners/accreditation.png'); background-size: cover;
          background-position: center; background-color: #2B3490; min-height: 280px; display: flex;
          align-items: flex-end; overflow: hidden; padding-bottom: 40px;
        }
        .acc-hero::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none;
        }
        .acc-hero > * { position: relative; z-index: 2; }
        .acc-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .acc-breadcrumb a { color: #D4A500; text-decoration: none; transition: color 0.2s; }
        .acc-breadcrumb a:hover { color: #fff; }
        .acc-section-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 32px; margin: 32px 0; }
        .acc-section-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; color: #2B3490; margin: 0 0 16px; }
        .acc-programs-list { list-style: none; padding: 0; margin: 16px 0; }
        .acc-programs-list li { padding: 12px 0; color: #666; border-bottom: 1px solid #eef0f3; display: flex; align-items: center; }
        .acc-programs-list li:before { content: "✓"; display: inline-block; color: #D4A500; font-weight: 700; margin-right: 12px; font-size: 19px; }
        .acc-programs-list li:last-child { border-bottom: none; }
        @media (max-width: 768px) { .acc-section-card { padding: 20px; } }
        @media (max-width: 900px) { .acc-affiliations-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <section className="acc-hero">
        <div className="responsive-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
            Accreditations &amp; Rankings
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            Recognition of Excellence
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
            NBA Accreditation
          </h2>
          <div className="acc-section-card">
            <h3>Accredited Programs</h3>
            <p style={{ color: "#666" }}>
              All B.Tech engineering programs are accredited by the National Board of Accreditation (NBA),
              recognizing excellence in engineering education.
            </p>
            <ul className="acc-programs-list">
              {nbaPrograms.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
            NAAC A+ Accreditation
          </h2>
          <div className="acc-section-card">
            <h3>Highest Grade Recognition</h3>
            <p style={{ color: "#666", marginBottom: 16 }}>
              KSRM College has been accredited with A+ grade by the National Assessment and Accreditation Council
              (NAAC), the highest rating in the framework. This recognition reflects our commitment to academic
              excellence, research, infrastructure development, and institutional governance.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ color: "#2B3490", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Accreditation Grade</p>
                <p style={{ color: "#666", fontSize: 13, margin: 0 }}>A+ (Highest)</p>
              </div>
              <div>
                <p style={{ color: "#2B3490", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Valid Until</p>
                <p style={{ color: "#666", fontSize: 13, margin: 0 }}>2027</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
            NIRF Rankings
          </h2>
          <div className="acc-section-card">
            <h3>National Institutional Ranking Framework</h3>
            <p style={{ color: "#666", marginBottom: 20 }}>
              KSRM College is consistently ranked in the NIRF by the Ministry of Education, demonstrating our
              commitment to academic excellence and institutional development.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {nirfStats.map((s) => (
                <div key={s.label} style={{ background: "#ffffff", padding: 16, borderRadius: 8, textAlign: "center" }}>
                  <p style={{ color: "#2B3490", fontWeight: 600, fontSize: 13, margin: "0 0 8px" }}>{s.label}</p>
                  <p style={{ color: "#D4A500", fontWeight: 700, fontSize: 20, margin: "0 0 4px" }}>{s.value}</p>
                  <p style={{ color: "#999", fontSize: 12, margin: 0 }}>2024</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
            Affiliations &amp; Recognition
          </h2>
          <div className="acc-affiliations-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="acc-section-card">
              <h3>JNTUA Affiliation</h3>
              <p style={{ color: "#666" }}>
                Affiliated to Jawaharlal Nehru Technological University Anantapur, enabling collaboration while
                maintaining academic autonomy.
              </p>
            </div>
            <div className="acc-section-card">
              <h3>UGC Autonomous Status</h3>
              <p style={{ color: "#666" }}>
                Granted autonomous status by University Grants Commission in 2016, recognizing institutional
                excellence and academic autonomy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <div className="responsive-container">
          <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>
            Quality Assurance &amp; Excellence
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "0 0 24px", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            Our accreditations and rankings reflect our commitment to providing world-class engineering education
          </p>
        </div>
      </section>
    </main>
  );
}
