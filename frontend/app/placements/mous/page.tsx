import PlacementsSubnav from "@/components/PlacementsSubnav";

const objectives = [
  { icon: "book-open", text: "Bridge the gap between academic learning and industry expectations." },
  { icon: "award", text: "Enhance employability through industry-aligned training and certifications." },
];

function Icon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    "book-open": (<><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></>),
    "award": (<><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></>),
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function MoUsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        .mous-intro-section { padding: 72px 0; background: #ffffff; }
        .mous-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .mous-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .mous-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .mous-objectives-section { padding: 72px 0; background: #f4f3ef; }
        .mous-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; margin-top: 40px; }
        .mous-card { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; padding: 32px 24px; text-align: center; transition: all 0.3s; }
        .mous-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); }
        .mous-icon-circle { width: 60px; height: 60px; background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #D4A500; }
        .mous-card-text { font-size: 15px; color: #555; line-height: 1.6; margin: 0; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <PlacementsSubnav active="/placements/mous" />

        <section className="mous-intro-section">
          <div className="responsive-container">
            <h2 className="mous-heading">Industry Collaborations & MoUs</h2>
            <p className="mous-text">K.S.R.M. College of Engineering has established strategic partnerships with leading technology companies and organizations to enhance student employability through industry-aligned programs, certifications, internships, and placement opportunities.</p>
          </div>
        </section>

        <section className="mous-objectives-section">
          <div className="responsive-container">
            <h2 className="mous-section-heading">Our Collaborations</h2>
            <div className="mous-grid">
              {objectives.map((o) => (
                <div className="mous-card" key={o.text}>
                  <div className="mous-icon-circle"><Icon name={o.icon} /></div>
                  <p className="mous-card-text">{o.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
