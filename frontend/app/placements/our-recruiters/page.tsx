import PlacementsSubnav from "@/components/PlacementsSubnav";

export default function OurRecruitersPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        .section { padding: 100px 0; background: #ffffff; }
        .heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; text-align: center; }
        .coming-soon-box { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #ffffff; padding: 60px 40px; border-radius: 12px; text-align: center; }
        .coming-soon-text { font-size: 18px; line-height: 1.8; margin: 0; }
        .coming-soon-icon { font-size: 48px; margin-bottom: 16px; }
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
              <span>Our Recruiters</span>
            </div>
            <h1 style={ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.1, textAlign: "left" }>Our Recruiters</h1>
            <p style={ color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 12, maxWidth: 600 }>Placements & Career Development</p>
          </div>
        </section>
        <PlacementsSubnav active="/placements/our-recruiters" />
        <section className="section">
          <div className="responsive-container">
            <div className="coming-soon-box">
              <div className="coming-soon-icon">📋</div>
              <h2 className="heading" style={{ color: "#D4A500", marginBottom: 16 }}>Our Recruiters</h2>
              <p className="coming-soon-text">Information about our industry partners and recruiters is coming soon. Check back for updates!</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

