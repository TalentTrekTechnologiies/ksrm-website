import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

﻿import PlacementsSubnav from "@/components/PlacementsSubnav";

export default function InternshipsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .internships-hero {
          position: relative;
          background-image: url('/banners/internships.png');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .internships-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .internships-hero > * { position: relative; z-index: 2; }
        .internships-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .internships-breadcrumb a { color: #D4A500; text-decoration: none; }
        .internships-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .internships-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 17px;
          margin-top: 12px;
          max-width: 600px;
        }

        .internships-section { padding: 72px 0; background: #ffffff; }
        .internships-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .internships-text { font-size: 17px; line-height: 1.8; color: #555; margin: 16px 0; }
        .internships-list { list-style: none; padding: 0; margin: 32px 0; }
        .internships-list li { padding: 12px 0 12px 28px; position: relative; font-size: 16px; color: #555; line-height: 1.6; }
        .internships-list li::before { content: '✓'; position: absolute; left: 0; color: #D4A500; font-weight: 700; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="internships-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="internships-title"><CmsText section="placements.internships" slot="internships" /></h1>
              <p className="internships-subtitle"><CmsText section="placements.internships" slot="placements-career-development" /></p>
            </div>
          </div>
        </section>
        <PlacementsSubnav active="/placements/internships" />
        <section className="internships-section">
          <div className="responsive-container">
            <h2 className="internships-heading"><CmsText section="placements.internships" slot="internships-2" /></h2>
            <p className="internships-text"><CmsText section="placements.internships" slot="at-k-s-r-m" multiline /></p>
            <p className="internships-text"><CmsText section="placements.internships" slot="our-internship-programs-offer-students" multiline /></p>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "32px 0 16px" }}><CmsText section="placements.internships" slot="key-highlights" /></h3>
            <ul className="internships-list">
              <li>Industry internships facilitated through institutional MoUs</li>
              <li>Virtual and onsite internship opportunities</li>
              <li>Project-based learning experiences</li>
              <li>Mentoring from industry professionals</li>
              <li>Integration with certification programs</li>
            </ul>
          </div>
        </section>
      
      <PageResources section="placements.internships" />
      </main>
    </>
  );
}
