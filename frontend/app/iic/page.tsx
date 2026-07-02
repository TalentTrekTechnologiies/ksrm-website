"use client";

const objectives = [
  "To create a vibrant local innovation ecosystem",
  "To foster a problem-solving mindset among students",
  "To organize innovation and entrepreneurship-related activities, workshops, and seminars",
  "To identify and nurture promising student innovations and startups",
  "To connect students with mentors, incubators, and funding opportunities",
  "To promote participation in national innovation initiatives and competitions",
];

const activities = [
  { icon: "💡", title: "Innovation Workshops", desc: "Regular workshops on design thinking, prototyping, and innovation methodologies" },
  { icon: "⚡", title: "Idea Hackathons", desc: "Bi-annual hackathons to encourage students to develop innovative solutions to real-world problems" },
  { icon: "🚀", title: "Startup Bootcamps", desc: "Intensive training programs for students interested in launching their own ventures" },
  { icon: "🏆", title: "IPR Awareness", desc: "Sessions on intellectual property rights and patent filing processes" },
  { icon: "📖", title: "Mentorship Programs", desc: "Connect students with industry experts and successful entrepreneurs for guidance" },
  { icon: "👥", title: "National Competitions", desc: "Support and facilitation for participation in national innovation and entrepreneurship competitions" },
];

export default function IICPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .iic-hero { position: relative; background-image: url('/banners/startup banner.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .iic-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); z-index: 1; }
        .iic-hero > * { position: relative; z-index: 2; }
        .iic-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.7); line-height: 1.08; }
        .iic-subtitle { color: rgba(255,255,255,0.95); font-size: 18px; margin: 16px 0 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 300; }
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
        .breadcrumb a { color: #D4A500; text-decoration: none; }
        .breadcrumb span { color: rgba(255,255,255,0.7); }

        .iic-about-text { font-size: 16px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
        .iic-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; }
        .iic-objectives-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .iic-objective-card { background: #fff; padding: 28px; border-radius: 8px; border-top: 3px solid #D4A500; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .iic-objective-text { font-size: 16px; color: #555; line-height: 1.7; margin: 0; }

        .iic-activities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; }
        .iic-activity-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); padding: 36px; border-radius: 12px; text-align: center; color: #fff; box-shadow: 0 8px 24px rgba(43,52,144,0.15); }
        .iic-activity-icon { font-size: 32px; margin-bottom: 16px; display: block; }
        .iic-activity-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #D4A500; margin: 0 0 12px; }
        .iic-activity-description { font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6; margin: 0; }

        .iic-moe-badge { background: linear-gradient(135deg, #D4A500 0%, #E6CE00 100%); padding: 24px; border-radius: 8px; text-align: center; margin: 40px auto; max-width: 600px; }
        .iic-moe-text { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0; }
        .iic-moe-desc { font-size: 14px; color: #1e2570; margin: 8px 0 0; }
      `}</style>

      <section className="iic-hero">
        <div className="responsive-container">
          <div style={{ padding: "0 0 32px 0" }}>
            <div className="breadcrumb"><a href="/">Home</a><span>/</span><span>IIC</span></div>
            <h1 className="iic-title">Institution&apos;s Innovation Council (IIC)</h1>
            <p className="iic-subtitle">Fostering Innovation &amp; Entrepreneurship</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="iic-moe-badge">
            <p className="iic-moe-text">🎓 Ministry of Education Initiative</p>
            <p className="iic-moe-desc">Established under the Innovation Cell (MIC), Government of India</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "0 0 72px", background: "#ffffff" }}>
        <div className="responsive-container">
          <p className="iic-about-text">
            The Institution&apos;s Innovation Council (IIC) at KSRM College of Engineering is established under the
            aegis of the Ministry of Education&apos;s Innovation Cell (MIC), Government of India. The IIC aims to
            foster a culture of innovation and entrepreneurship among students and faculty, encouraging them to work
            on new ideas, prototypes, and startups. It serves as a platform to promote innovation activities,
            organize workshops, and connect students with the startup ecosystem.
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="iic-section-heading">Our Objectives</h2>
          <div className="iic-objectives-grid">
            {objectives.map((o) => (
              <div className="iic-objective-card" key={o}><p className="iic-objective-text">{o}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="iic-section-heading">Key Activities</h2>
          <div className="iic-activities-grid">
            {activities.map((a) => (
              <div className="iic-activity-card" key={a.title}>
                <span className="iic-activity-icon">{a.icon}</span>
                <h3 className="iic-activity-title">{a.title}</h3>
                <p className="iic-activity-description">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
