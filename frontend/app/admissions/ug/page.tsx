import PageResources from "@/components/PageResources";

﻿const ugPrograms = [
  { name: "Computer Science & Engineering", code: "CSE", intake: 240 },
  { name: "CSE (AI & Machine Learning)", code: "CSE-AIML", intake: 60 },
  { name: "CSE (Data Science)", code: "CSE-DS", intake: 60 },
  { name: "AI & Machine Learning", code: "AIML", intake: 60 },
  { name: "Electronics & Communication Engineering", code: "ECE", intake: 180 },
  { name: "Electrical & Electronics Engineering", code: "EEE", intake: 60 },
  { name: "Mechanical Engineering", code: "MECH", intake: 60 },
  { name: "Civil Engineering", code: "CIVIL", intake: 90 },
];

export default function UGAdmissionsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .ug-hero {
          position: relative;
          background-image: url('/banners/ug-admissions.png');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .ug-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .ug-hero > * { position: relative; z-index: 2; }
        .ug-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .ug-breadcrumb a { color: #D4A500; text-decoration: none; }
        .ug-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
        }
        .ug-subtitle { font-size: 17px; color: rgba(255,255,255,0.85); margin-top: 12px; }

        .ug-content-section { padding: 72px 0; background: #ffffff; }
        .ug-intro { font-size: 17px; color: #555; line-height: 1.8; margin-bottom: 48px; max-width: 820px; }
        .ug-summary {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 32px;
          border-radius: 12px;
          margin-bottom: 48px;
          text-align: center;
        }
        .ug-summary h3 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; margin: 0; }
        .ug-table-wrapper { border-radius: 12px; overflow: hidden; border: 1px solid #eef0f3; }
        .ug-table { width: 100%; border-collapse: collapse; }
        .ug-table thead th {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 18px;
          text-align: left;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .ug-table tbody td {
          padding: 16px 18px;
          color: #555;
          font-size: 16px;
          border-bottom: 0.8px solid #eef0f3;
        }
        .ug-program-name { font-weight: 600; color: #555; }
        .ug-program-code {
          background: rgba(43, 52, 144, 0.1);
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          display: inline-block;
        }
        .ug-intake-badge {
          color: #1a1a2e;
          font-weight: 700;
          font-family: Arimo, Arial, sans-serif;
          font-size: 16px;
        }
        .ug-info-box {
          background: #f7f8fa;
          padding: 24px;
          border-radius: 8px;
          margin-top: 48px;
          border-left: 4px solid #D4A500;
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="ug-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="ug-title">Undergraduate Programs</h1>
              <p className="ug-subtitle">B.Tech Engineering Programs at KSRM</p>
            </div>
          </div>
        </section>

        <section className="ug-content-section">
          <div className="responsive-container">
            <p className="ug-intro">
              K.S.R.M. College offers eight B.Tech undergraduate programs with a total intake of 810 seats.
              Each program is designed to provide quality technical education with hands-on learning and
              industry collaboration.
            </p>

            <div className="ug-summary">
              <h3>Total UG Intake</h3>
              <p style={{ margin: "8px 0 0" }}>810 Seats across 8 Programs</p>
            </div>

            <div className="ug-table-wrapper">
              <table className="ug-table">
                <thead>
                  <tr><th>Program</th><th>Code</th><th>Annual Intake</th></tr>
                </thead>
                <tbody>
                  {ugPrograms.map((p) => (
                    <tr key={p.code}>
                      <td className="ug-program-name">{p.name}</td>
                      <td><span className="ug-program-code">{p.code}</span></td>
                      <td className="ug-intake-badge">{p.intake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ug-info-box">
              <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                Admission Code: K.S.R.M.
              </h4>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Use the code K.S.R.M. when applying through EAPCET. Admissions are merit-based and follow the norms
                set by JNTUA and the Government of Andhra Pradesh for engineering programs.
              </p>
            </div>
          </div>
        </section>
      
      <PageResources section="admissions.ug" />
      </main>
    </>
  );
}
