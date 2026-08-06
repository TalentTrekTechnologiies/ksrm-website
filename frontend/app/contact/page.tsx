import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import ContactInfoRow from "@/components/contact/ContactInfoRow";
import OfficeDirectory from "@/components/contact/OfficeDirectory";

export default function ContactPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .contact-hero { position: relative; background-image: url('/banners/contact.webp'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .contact-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
        .contact-hero > * { position: relative; z-index: 2; }
        .contact-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .contact-breadcrumb a { color: #D4A500; text-decoration: none; }
        .contact-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin: 56px 0; align-items: start; }
        .contact-info-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; margin-bottom: 20px; display: flex; gap: 20px; align-items: flex-start; }
        .contact-info-icon { flex-shrink: 0; width: 48px; height: 48px; background: #eef1ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2B3490; }
        .contact-info-content h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
        .contact-info-content p { color: #666; font-size: 15px; margin: 0; line-height: 1.6; }
        .contact-info-content a { color: #2B3490; text-decoration: none; font-weight: 600; }
        .contact-map { border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(43,52,144,0.1); height: 400px; }
        .contact-map iframe { width: 100%; height: 100%; border: none; }
        .contact-departments-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 56px 0; }
        .contact-dept-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; }
        .contact-dept-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; margin: 0 0 16px; }
        .contact-dept-card p { color: #666; font-size: 15px; margin: 0 0 4px; }
        .contact-dept-card a { color: #2B3490; text-decoration: none; font-weight: 600; display: block; margin-bottom: 8px; }
        .contact-hours-banner { background: #D4A500; color: #1a1a2e; padding: 32px; border-radius: 12px; text-align: center; margin: 56px 0; }
        .contact-hours-banner h3 { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; margin: 0; }
        .contact-social { display: flex; gap: 16px; justify-content: center; margin: 48px 0; }
        .contact-social-link { width: 48px; height: 48px; border-radius: 8px; background: #f7f8fa; display: flex; align-items: center; justify-content: center; color: #2B3490; text-decoration: none; }
        @media (max-width: 1024px) { .contact-main-grid { grid-template-columns: 1fr; } .contact-departments-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .contact-main-grid { gap: 32px; } .contact-map { height: 300px; } }
      `}</style>

      <section className="contact-hero">
        <div className="responsive-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="contact" slot="contact-us" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="contact" slot="we-re-here-to-help" /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="contact-main-grid">
            <div>
              <ContactInfoRow />
            </div>
            <div className="contact-map">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.125530584371!2d78.76410318567737!3d14.477480402447771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb373e15c65e6b7%3A0x2b13242197e9d9fa!2zS1NSTSDgsJXgsL7gsLLgsYfgsJzgsY0g4LCG4LCr4LGNIOCwh-CwguCwnOCwv-CwqOCxgOCwsOCwv-CwguCwl-CxjQ!5e0!3m2!1ste!2sin!4v1479195998208" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}><CmsText section="contact" slot="department-contacts" /></h2>
          <div className="contact-departments-grid">
            <OfficeDirectory />
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="contact-hours-banner">
            <h3><CmsText section="contact" slot="working-hours" /></h3>
            <p style={{ margin: "12px 0 0", fontSize: 16 }}><CmsText section="contact" slot="monday-to-saturday-9-00" /></p>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#f7f8fa", textAlign: "center" }}>
        <div className="responsive-container">
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}><CmsText section="contact" slot="follow-us" /></h3>
          <div className="contact-social">
            <a href="https://www.facebook.com/ksrmceofficial" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Facebook">f</a>
            <a href="https://twitter.com/ksrmceofficial" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Twitter">𝕏</a>
            <a href="https://www.instagram.com/ksrmceofficial" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Instagram">◆</a>
            <a href="https://www.youtube.com/ksrmceofficialmedia" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="YouTube">▶</a>
          </div>
        </div>
      </section>

      <PageResources section="contact" />
      </main>
  );
}
