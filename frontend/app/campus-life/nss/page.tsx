import PageResources from "@/components/PageResources";
const aims = [
  "To understand the community in which they work",
  "To understand themselves in relation to their community",
  "To identify the needs and problems of the community and involve them in problem-solving",
  "To develop among themselves a sense of social and civic responsibility",
  "To utilise their knowledge in finding practical solutions to individual and community problems",
  "To develop competence required for group-living and sharing of responsibilities",
  "To gain skills in mobilizing community participation",
  "To acquire leadership qualities and democratic attitude",
  "To develop capacity to meet emergencies and natural disasters",
  "To practise national integration and social harmony",
];

const activities = [
  "Community awareness programs and health camps",
  "Environmental conservation drives and tree plantation",
  "Education support for underprivileged children",
  "Disaster relief and rehabilitation activities",
  "Social welfare programs and counseling",
  "NSS Day celebrations and cultural programs",
  "// activity details and photos from client",
];

export default function NSSPage() {
  return (
    <main style={{ background: "#ffffff", overflowX: "hidden" }}>
      <style>{`
        .responsive-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .nss-hero { position: relative; background-image: url('/banners/nss.png'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .nss-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%); z-index: 1; }
        .nss-hero > * { position: relative; z-index: 2; }
        .nss-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.7); line-height: 1.08; }
        .nss-subtitle { color: rgba(255,255,255,0.95); font-size: 18px; margin: 16px 0 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 300; }
        .nss-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; margin-top: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
        .nss-breadcrumb a { color: #D4A500; text-decoration: none; }
        .nss-breadcrumb span { color: rgba(255,255,255,0.7); }

        .nss-motto-section { padding: 72px 0; background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); text-align: center; }
        .nss-motto-quote { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.4rem, 5vw, 4.2rem); font-weight: 700; color: #D4A500; margin: 0 0 24px; letter-spacing: 1px; }
        .nss-motto-desc { font-size: 16px; color: rgba(255,255,255,0.95); line-height: 1.8; max-width: 800px; margin: 0 auto; }

        .nss-history-text { font-size: 16px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
        .nss-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }

        .nss-aims-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .nss-aim-card { background: #fff; padding: 28px; border-radius: 8px; border-left: 4px solid #D4A500; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .nss-aim-number { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; color: #D4A500; margin: 0 0 8px; }
        .nss-aim-text { font-size: 15px; color: #555; line-height: 1.7; margin: 0; }

        .nss-symbol-container { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .nss-symbol-image { text-align: center; }
        .nss-symbol-content h3 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: #2B3490; margin: 0 0 16px; }
        .nss-symbol-content p { font-size: 16px; color: #555; line-height: 1.8; margin: 0; }

        .nss-activities-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
        .nss-activity-item { background: #fff; padding: 24px; border-radius: 8px; border-top: 3px solid #D4A500; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .nss-activity-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .nss-activity-item p { font-size: 14px; color: #666; line-height: 1.6; margin: 0; }

        @media (max-width: 768px) {
          .nss-symbol-container { grid-template-columns: 1fr; gap: 32px; }
          .nss-aims-grid { grid-template-columns: 1fr; }
          .nss-activities-list { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="nss-hero">
        <div className="responsive-container">
          <h1 className="nss-title">National Service Scheme (NSS)</h1>
          <p className="nss-subtitle">Empowering Youth through Community Service</p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading">History & Background</h2>
          <p className="nss-history-text">
            National Service Scheme (NSS) was launched in 1969, the birth centenary year of Mahatma Gandhi, in 37
            universities involving 40,000 students. NSS is an extension dimension to the higher education system to
            orient student youth to community service while they study. It is implemented by the Ministry of Youth
            Affairs and Sports, Government of India.
          </p>
        </div>
      </section>

      <section className="nss-motto-section">
        <div className="responsive-container">
          <h2 className="nss-motto-quote">"NOT ME BUT YOU"</h2>
          <p className="nss-motto-desc">
            This powerful motto embodies the spirit of selfless service, encouraging NSS volunteers to prioritize the
            welfare of others and communities over personal interests.
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading">Aims & Objectives</h2>
          <div className="nss-aims-grid">
            {aims.map((a, i) => (
              <div className="nss-aim-card" key={a}>
                <div className="nss-aim-number">{i + 1}</div>
                <p className="nss-aim-text">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading">NSS Symbol</h2>
          <div className="nss-symbol-container">
            <div className="nss-symbol-image">
              <div style={{ width: "100%", aspectRatio: "1", background: "linear-gradient(135deg, #2B3490 0%, #D4A500 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 48 }}>🕉️</div>
            </div>
            <div className="nss-symbol-content">
              <h3>NSS Symbol</h3>
              <p>
                The NSS symbol is based on the Rath wheel of the Konark Sun Temple in Odisha. The navy blue colour
                indicates the cosmos of which NSS is a tiny part. The red colour indicates that NSS volunteers are
                full of energy and high spirit. The giant wheels portray the cycle of creation, preservation and
                release, signifying movement across time and space.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading">Annual Activities & Initiatives</h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>
            NSS at KSRMCE conducts regular activities and special initiatives throughout the academic year to engage
            students in community service and social development.
          </p>
          <div className="nss-activities-list">
            {activities.map((a, i) => (
              <div className="nss-activity-item" key={a}>
                <h4>Activity {i + 1}</h4>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PageResources section="nss" />
    </main>
  );
}
