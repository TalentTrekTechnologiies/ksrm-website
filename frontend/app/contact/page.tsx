import type { ReactElement } from "react";

const infoCards = [
  { icon: "map-pin", title: "Address", content: "K.S.R.M. College of Engineering, Kadapa – 516 003, Andhra Pradesh, India", isLink: false },
  { icon: "phone", title: "Phone", content: "+91 9000073434", href: "tel:+91 9000073434" },
  { icon: "phone", title: "Alternate", content: "08562 295972", href: "tel:08562 295972" },
  { icon: "phone", title: "Alternate", content: "+91 8143731980", href: "tel:+91 8143731980" },
  { icon: "mail", title: "Email", content: "ksrmcengg@yahoo.co.in", href: "mailto:ksrmcengg@yahoo.co.in" },
  { icon: "mail", title: "Alternate", content: "principal@ksrmce.ac.in", href: "mailto:principal@ksrmce.ac.in" },
];

const deptContacts = [
  { title: "Principal Office", phone: "+91 9000073434", phoneHref: "tel:+91 9000073434", email: "principal@ksrmce.ac.in" },
  { title: "Admissions Office", phone: "+91 8143731980", phoneHref: "tel:+91 8143731980", email: "ksrmcengg@yahoo.co.in" },
  { title: "Examination Section", phone: "08562 295972", phoneHref: "tel:08562 295972", email: "principal@ksrmce.ac.in" },
  { title: "Training & Placement", phone: "+91 9000073434", phoneHref: "tel:+91 9000073434", email: "principal@ksrmce.ac.in" },
];

function IconMapPin() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>);
}
function IconPhone() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" /></svg>);
}
function IconMail() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>);
}
const icons: Record<string, () => ReactElement> = { "map-pin": IconMapPin, phone: IconPhone, mail: IconMail };

export default function ContactPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width:  1720px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .contact-hero { position: relative; background-image: url('/banners/contact.png'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
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
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>Contact Us</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>We&apos;re here to help — reach out to us</p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="contact-main-grid">
            <div>
              {infoCards.map((c, i) => {
                const Icon = icons[c.icon];
                return (
                  <div className="contact-info-card" key={c.title + i}>
                    <div className="contact-info-icon"><Icon /></div>
                    <div className="contact-info-content">
                      <h3>{c.title}</h3>
                      {c.href ? <a href={c.href}>{c.content}</a> : <p>{c.content}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="contact-map">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.125530584371!2d78.76410318567737!3d14.477480402447771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb373e15c65e6b7%3A0x2b13242197e9d9fa!2zS1NSTSDgsJXgsL7gsLLgsYfgsJzgsY0g4LCG4LCr4LGNIOCwh-CwguCwnOCwv-CwqOCxgOCwsOCwv-CwguCwl-CxjQ!5e0!3m2!1ste!2sin!4v1479195998208" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Department Contacts</h2>
          <div className="contact-departments-grid">
            {deptContacts.map((d) => (
              <div className="contact-dept-card" key={d.title}>
                <h3>{d.title}</h3>
                <p>Phone:</p>
                <a href={d.phoneHref}>{d.phone}</a>
                <p>Email:</p>
                <a href={`mailto:${d.email}`}>{d.email}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="contact-hours-banner">
            <h3>📅 Working Hours</h3>
            <p style={{ margin: "12px 0 0", fontSize: 16 }}>Monday to Saturday: 9:00 AM – 5:00 PM</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#f7f8fa", textAlign: "center" }}>
        <div className="responsive-container">
          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Follow Us</h3>
          <div className="contact-social">
            <a href="https://www.facebook.com/ksrmceofficial" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Facebook">f</a>
            <a href="https://twitter.com/ksrmceofficial" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Twitter">𝕏</a>
            <a href="https://www.instagram.com/ksrmceofficial" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Instagram">◆</a>
            <a href="https://www.youtube.com/ksrmceofficialmedia" target="_blank" rel="noopener noreferrer" className="contact-social-link" title="YouTube">▶</a>
          </div>
        </div>
      </section>
    </main>
  );
}
