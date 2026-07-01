import PlacementsSubnav from "@/components/PlacementsSubnav";

const highlights = [
  "Industry internships facilitated through institutional MoUs and strategic partnerships.",
  "Virtual and onsite internship opportunities across technology and core engineering domains.",
  "Internship pathways integrated with certification programs offered by industry partners.",
  "Access to project-based learning experiences aligned with current industry requirements.",
  "Opportunities to work on real-world business problems, case studies, and live projects.",
  "Mentoring and guidance from industry professionals and domain experts.",
  "Internship opportunities through platforms and initiatives offered by leading organizations and technology ecosystems.",
];

const ecosystem = [
  { icon: "📋", text: "Industry-Sponsored Internship Programs" },
  { icon: "⚡", text: "Virtual Internship Opportunities" },
  { icon: "💻", text: "Technology Partner Internship Programs" },
  { icon: "🎯", text: "Project-Based Internships" },
  { icon: "🏆", text: "Certification-Integrated Internships" },
  { icon: "👥", text: "Summer and Semester Internships" },
  { icon: "💡", text: "Innovation and Research Internships" },
  { icon: "🚀", text: "Startup and Entrepreneurship Internships" },
];

const outcomes = [
  "Apply theoretical knowledge in practical environments.",
  "Develop problem-solving and critical-thinking abilities.",
  "Gain exposure to industry tools, technologies, and best practices.",
  "Build professional networks and workplace competencies.",
  "Enhance employability through hands-on experience and industry-recognized achievements.",
  "Improve readiness for campus recruitment and future career opportunities.",
];

export default function InternshipsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        .internships-intro-section { padding: 72px 0; background: #ffffff; }
        .internships-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .internships-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .internships-highlights-section { padding: 72px 0; background: #f4f3ef; }
        .internships-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .internships-list { list-style: none; padding: 0; margin: 32px 0; }
        .internships-list li { padding: 12px 0 12px 28px; position: relative; font-size: 15px; color: #555; line-height: 1.6; }
        .internships-list li::before { content: '✓'; position: absolute; left: 0; color: #D4A500; font-weight: 700; font-size: 16px; }
        .internships-ecosystem-section { padding: 72px 0; background: #ffffff; }
        .internships-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; margin-top: 40px; }
        .internships-card { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; padding: 32px 24px; text-align: center; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .internships-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .internships-icon { font-size: 32px; margin-bottom: 12px; }
        .internships-card-text { font-size: 15px; color: #555; line-height: 1.6; margin: 0; font-weight: 500; }
        .internships-outcomes-section { padding: 72px 0; background: #f4f3ef; }
        .internships-closing-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; margin: 32px 0 0; font-style: italic; font-weight: 500; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section style={{ background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)", padding: "60px 0 40px", color: "white", position: "relative" }>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
          <div className="responsive-container" style={{ position: "relative", zIndex: 2 }>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 12, color: "rgba(255,255,255,0.7)" }>
              <a style={{ color: "#D4A500", textDecoration: "none" }} href="/">Home</a>
              <span>/</span>
              <a style={{ color: "#D4A500", textDecoration: "none" }} href="/placements">Placements</a>
              <span>/</span>
              <span>Internships</span>
            </div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.1, textAlign: "left" }>Internships</h1>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 12, maxWidth: 600 }>Placements & Career Development</p>
          </div>
        </section>
        <PlacementsSubnav active="/placements/internships" />

        <section className="internships-intro-section">
          <div className="responsive-container">
            <h2 className="internships-heading">Internships</h2>
            <p className="internships-text">
              At K.S.R.M. College of Engineering, internships are an integral component of the student development ecosystem, providing valuable opportunities to bridge the gap between classroom learning and industry practice. Through strategic partnerships and Memoranda of Understanding (MoUs) with leading organizations, technology providers, and industry partners, the institution facilitates meaningful internship experiences that enhance technical competencies, professional skills, and workplace readiness.
            </p>
            <p className="internships-text">
              The Training & Placement Cell actively collaborates with industry partners to identify and create internship opportunities across diverse domains, including Software Development, Artificial Intelligence & Machine Learning, Data Science, Cloud Computing, Cybersecurity, Networking, Enterprise Technologies, Core Engineering, and Emerging Technologies.
            </p>
            <p className="internships-text">
              As part of the k-ReATE Framework, students are encouraged to participate in internships that complement their academic learning and provide exposure to real-world challenges, industry tools, professional work environments, and project-based learning experiences.
            </p>
          </div>
        </section>

        <section className="internships-highlights-section">
          <div className="responsive-container">
            <h2 className="internships-section-heading">Key Highlights</h2>
            <ul className="internships-list">
              {highlights.map((h) => <li key={h}>{h}</li>)}
            </ul>
          </div>
        </section>

        <section className="internships-ecosystem-section">
          <div className="responsive-container">
            <h2 className="internships-section-heading">Our Internship Ecosystem</h2>
            <div className="internships-grid">
              {ecosystem.map((item) => (
                <div className="internships-card" key={item.text}>
                  <div className="internships-icon">{item.icon}</div>
                  <p className="internships-card-text">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="internships-closing-text">
              At KSRMCE, internships are not merely academic requirements; they are transformational learning experiences that prepare students to become confident, competent, and industry-ready professionals.
            </p>
          </div>
        </section>

        <section className="internships-outcomes-section">
          <div className="responsive-container">
            <h2 className="internships-section-heading">Internship Outcomes</h2>
            <p className="internships-text">Internships enable students to:</p>
            <ul className="internships-list">
              {outcomes.map((o) => <li key={o}>{o}</li>)}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}



