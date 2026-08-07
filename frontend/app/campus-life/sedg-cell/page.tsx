"use client";

import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export default function SedgCellPage() {
  return (
    <main style={{ background: "#ffffff", overflowX: "hidden" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .sedg-hero { position: relative; background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .sedg-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; line-height: 1.08; }
        .sedg-subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin: 16px 0 0; max-width: 700px; }
        .sedg-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; text-align: center; }
        .sedg-text { font-size: 17px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
      `}</style>

      <section className="sedg-hero">
        <div className="responsive-container">
          <h1 className="sedg-title"><CmsText section="sedg-cell" slot="socio-economically-disadvantaged-groups-cell" /></h1>
          <p className="sedg-subtitle"><CmsText section="sedg-cell" slot="support-for-socio-economically-disadvantaged" /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="sedg-section-heading"><CmsText section="sedg-cell" slot="about" /></h2>
          <p className="sedg-text"><CmsText section="sedg-cell" slot="about-body" multiline /></p>
        </div>
      </section>

      <PageResources section="sedg-cell" background="#f4f3ef" />
    </main>
  );
}
