import PlacementsSubnav from "@/components/PlacementsSubnav";

const stages = [
  {
    letter: "K",
    title: "Know Yourself (Assessment & Discovery)",
    desc: "Every successful career journey begins with self-awareness. The first phase identifies students' strengths, interests, aptitude levels, learning gaps, and career aspirations.",
    activities: ["Diagnostic assessments and skill mapping", "Aptitude and logical reasoning evaluations", "Communication proficiency assessments", "Technical competency evaluation", "Career interest identification"],
    outcome: "A personalized development roadmap for every student.",
  },
  {
    letter: "R",
    title: "Reinforce Knowledge (Training & Skill Development)",
    desc: "Based on assessment outcomes, students undergo structured training interventions designed to strengthen their technical, analytical, and professional skills.",
    activities: ["Programming and coding proficiency", "Data Structures and Algorithms", "Core engineering skill enhancement", "Aptitude and reasoning training", "Communication and soft skills development", "Emerging technology training"],
    outcome: "Strong conceptual understanding and industry-relevant competencies.",
  },
  {
    letter: "E",
    title: "Engage Through Practice (Experiential Learning)",
    desc: "Learning becomes meaningful when knowledge is applied. This phase emphasizes hands-on learning through real-world problem-solving activities.",
    activities: ["Coding challenges and competitions", "Skill drills and technical assignments", "Mini projects and capstone projects", "Hackathons and innovation challenges", "Industry case studies", "Collaborative learning activities"],
    outcome: "Enhanced problem-solving abilities and practical skill application.",
  },
  {
    letter: "A",
    title: "Achieve Industry Validation (Certifications)",
    desc: "Industry-recognized certifications validate student competencies and improve career prospects by demonstrating mastery of in-demand skills.",
    activities: ["ServiceNow Certifications", "AWS Academy Certifications", "Cisco Networking Certifications", "Oracle Academy Certifications", "Salesforce Credentials", "Industry-specific certification pathways"],
    outcome: "Globally recognized credentials that strengthen employability.",
  },
  {
    letter: "T",
    title: "Transform Through Industry Exposure (Internships & Industry Connect)",
    desc: "Students gain valuable exposure to workplace practices, professional environments, and industry expectations through internships and collaborative engagements.",
    activities: ["Internships", "Live industry projects", "Expert talks and workshops", "Industrial visits", "Mentoring by industry professionals", "Industry-academia collaborations"],
    outcome: "Real-world experience and enhanced professional readiness.",
  },
  {
    letter: "E",
    title: "Excel in Career Opportunities (Placement Readiness & Career Success)",
    desc: "The final stage focuses on preparing students for successful career transitions through intensive placement readiness programs.",
    activities: ["Resume building and portfolio development", "Mock interviews and group discussions", "Company-specific preparation", "Placement boot camps", "Career counseling and mentoring", "Campus recruitment drives"],
    outcome: "Career-ready graduates equipped to secure rewarding employment opportunities.",
  },
];

