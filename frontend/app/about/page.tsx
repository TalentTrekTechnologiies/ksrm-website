"use client"

export default function About() {
  const leadershipData = [
    {
      photo: "/leadership/correspondent.webp",
      name: "Smt. K. Rajeswari",
      role: "Secretary cum Correspondent",
      bio: "Hon'ble Secretary cum Correspondent of KSRM College of Engineering, guiding the institution with unwavering dedication and a vision for quality technical education in the Rayalaseema region of Andhra Pradesh.",
    },
    {
      photo: "/leadership/vicechairman.webp",
      name: "Sri K. Madan Mohan Reddy",
      role: "Chairman",
      bio: "Chairman of K.S.R.M. College of Engineering and custodian of the proud legacy of the Kandula family's educational mission.",
    },
    {
      photo: "/leadership/managing-director.webp",
      name: "Dr. K. Chandra Obula Reddy",
      role: "Vice Chairman & Managing Director",
      email: "md@ksrmce.ac.in",
      bio: "The Kandula Group of Institutions' youngest and most energetic Managing Director.",
    },
    {
      photo: "/leadership/principalphoto.webp",
      name: "Dr. T. Nageswara Prasad",
      role: "Principal",
      email: "principal@ksrmce.ac.in",
      bio: "Since its inception in 1980, KSRMCE has transformed into a premier hub of learning.",
    },
  ]

  return (
    <main style={{ width: "100%", margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .k-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
        .k-section { padding: 72px 0; }
        h1 { font-family: Rajdhani; font-size: 44px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }
        h2 { font-family: Rajdhani; font-size: 36px; font-weight: 700; color: #2B3490; text-align: center; margin-bottom: 40px; }
        p { font-size: 15px; line-height: 1.8; color: #555; }
        a { color: #2B3490; text-decoration: none; }
        a:hover { color: #D4A500; }
        .k-hero { width: 100%; height: 500px; background-image: url(/banner.png); background-size: cover; position: relative; display: flex; align-items: center; justify-content: center; text-align: center; }
        .k-hero::before { content: ''; position: absolute; inset: 0; background: rgba(43,52,144,0.6); z-index: 1; }
        .k-hero-content { position: relative; z-index: 2; color: white; }
        .k-hero-title { font-family: Rajdhani; font-size: 48px; font-weight: 700; margin-bottom: 12px; }
        .k-hero-subtitle { font-size: 18px; margin-bottom: 8px; }
        .k-intro { background: #ffffff; }
        .k-intro-content { display: flex; align-items: center; gap: 48px; }
        .k-intro-text { flex: 1; }
        .k-intro-tagline { font-size: 18px; color: #D4A500; font-weight: 600; margin: 8px 0 24px 0; }
        .k-intro-images { flex: 1; display: flex; gap: 24px; opacity: 0.7; }
        .k-intro-images img { width: 100px; height: 100px; object-fit: contain; }
        .k-vision-mission { background: #f8f9fa; }
        .k-cards-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 32px; }
        .k-card { background: white; padding: 32px; border-radius: 12px; border-left: 4px solid #D4A500; }
        .k-card h3 { font-family: Rajdhani; font-size: 22px; font-weight: 700; color: #2B3490; margin-bottom: 16px; }
        .k-leadership-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 32px; margin-top: 40px; }
        .k-leader-card { background: #f8f9fa; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .k-leader-photo { width: 100%; height: 280px; object-fit: cover; }
        .k-leader-info { padding: 24px; }
        .k-leader-name { font-family: Rajdhani; font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .k-leader-role { font-size: 14px; color: #D4A500; font-weight: 600; margin-bottom: 8px; }
        .k-leader-email { font-size: 13px; color: #888; margin-bottom: 12px; }
        .k-leader-bio { font-size: 14px; line-height: 1.7; color: #555; }
        .k-contact { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); color: white; }
        .k-contact h2 { color: white; }
        .k-contact-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; margin-top: 40px; }
        .k-contact-col h3 { font-family: Rajdhani; font-size: 18px; color: #D4A500; margin-bottom: 16px; }
        .k-contact-col p { color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.8; margin-bottom: 8px; }
        .k-contact-col a { color: #FFE619; }
        @media (max-width:768px) { .k-cards-grid,.k-leadership-grid,.k-contact-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="k-hero">
        <div className="k-hero-content">
          <div className="k-hero-title">K.S.R.M COLLEGE OF ENGINEERING</div>
          <div className="k-hero-subtitle">(UGC - Autonomous) | Kadapa, Andhra Pradesh</div>
          <div className="k-hero-subtitle">Approved by AICTE | Affiliated to JNTUA</div>
        </div>
      </section>

      <section className="k-section k-intro">
        <div className="k-container">
          <div className="k-intro-content">
            <div className="k-intro-text">
              <h1>K.S.R.M. College of Engineering</h1>
              <div className="k-intro-tagline">Excellence in Technical Education Since 1980</div>
              <p>Established in 1980, K.S.R.M. College of Engineering has been a beacon of quality technical education in the Rayalaseema region. Named in memory of Late Sri Srinivasa Reddy, the institution was founded on the vision of Late Sri Kandula Obul Reddy.</p>
              <p>As a UGC Autonomous institution affiliated to JNTUA, KSRMCE combines academic rigor with practical learning, state-of-the-art infrastructure, and a faculty committed to fostering innovation and research.</p>
            </div>
            <div className="k-intro-images">
              <img src="/ring.png" alt="Decorative" />
              <img src="/book.png" alt="Decorative" />
            </div>
          </div>
        </div>
      </section>

      <section className="k-section k-vision-mission">
        <div className="k-container">
          <h2>Vision & Mission</h2>
          <div className="k-cards-grid">
            <div className="k-card">
              <h3>Our Vision</h3>
              <p>To evolve as center of repute for providing quality academic programs amalgamated with creative learning and research excellence to produce graduates with leadership qualities, ethical and human values to serve the nation.</p>
            </div>
            <div className="k-card">
              <h3>Our Mission</h3>
              <p><strong>M1</strong> - To provide high quality education with enriched curriculum blended with impactful teaching-learning practices.</p>
              <p style={{marginTop: "12px"}}><strong>M2</strong> - To promote research, entrepreneurship and innovation through industry collaborations.</p>
              <p style={{marginTop: "12px"}}><strong>M3</strong> - To produce highly competent professional leaders for contributing to Socio-economic development of region and the nation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container">
          <h2>Leadership</h2>
          <div className="k-leadership-grid">
            {leadershipData.map((leader, i) => (
              <div key={i} className="k-leader-card">
                <img src={leader.photo} alt={leader.name} className="k-leader-photo" />
                <div className="k-leader-info">
                  <div className="k-leader-name">{leader.name}</div>
                  <div className="k-leader-role">{leader.role}</div>
                  {leader.email && <div className="k-leader-email">{leader.email}</div>}
                  <div className="k-leader-bio">{leader.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="k-section k-contact">
        <div className="k-container">
          <h2>Get In Touch</h2>
          <div className="k-contact-grid">
            <div className="k-contact-col">
              <h3>Find Us</h3>
              <p>K.S.R.M. College of Engineering<br/>Kadapa – 516003<br/>Andhra Pradesh, India</p>
              <p style={{marginTop: "12px", fontSize: "13px"}}>7 KM from Kadapa town on Kadapa–Pulivendula Highway</p>
            </div>
            <div className="k-contact-col">
              <h3>Contact Us</h3>
              <p><a href="tel:+919000073434">+91-9000073434</a><br/><a href="tel:+918143731980">+91-8143731980</a><br/><a href="tel:+918562295972">08562-295972</a></p>
              <p><a href="mailto:ksrmcengg@yahoo.co.in">ksrmcengg@yahoo.co.in</a><br/><a href="mailto:principal@ksrmce.ac.in">principal@ksrmce.ac.in</a></p>
            </div>
            <div className="k-contact-col">
              <h3>Connect With Us</h3>
              <p><a href="https://www.ksrmce.ac.in" target="_blank" rel="noopener noreferrer">www.ksrmce.ac.in</a></p>
              <div style={{marginTop: "12px", display: "flex", gap: "12px"}}>
                <a href="https://www.facebook.com/ksrmce" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://twitter.com/ksrmce" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://www.instagram.com/ksrmce" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://www.youtube.com/@ksrmceofficialmedia" target="_blank" rel="noopener noreferrer">YouTube</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
