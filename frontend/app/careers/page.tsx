const whyJoin = [
  { icon: "📖", title: "Excellence in Education", desc: "Join an institution recognized for academic excellence" },
  { icon: "⚡", title: "Research Opportunities", desc: "Contribute to cutting-edge research initiatives" },
  { icon: "👥", title: "Supportive Culture", desc: "Work in a collaborative and supportive environment" },
  { icon: "🏆", title: "Career Growth", desc: "Access professional development and advancement opportunities" },
];

const openings = [
  { title: "Assistant Professor - CSE", dept: "Computer Science & Engineering", qual: "M.Tech/Ph.D. in Computer Science", exp: "0-2 years" },
  { title: "Lab Technician - ECE", dept: "Electronics & Communication", qual: "Diploma/B.Tech in Electronics", exp: "2-3 years" },
  { title: "Administrative Officer", dept: "Administration", qual: "Bachelor's Degree", exp: "3-5 years" },
];

export default function CareersPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .car-hero { position: relative; background-image: url('/banners/startup-banner.jpg'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .car-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
        .car-hero > * { position: relative; z-index: 2; }
        .car-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .car-breadcrumb a { color: #D4A500; text-decoration: none; }
        .car-whyjoin-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 32px 0; }
        .car-whyjoin-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; }
        .car-whyjoin-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 12px; display: flex; align-items: center; gap: 12px; }
        .car-whyjoin-card p { font-size: 14px; color: #666; margin: 0; }
        .car-opening-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
        .car-opening-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .car-cta-button { display: inline-block; background: #D4A500; color: #1a1a2e; padding: 16px 40px; border-radius: 8px; font-weight: 700; text-decoration: none; font-family: 'Rajdhani', sans-serif; border: none; margin: 24px 0; }
        @media (max-width: 1200px) { .car-whyjoin-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="car-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <div className="car-breadcrumb"><a href="/">Home</a><span>/</span><span>Careers</span></div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Careers at KSRM</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 300, maxWidth: 600 }}>Join Our Team of Excellence</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Why Join KSRM?</h2>
          <div className="car-whyjoin-grid">
            {whyJoin.map((w) => (
              <div className="car-whyjoin-card" key={w.title}>
                <h3><span>{w.icon}</span>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Current Openings</h2>
          {openings.map((o) => (
            <div className="car-opening-card" key={o.title}>
              <p className="car-opening-title">{o.title}</p>
              <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}><span style={{ fontWeight: 600, color: "#2B3490" }}>Department:</span> {o.dept}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <p style={{ color: "#666", fontSize: 13, margin: 0 }}><span style={{ fontWeight: 600, color: "#2B3490" }}>Qualification:</span> {o.qual}</p>
                <p style={{ color: "#666", fontSize: 13, margin: 0 }}><span style={{ fontWeight: 600, color: "#2B3490" }}>Experience:</span> {o.exp}</p>
              </div>
              <button className="car-cta-button" style={{ marginTop: 12, marginBottom: 0, fontSize: 14, padding: "12px 24px" }}>Apply Now</button>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <div className="responsive-container">
          <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>Ready to Join KSRM?</h2>
          <a href="mailto:hr@ksrmce.ac.in" className="car-cta-button">Contact HR Department</a>
        </div>
      </section>
    </main>
  );
}
