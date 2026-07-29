import PageResources from "@/components/PageResources";

const cards = [
  {
    href: "/admissions/ug",
    title: "UG Programs",
    desc: "B.Tech Undergraduate Programs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    href: "/admissions/pg",
    title: "PG Programs",
    desc: "M.Tech & MBA Programs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </svg>
    ),
  },
  {
    href: "/admissions/diploma",
    title: "Diploma",
    desc: "Diploma Engineering Programs",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    ),
  },
];

export default function AdmissionsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .adm-hero {
          position: relative;
          background-image: url('/banners/admissions.png');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }
        .adm-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .adm-hero > * { position: relative; z-index: 2; }
        .adm-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          margin: 0;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
          line-height: 1.08;
        }
        .adm-subtitle {
          color: rgba(255,255,255,0.85);
          font-size: 19px;
          margin: 16px 0 0;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
          font-weight: 400;
        }
        .adm-intro-section { padding: 72px 0; background: #ffffff; }
        .adm-intro-text {
          font-size: 17px;
          color: #555;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto 48px;
          text-align: center;
        }
        .adm-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 48px; }
        .adm-card {
          background: #ffffff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
        }
        .adm-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(43, 52, 144, 0.13); border-color: #D4A500; }
        .adm-card-icon { width: 48px; height: 48px; background: #f7f8fa; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .adm-card-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #2B3490; margin: 0; }
        .adm-card-desc { font-size: 15px; color: #888; margin: 0; }

        @media (max-width: 1024px) { .adm-cards-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .adm-cards-grid { grid-template-columns: 1fr; } .adm-intro-section { padding: 48px 0; } }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="adm-hero">
          <div className="responsive-container">
            <div>
              <h1 className="adm-title">Admissions</h1>
              <p className="adm-subtitle">Join KSRM College of Engineering</p>
            </div>
          </div>
        </section>

        <section className="adm-intro-section">
          <div className="responsive-container">
            <p className="adm-intro-text">
              K.S.R.M. College of Engineering offers quality technical education through multiple academic pathways.
              Explore our undergraduate, postgraduate, and diploma programs designed to shape future engineers
              and innovators.
            </p>
            <div className="adm-cards-grid">
              {cards.map((c) => (
                <a key={c.href} href={c.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div className="adm-card">
                    <div className="adm-card-icon">{c.icon}</div>
                    <h3 className="adm-card-title">{c.title}</h3>
                    <p className="adm-card-desc">{c.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <PageResources section="admissions" />
      </main>
    </>
  );
}
