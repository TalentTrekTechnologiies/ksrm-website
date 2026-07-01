import PlacementsSubnav from "@/components/PlacementsSubnav";

const objectives = [
  { icon: "trending-up", text: "To enhance students' employability through industry-relevant skill development, certifications, and career readiness programs." },
  { icon: "award", text: "To facilitate career planning, guidance, and exploration for diverse professional pathways." },
  { icon: "briefcase", text: "To increase internship and placement opportunities through strong industry partnerships and collaborations." },
  { icon: "lightbulb", text: "To promote entrepreneurship, innovation, and leadership among students." },
  { icon: "target", text: "To support higher education aspirations and foster a culture of lifelong learning and professional growth." },
];

function Icon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    "trending-up": (<><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></>),
    "award": (<><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></>),
    "briefcase": (<><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></>),
    "lightbulb": (<><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></>),
    "target": (<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function PlacementsOverviewPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .overview-intro-section { padding: 72px 0; background: #ffffff; }
        .overview-intro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .overview-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .overview-highlight { font-size: 14px; font-weight: 700; color: #D4A500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; display: inline-block; }
        .overview-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .overview-image {
          width: 100%; height: 400px;
          background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); font-size: 14px; text-align: center; padding: 40px;
        }

        .overview-objectives-section { padding: 72px 0; background: #f4f3ef; }
        .overview-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .overview-objectives-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; margin-top: 40px; }
        .overview-objective-card { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; padding: 32px 24px; text-align: center; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .overview-objective-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .overview-icon-circle {
          width: 60px; height: 60px; background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%);
          border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #D4A500;
        }
        .overview-objective-text { font-size: 15px; color: #555; line-height: 1.6; margin: 0; font-weight: 500; }

        .overview-team-section { padding: 72px 0; background: #ffffff; }
        .overview-team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin: 48px 0; }
        .overview-dean-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; transition: all 0.3s; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .overview-dean-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .overview-dean-photo {
          width: 100%; height: 280px; background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%);
          display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.4); font-size: 13px; text-align: center;
        }
        .overview-dean-info { padding: 28px 24px; }
        .overview-dean-name { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 6px; }
        .overview-dean-designation { color: #D4A500; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; }
        .overview-dean-bio { font-size: 13px; color: #666; line-height: 1.6; margin: 0; }
        .overview-commitment-box { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #ffffff; padding: 40px; border-radius: 12px; margin-top: 40px; }
        .overview-commitment-heading { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 16px; color: #D4A500; }
        .overview-commitment-text { font-size: 15px; line-height: 1.8; margin: 0; }

        @media (max-width: 768px) {
          .overview-intro-grid { grid-template-columns: 1fr; gap: 32px; }
          .overview-image { height: 300px; }
          .overview-team-grid { grid-template-columns: 1fr; }
          .overview-text { text-align: left; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <PlacementsSubnav active="/placements/overview" />

        <section className="overview-intro-section">
          <div className="responsive-container">
            <div className="overview-intro-grid">
              <div>
                <h2 className="overview-heading">Career Development & Training and Placement Cell</h2>
                <span className="overview-highlight">About Training and Placement Cell</span>
                <p className="overview-text">
                  The Career Development and Training & Placement Cell at K.S.R.M. College of Engineering serves
                  as a strategic bridge between academia and industry, fostering a culture of excellence, innovation,
                  and career preparedness. The Cell is committed to empowering students with the knowledge, skills,
                  and professional competencies required to thrive in a rapidly evolving global workforce.
                </p>
                <p className="overview-text">
                  Through a comprehensive ecosystem comprising skill development programs, industry certifications,
                  internships, career guidance, and placement assistance, the Cell ensures that students are
                  well-prepared to meet industry expectations and pursue successful careers. The Centre actively
                  collaborates with leading organizations, technology partners, alumni, and industry experts to
                  create meaningful opportunities for students across diverse domains.
                </p>
              </div>
              <div>
                <div className="overview-image">📸 Placeholder Image<br />(Career Development Cell Photo)</div>
              </div>
            </div>
          </div>
        </section>

        <section className="overview-objectives-section">
          <div className="responsive-container">
            <h2 className="overview-section-heading">Objectives of the Career Development Centre</h2>
            <div className="overview-objectives-grid">
              {objectives.map((o) => (
                <div className="overview-objective-card" key={o.icon}>
                  <div className="overview-icon-circle"><Icon name={o.icon} /></div>
                  <p className="overview-objective-text">{o.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overview-team-section">
          <div className="responsive-container">
            <h2 className="overview-section-heading">Our Leadership Team</h2>
            <div className="overview-team-grid">
              <div className="overview-dean-card">
                <div className="overview-dean-photo">Dean – Training & Placements</div>
                <div className="overview-dean-info">
                  <h3 className="overview-dean-name">Mr. Nagaraju Rayapati</h3>
                  <p className="overview-dean-designation">Dean – Training & Placements</p>
                  <p className="overview-dean-bio">
                    Nagaraju Rayapati leads the Training & Placement initiatives at K.S.R.M. College of Engineering with a vision to transform students into industry-ready professionals. He is responsible for designing and implementing strategic employability programs, industry collaborations, career development initiatives, certification pathways, internships, and placement activities.
                  </p>
                  <p className="overview-dean-bio" style={{ marginTop: 12 }}>
                    With extensive experience in academia, skill development, industry relations, and career services, he has been instrumental in establishing structured training ecosystems that focus on technical excellence, professional competencies, and holistic student development. His commitment to innovation and outcome-driven training has significantly contributed to enhancing student employability and career success.
                  </p>
                </div>
              </div>
              <div className="overview-dean-card">
                <div className="overview-dean-photo">Dean – Industry Relations</div>
                <div className="overview-dean-info">
                  <h3 className="overview-dean-name">Mr. Venugopal Marella</h3>
                  <p className="overview-dean-designation">Dean – Industry Relations</p>
                  <p className="overview-dean-bio">
                    Mr. Venugopal Marella plays a pivotal role in coordinating campus recruitment activities and strengthening relationships with industry partners. He works closely with recruiters, students, faculty, and placement coordinators to facilitate internship and placement opportunities across various sectors.
                  </p>
                  <p className="overview-dean-bio" style={{ marginTop: 12 }}>
                    His responsibilities include organizing recruitment drives, coordinating employer engagement activities, managing placement operations, guiding students through the recruitment process, and ensuring seamless interaction between the institution and prospective employers. His dedicated efforts contribute significantly to creating meaningful career opportunities for KSRM students.
                  </p>
                </div>
              </div>
            </div>
            <div className="overview-commitment-box">
              <h3 className="overview-commitment-heading">Our Commitment</h3>
              <p className="overview-commitment-text">
                Together, the Training & Placement Team is committed to fostering a culture of excellence,
                employability, innovation, and lifelong learning.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
