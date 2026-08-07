"use client";

import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export default function FacilitiesForDifferentlyAbledPage() {
  return (
    <main style={{ background: "#ffffff", overflowX: "hidden" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .dab-hero { position: relative; background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .dab-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; line-height: 1.08; }
        .dab-subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin: 16px 0 0; max-width: 700px; }
        .dab-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; text-align: center; }
        .dab-text { font-size: 17px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
      `}</style>

      <section className="dab-hero">
        <div className="responsive-container">
          <h1 className="dab-title"><CmsText section="facilities-for-differently-abled" slot="facilities-for-differently-abled" /></h1>
          <p className="dab-subtitle"><CmsText section="facilities-for-differently-abled" slot="a-barrier-free-campus" /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="dab-section-heading"><CmsText section="facilities-for-differently-abled" slot="about" /></h2>
          <p className="dab-text"><CmsText section="facilities-for-differently-abled" slot="about-body" multiline /></p>
        </div>
      </section>

      {/* Documents and images (barrier-free environment evidence) - the same
          Admin -> Downloads / Gallery upload every other page's
          PageResources block already uses. */}
      <PageResources
        section="facilities-for-differently-abled"
        heading="Documents & Photos"
        background="#f4f3ef"
        emptyText="Documents and photos will be published here shortly."
      />
    </main>
  );
}
