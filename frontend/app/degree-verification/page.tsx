import CmsText from "@/components/CmsText";
﻿const steps = [
  { n: 1, title: "Visit iCredify Portal", desc: "Go to the official verification portal at icredify.com" },
  { n: 2, title: "Enter Certificate Details", desc: "Enter the certificate number, student name or other required details" },
  { n: 3, title: "Verify Instantly", desc: "Get instant verification results online" },
];

export default function DegreeVerificationPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .dv-hero { position: relative; background-image: url('/banners/degree-verification.png'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .dv-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); pointer-events: none; }
        .dv-hero > * { position: relative; z-index: 2; }
        .dv-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .dv-breadcrumb a { color: #D4A500; text-decoration: none; }
        .dv-about { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 40px; margin: 0 auto; max-width: 820px; }
        .dv-about p { color: #555; font-size: 15.5px; line-height: 1.8; margin: 0; text-align: center; }
        .dv-cta-button { display: inline-block; background: #D4A500; color: #1a1a2e; padding: 20px 48px; border-radius: 8px; font-weight: 700; text-decoration: none; font-family: 'Rajdhani', sans-serif; font-size: 17px; }
        .dv-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .dv-step-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 40px 28px; text-align: center; }
        .dv-step-number { font-family: 'Rajdhani', sans-serif; font-size: clamp(29px, 7.7vw, 48px); font-weight: 700; color: #D4A500; margin-bottom: 20px; }
        .dv-step-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .dv-step-card p { color: #666; font-size: 15px; line-height: 1.6; margin: 0; }
        .dv-contact-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 32px; margin: 0 auto; max-width: 600px; }
        .dv-contact-card h2 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 20px; }
        .dv-contact-card a { color: #2B3490; font-weight: 600; text-decoration: none; display: block; margin-bottom: 8px; }
        @media (max-width: 1024px) { .dv-steps-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="dv-hero">
        <div className="responsive-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="degree-verification" slot="degree-verification" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="degree-verification" slot="verify-the-authenticity-of-degrees" /></p>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="dv-about">
            <p><CmsText section="degree-verification" slot="k-s-r-m-college" multiline /></p>
          </div>
        </div>
      </section>

      <section style={{ padding: 0, background: "#ffffff", textAlign: "center" }}>
        <div className="responsive-container">
          <a href="http://icredify.com/degreeverify/ksrm" target="_blank" rel="noopener noreferrer" className="dv-cta-button">🔗 Verify Degree Online</a>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px", textAlign: "center" }}><CmsText section="degree-verification" slot="how-to-verify-your-degree" /></h2>
          <div className="dv-steps-grid">
            {steps.map((s) => (
              <div className="dv-step-card" key={s.n}>
                <div className="dv-step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="dv-contact-card">
            <h2><CmsText section="degree-verification" slot="examination-section" /></h2>
            <p><strong>Phone:</strong></p>
            <a href="tel:08562 295972">08562 295972</a>
            <p style={{ marginTop: 12 }}><strong>Email:</strong></p>
            <a href="mailto:principal@ksrmce.ac.in">principal@ksrmce.ac.in</a>
          </div>
        </div>
      </section>
    </main>
  );
}
