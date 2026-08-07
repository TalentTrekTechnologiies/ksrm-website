"use client";

import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export default function EqualOpportunityCellPage() {
  return (
    <main style={{ background: "#ffffff", overflowX: "hidden" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .eoc-hero { position: relative; background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .eoc-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; line-height: 1.08; }
        .eoc-subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin: 16px 0 0; max-width: 700px; }
        .eoc-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; text-align: center; }
        .eoc-text { font-size: 17px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
      `}</style>

      <section className="eoc-hero">
        <div className="responsive-container">
          <h1 className="eoc-title"><CmsText section="equal-opportunity-cell" slot="equal-opportunity-cell" /></h1>
          <p className="eoc-subtitle"><CmsText section="equal-opportunity-cell" slot="ensuring-equity-and-inclusion" /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="eoc-section-heading"><CmsText section="equal-opportunity-cell" slot="about" /></h2>
          <p className="eoc-text"><CmsText section="equal-opportunity-cell" slot="about-body" multiline /></p>
        </div>
      </section>

      <PageResources section="equal-opportunity-cell" background="#f4f3ef" />
    </main>
  );
}