export default function TrainingsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .trainings-hero {
          position: relative;
          background-image: url('/site-images/seminar.jpg');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .trainings-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .trainings-hero > * { position: relative; z-index: 2; }
        .trainings-breadcrumb { font-size: 14px; color: rgba(255,255,255,0.7); }
        .trainings-breadcrumb a { color: #D4A500; text-decoration: none; }
        .trainings-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .trainings-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          margin-top: 12px;
          max-width: 600px;
        }

        .trainings-intro-section { padding: 72px 0; background: #ffffff; }
        .trainings-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .trainings-framework-title { font-size: 14px; font-weight: 700; color: #D4A500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: inline-block; }
        .trainings-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .trainings-stages-section { padding: 72px 0; background: #f4f3ef; }
        .trainings-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .trainings-stage-card { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; padding: 32px; margin-bottom: 28px; display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: start; transition: all 0.3s; }
        .trainings-stage-card:hover { box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .trainings-letter-circle { width: 80px; height: 80px; background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #D4A500; font-family: 'Rajdhani', sans-serif; font-size: 48px; font-weight: 700; flex-shrink: 0; }
        .trainings-stage-content h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .trainings-stage-desc { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px; }
        .trainings-stage-subheading { font-weight: 700; color: #2B3490; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
        .trainings-activities { list-style: none; padding: 0; margin: 8px 0 16px; }
        .trainings-activities li { padding: 6px 0 6px 24px; position: relative; font-size: 14px; color: #555; line-height: 1.5; }
        .trainings-activities li::before { content: '→'; position: absolute; left: 0; color: #D4A500; font-weight: 700; }
        .trainings-outcome { background: rgba(255,230,25,0.1); padding: 12px; border-left: 3px solid #D4A500; border-radius: 4px; font-size: 14px; color: #2B3490; font-weight: 600; margin: 0; }
        .trainings-advantage-section { padding: 72px 0; background: #ffffff; }
        .trainings-advantage-box { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #ffffff; padding: 40px; border-radius: 12px; margin: 40px 0; }
        .trainings-advantage-heading { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 16px; color: #D4A500; }
        .trainings-journey { background: rgba(255,230,25,0.1); border: 2px solid #D4A500; padding: 24px; border-radius: 8px; text-align: center; font-family: 'Rajdhani', sans-serif; font-size: 14px; color: #2B3490; font-weight: 700; line-height: 1.8; }
        @media (max-width: 768px) { .trainings-stage-card { grid-template-columns: 1fr; gap: 16px; } .trainings-letter-circle { width: 60px; height: 60px; font-size: 36px; } .trainings-text { text-align: left; } }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="trainings-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="trainings-title">Trainings</h1>
              <p className="trainings-subtitle">Placements & Career Development</p>
            </div>
          </div>
        </section>
        <PlacementsSubnav active="/placements/trainings" />
        <section className="trainings-intro-section">
          <div className="responsive-container">
            <h2 className="trainings-heading">Trainings & k-ReATE Framework</h2>
            <span className="trainings-framework-title">Knowledge for Recruitment And Talent Enablement</span>
            <p className="trainings-text">
              At K.S.R.M. College of Engineering, training is not viewed as a standalone activity but as a strategic and continuous process designed to nurture talent, build competencies, and enhance employability. The institution's unique k-ReATE Framework serves as a comprehensive roadmap that guides students from foundational learning to successful career outcomes.
            </p>
            <p className="trainings-text">
              The framework is built on a systematic approach that integrates assessment, skill development, practical application, industry exposure, certifications, internships, and placement readiness. Through k-ReATE, students are empowered to develop the knowledge, skills, attitude, and professional competencies required to excel in a dynamic and competitive global workforce.
            </p>
          </div>
        </section>
        <section className="trainings-stages-section">
          <div className="responsive-container">
            <h2 className="trainings-section-heading">The k-ReATE Framework Stages</h2>
            {stages.map((s, i) => (
              <div className="trainings-stage-card" key={i}>
                <div className="trainings-letter-circle">{s.letter}</div>
                <div className="trainings-stage-content">
                  <h3>{s.title}</h3>
                  <p className="trainings-stage-desc">{s.desc}</p>
                  <p className="trainings-stage-subheading">Key Activities:</p>
                  <ul className="trainings-activities">
                    {s.activities.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                  <p className="trainings-stage-subheading">Outcome:</p>
                  <p className="trainings-outcome">{s.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="trainings-advantage-section">
          <div className="responsive-container">
            <div className="trainings-advantage-box">
              <h3 className="trainings-advantage-heading">The k-ReATE Advantage</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, margin: "0 0 24px" }}>
                The k-ReATE Framework embodies KSRMCE's commitment to transforming potential into performance and aspirations into achievements. By integrating assessment, training, practice, certification, industry exposure, and placement readiness into a single cohesive ecosystem, the framework ensures that every student is empowered to build a successful and sustainable career.
              </p>
              <div className="trainings-journey">
                Know Yourself → Reinforce Knowledge → Engage Through Practice → Achieve Industry Validation → Transform Through Industry Exposure → Excel in Career Opportunities
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
