import PlacementsSubnav from "@/components/PlacementsSubnav";

export default function OurRecruitersPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .recruiters-hero {
          position: relative;
          background-image: url('/banners/startup banner.jpg');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .recruiters-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .recruiters-hero > * { position: relative; z-index: 2; }
        .recruiters-breadcrumb { font-size: 14px; color: rgba(255,255,255,0.7); }
        .recruiters-breadcrumb a { color: #D4A500; text-decoration: none; }
        .recruiters-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .recruiters-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          margin-top: 12px;
          max-width: 600px;
        }

        .section { padding: 100px 0; background: #ffffff; }
        .heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; text-align: center; }
        .coming-soon-box { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #ffffff; padding: 60px 40px; border-radius: 12px; text-align: center; }
        .coming-soon-text { font-size: 18px; line-height: 1.8; margin: 0; }
        .coming-soon-icon { font-size: 48px; margin-bottom: 16px; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="recruiters-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <div className="recruiters-breadcrumb">
                <a href="/">Home</a> / <a href="/placements">Placements</a> / Our Recruiters
              </div>
              <h1 className="recruiters-title">Our Recruiters</h1>
              <p className="recruiters-subtitle">Placements & Career Development</p>
            </div>
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
