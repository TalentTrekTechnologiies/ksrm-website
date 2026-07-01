"use client";

const criteria = [
  { n: 1, title: "Curricular Aspects", text: "Curriculum design, academic flexibility and enrichment programmes" },
  { n: 2, title: "Teaching-Learning & Evaluation", text: "Student enrollment, teaching methods and evaluation reforms" },
  { n: 3, title: "Research, Innovations & Extension", text: "Research output, patents, consultancy and extension activities" },
  { n: 4, title: "Infrastructure & Learning Resources", text: "Physical facilities, library, IT infrastructure" },
  { n: 5, title: "Student Support & Progression", text: "Student services, scholarships, career guidance and alumni" },
  { n: 6, title: "Governance, Leadership & Management", text: "Institutional governance, finance and administration" },
  { n: 7, title: "Institutional Values & Best Practices", text: "Gender equity, environmental consciousness and best practices" },
];

const documents = [
  { name: "Self Study Report (SSR)", href: "https://ksrmce.ac.in/NAAC.php" },
  { name: "DVV Clarifications", href: "https://ksrmce.ac.in/DVV2.php" },
  { name: "AQAR 2023-24", href: "#" },
  { name: "Institution Core Values", href: "https://ksrmce.ac.in/NAAC/Institution Core Values.pdf" },
  { name: "Code of Professional Conduct", href: "https://ksrmce.ac.in/NAAC/Code of Professional Conduct.pdf" },
];

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />
    </svg>
  );
}
function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4A500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

export default function NAACPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .naac-hero {
          position: relative; background-image: url('/banners/naac-banner.webp'); background-size: cover;
          background-position: center; background-color: #2B3490; min-height: 280px; display: flex;
          align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .naac-hero::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none;
        }
        .naac-hero > * { position: relative; z-index: 2; }
        .naac-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .naac-breadcrumb a { color: #D4A500; text-decoration: none; }
        .naac-badge {
          background: #f7f8fa; border: 2px solid #D4A500; border-radius: 12px; padding: 40px; text-align: center;
          margin: 48px auto; max-width: 500px;
        }
        .naac-grade { font-family: 'Rajdhani', sans-serif; font-size: 48px; font-weight: 700; color: #D4A500; margin-bottom: 12px; }
        .naac-badge-detail { font-size: 16px; color: #555; margin: 8px 0; }
        .naac-criteria-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; }
        .naac-criteria-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; transition: all 0.2s; }
        .naac-criteria-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.1); border-color: #D4A500; }
        .naac-criteria-number { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #D4A500; margin-bottom: 12px; }
        .naac-criteria-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .naac-criteria-card p { color: #666; font-size: 14px; line-height: 1.6; margin: 0; }
        .naac-document-item {
          background: #f7f8fa; border: 1px solid #eef0f3; padding: 20px; border-radius: 8px; margin-bottom: 16px;
          display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;
        }
        .naac-document-item:hover { background: #eef1ff; border-color: #2B3490; }
        .naac-document-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0; }
        .naac-document-link {
          background: #2B3490; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;
          font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .naac-document-link:hover { background: #D4A500; color: #2B3490; }
        .naac-cta-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 48px auto; max-width: 600px; }
        .naac-cta-button {
          background: #2B3490; color: #fff; padding: 20px 40px; border-radius: 8px; font-weight: 700;
          text-decoration: none; text-align: center; transition: all 0.2s; font-family: 'Rajdhani', sans-serif;
        }
        .naac-cta-button:hover { background: #D4A500; color: #2B3490; transform: translateY(-2px); }

        @media (max-width: 1024px) { .naac-criteria-grid { grid-template-columns: repeat(2, 1fr); } .naac-cta-buttons { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .naac-criteria-grid { grid-template-columns: 1fr; }
          .naac-document-item { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <section className="naac-hero">
        <div className="responsive-container">
          <div className="naac-breadcrumb" style={{ marginBottom: 16 }}>
            <a href="/">Home</a><span>/</span><span>NAAC</span>
          </div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
            NAAC
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 300, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            National Assessment and Accreditation Council
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <p style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0, textAlign: "center" }}>
              KSRM College of Engineering has been accredited by the National Assessment and Accreditation Council
              (NAAC). NAAC accreditation is a mark of quality assurance recognizing the institution&apos;s
              commitment to providing quality higher education.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <div className="naac-badge">
            <AwardIcon />
            <div className="naac-grade">B++</div>
            <div className="naac-badge-detail">CGPA: 2.88</div>
            <div className="naac-badge-detail">3rd Cycle</div>
            <div className="naac-badge-detail">Valid Until: 2026</div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px", textAlign: "center" }}>
            NAAC Accreditation Criteria
          </h2>
          <div className="naac-criteria-grid">
            {criteria.map((c) => (
              <div className="naac-criteria-card" key={c.n}>
                <div className="naac-criteria-number">Criterion {c.n}</div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
            Key Documents
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "32px 0" }}>
            {documents.map((d) => (
              <li className="naac-document-item" key={d.name}>
                <h4>{d.name}</h4>
                <a href={d.href} target="_blank" rel="noopener noreferrer" className="naac-document-link">
                  <DownloadIcon />View
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "#ffffff", textAlign: "center" }}>
        <div className="responsive-container">
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
            Explore NAAC Documentation
          </h3>
          <div className="naac-cta-buttons">
            <a href="https://ksrmce.ac.in/NAAC.php" target="_blank" rel="noopener noreferrer" className="naac-cta-button">SSR Report</a>
            <a href="https://ksrmce.ac.in/DVV2.php" target="_blank" rel="noopener noreferrer" className="naac-cta-button">DVV Clarifications</a>
          </div>
        </div>
      </section>
    </main>
  );
}
