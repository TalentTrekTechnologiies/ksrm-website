import PlacementsSubnav from "@/components/PlacementsSubnav";

const partnerTable = [
  { name: "ServiceNow", training: true, cert: "CSA/CAD", internships: true, hackathons: "HackNow", placements: true },
  { name: "Cisco", training: true, cert: "NetAcad", internships: true, hackathons: true, placements: true },
  { name: "Oracle", training: true, cert: "Oracle Academy", internships: true, hackathons: true, placements: true },
  { name: "AWS", training: true, cert: "AWS Academy", internships: true, hackathons: false, placements: true },
  { name: "Salesforce", training: true, cert: "Superbadges", internships: true, hackathons: true, placements: true },
  { name: "IBM", training: true, cert: "AIML Programs", internships: true, hackathons: true, placements: true },
  { name: "Infosys Springboard", training: true, cert: "Courses", internships: true, hackathons: true, placements: true },
  { name: "Snowflake", training: true, cert: "SnowPro Core", internships: true, hackathons: true, placements: true },
];

const impactList = [
  "Earn globally recognized certifications.",
  "Participate in industry-sponsored training programs.",
  "Gain hands-on experience through internships and projects.",
  "Develop expertise in emerging technologies.",
  "Improve placement readiness and employability.",
  "Access career opportunities with leading organizations.",
];

export default function MoUsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        .mous-intro-section { padding: 72px 0; background: #ffffff; }
        .mous-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .mous-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .mous-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .mous-table-section { padding: 72px 0; background: #ffffff; }
        .mous-table { width: 100%; border-collapse: collapse; margin-top: 32px; background: #fff; border-radius: 8px; }
        .mous-table-wrapper { overflow-x: auto; }
        .mous-table th { background: #2B3490; color: #fff; padding: 16px 14px; text-align: left; font-weight: 700; font-size: 13px; text-transform: uppercase; }
        .mous-table td { padding: 14px; border-bottom: 1px solid #eef0f3; color: #555; font-size: 14px; }
        .mous-table tr:nth-child(even) { background: #f7f8fa; }
        .mous-checkmark { color: #2B3490; font-weight: 700; }
        .mous-list { list-style: none; padding: 0; margin: 32px 0; }
        .mous-list li { padding: 12px 0 12px 28px; position: relative; font-size: 15px; color: #555; line-height: 1.6; }
        .mous-list li::before { content: '✓'; position: absolute; left: 0; color: #D4A500; font-weight: 700; }
        .mous-impact-section { padding: 72px 0; background: #f4f3ef; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section style={ background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)", padding: "60px 0 40px", color: "white", position: "relative" }>
          <div style={ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" } />
          <div className="responsive-container" style={ position: "relative", zIndex: 2 }>
            <div style={ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 12, color: "rgba(255,255,255,0.7)" }>
              <a style={ color: "#D4A500", textDecoration: "none" } href="/">Home</a>
              <span>/</span>
              <a style={ color: "#D4A500", textDecoration: "none" } href="/placements">Placements</a>
              <span>/</span>
              <span>MoUs</span>
            </div>
            <h1 style={ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.1, textAlign: "left" }>MoUs</h1>
            <p style={ color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 12, maxWidth: 600 }>Placements & Career Development</p>
          </div>
        </section>
        <PlacementsSubnav active="/placements/mous" />

        <section className="mous-intro-section">
          <div className="responsive-container">
            <h2 className="mous-heading">Industry Collaborations & Memoranda of Understanding</h2>
            <p className="mous-text">K.S.R.M. College of Engineering believes that strong industry-academia collaboration is essential for preparing students to meet the evolving demands of the global workforce. Through strategic partnerships and MoUs with leading technology companies, the institution has created pathways for skill development, certifications, internships, and career opportunities.</p>
          </div>
        </section>

        <section className="mous-table-section">
          <div className="responsive-container">
            <h2 className="mous-section-heading">Major Industry & Technology Partners</h2>
            <p className="mous-text">KSRMCE actively collaborates with leading organizations including: ServiceNow University Program, Cisco Networking Academy, Oracle Academy, AWS Academy, Salesforce Academic Alliance, Infosys Springboard, IBM Career Education Program, Snowflake Academic Program, and SAP University Alliances.</p>
            <div className="mous-table-wrapper">
              <table className="mous-table">
                <thead>
                  <tr><th>Partner</th><th>Training</th><th>Certifications</th><th>Internships</th><th>Hackathons</th><th>Placements</th></tr>
                </thead>
                <tbody>
                  {partnerTable.map((p) => (
                    <tr key={p.name}>
                      <td><strong>{p.name}</strong></td>
                      <td className="mous-checkmark">{p.training ? "✓" : "-"}</td>
                      <td>{p.cert}</td>
                      <td className="mous-checkmark">{p.internships ? "✓" : "-"}</td>
                      <td>{typeof p.hackathons === "string" ? p.hackathons : p.hackathons ? "✓" : "-"}</td>
                      <td className="mous-checkmark">{p.placements ? "✓" : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mous-impact-section">
          <div className="responsive-container">
            <h2 className="mous-section-heading">Impact of Our MoUs</h2>
            <p className="mous-text">The institution's industry partnerships have enabled students to:</p>
            <ul className="mous-list">
              {impactList.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="mous-text" style={{ fontStyle: "italic", fontWeight: 500, marginTop: 32 }}>
              At KSRMCE, industry collaborations are not limited to formal agreements; they are active partnerships that create meaningful learning experiences, foster innovation, and empower students to achieve professional excellence in a competitive global environment.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

