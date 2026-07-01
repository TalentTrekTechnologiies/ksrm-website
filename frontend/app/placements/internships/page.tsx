import PlacementsSubnav from "@/components/PlacementsSubnav";

export default function InternshipsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        .internships-section { padding: 72px 0; background: #ffffff; }
        .internships-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .internships-text { font-size: 16px; line-height: 1.8; color: #555; margin: 16px 0; }
        .internships-list { list-style: none; padding: 0; margin: 32px 0; }
        .internships-list li { padding: 12px 0 12px 28px; position: relative; font-size: 15px; color: #555; line-height: 1.6; }
        .internships-list li::before { content: '✓'; position: absolute; left: 0; color: #D4A500; font-weight: 700; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <PlacementsSubnav active="/placements/internships" />
        <section className="internships-section">
          <div className="responsive-container">
            <h2 className="internships-heading">Internships</h2>
            <p className="internships-text">At K.S.R.M. College of Engineering, internships provide valuable opportunities to bridge the gap between classroom learning and industry practice. Through strategic partnerships with leading organizations, we facilitate meaningful internship experiences.</p>
            <p className="internships-text">Our internship programs offer students exposure to real-world challenges, industry tools, professional environments, and project-based learning across diverse domains including Software Development, AI & ML, Data Science, Cloud Computing, and Core Engineering.</p>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "32px 0 16px" }}>Key Highlights</h3>
            <ul className="internships-list">
              <li>Industry internships facilitated through institutional MoUs</li>
              <li>Virtual and onsite internship opportunities</li>
              <li>Project-based learning experiences</li>
              <li>Mentoring from industry professionals</li>
              <li>Integration with certification programs</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
