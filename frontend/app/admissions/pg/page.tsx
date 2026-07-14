const mtechPrograms = [
  { name: "Geotechnical Engineering", dept: "Civil Engineering", intake: 18 },
  { name: "Power Systems", dept: "Electrical & Electronics", intake: 18 },
  { name: "Embedded Systems & VLSI", dept: "Electronics & Communication", intake: 18 },
  { name: "Renewable Energy Engineering", dept: "Mechanical Engineering", intake: 18 },
  { name: "AI & Data Science", dept: "Computer Science & Engineering", intake: 18 },
];

export default function PGAdmissionsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .pg-hero {
          position: relative;
          background-image: url('/banners/pg-admissions.png');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .pg-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .pg-hero > * { position: relative; z-index: 2; }
        .pg-breadcrumb { font-size: 14px; color: rgba(255,255,255,0.7); }
        .pg-breadcrumb a { color: #D4A500; text-decoration: none; }
        .pg-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
        }
        .pg-subtitle { font-size: 16px; color: rgba(255,255,255,0.85); margin-top: 12px; }

        .pg-content-section { padding: 72px 0; background: #ffffff; }
        .pg-intro { font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 48px; max-width: 820px; }
        .pg-summary-boxes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-bottom: 8px; }
        .pg-summary-box {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 32px;
          border-radius: 12px;
          text-align: center;
        }
        .pg-summary-box h3 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; margin: 0; }
        .pg-section-heading {
          font-family: 'Rajdhani', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #2B3490;
          margin: 48px 0 32px;
        }
        .pg-table-wrapper { border-radius: 12px; overflow: hidden; border: 1px solid #eef0f3; margin-bottom: 16px; }
        .pg-table { width: 100%; border-collapse: collapse; }
        .pg-table thead th {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 18px;
          text-align: left;
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .pg-table tbody td { padding: 16px 18px; color: #555; font-size: 15px; border-bottom: 0.8px solid #eef0f3; }
        .pg-program-name { font-weight: 600; color: #555; }
        .pg-intake-badge { color: #1a1a2e; font-weight: 700; font-family: Arimo, Arial, sans-serif; font-size: 15px; }

        @media (max-width: 900px) {
          .pg-summary-boxes { grid-template-columns: 1fr; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="pg-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="pg-title">Postgraduate Programs</h1>
              <p className="pg-subtitle">M.Tech &amp; MBA Programs at KSRM</p>
            </div>
          </div>
        </section>

        <section className="pg-content-section">
          <div className="responsive-container">
            <p className="pg-intro">
              KSRM College offers specialized postgraduate programs including M.Tech in five engineering
              specializations and an MBA program. Our PG programs focus on research, innovation, and
              industry-relevant skills.
            </p>

            <div className="pg-summary-boxes">
              <div className="pg-summary-box">
                <h3>M.Tech Programs</h3>
                <p style={{ margin: "8px 0 0" }}>90 Seats across 5 Specializations</p>
              </div>
              <div className="pg-summary-box">
                <h3>MBA Program</h3>
                <p style={{ margin: "8px 0 0" }}>120 Seats</p>
              </div>
            </div>

            <h2 className="pg-section-heading">Master of Technology (M.Tech)</h2>
            <div className="pg-table-wrapper">
              <table className="pg-table">
                <thead><tr><th>Program</th><th>Department</th><th>Annual Intake</th></tr></thead>
                <tbody>
                  {mtechPrograms.map((p) => (
                    <tr key={p.name}>
                      <td className="pg-program-name">{p.name}</td>
                      <td style={{ color: "#666" }}>{p.dept}</td>
                      <td className="pg-intake-badge">{p.intake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="pg-section-heading">Master of Business Administration (MBA)</h2>
            <div className="pg-table-wrapper">
              <table className="pg-table">
                <thead><tr><th>Program</th><th>Duration</th><th>Annual Intake</th></tr></thead>
                <tbody>
                  <tr>
                    <td className="pg-program-name">Master of Business Administration</td>
                    <td style={{ color: "#666" }}>2 Years</td>
                    <td className="pg-intake-badge">120</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginTop: 32 }}>
              <strong>Admission Requirements:</strong> M.Tech programs require a valid GATE score. MBA program
              admissions are based on CAT/MAT scores and merit. Candidates may also be considered based on
              academic excellence and relevant work experience.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
