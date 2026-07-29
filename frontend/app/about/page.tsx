"use client"

import { mediaFile } from "@/lib/api-base";
import Link from "next/link"
import PageResources from "@/components/PageResources";

export default function About() {
  const leadershipData = [
    {
      photo: "/images/leadership/correspondent.jpg",
      name: "Smt. K. Rajeswari",
      role: "Secretary cum Correspondent",
      href: "/about/correspondent",
      bio: "Hon'ble Secretary cum Correspondent of KSRM College of Engineering, guiding the institution with unwavering dedication and a vision for quality technical education in the Rayalaseema region of Andhra Pradesh. With her administrative acumen and commitment to academic excellence, she plays a pivotal role in the institution's strategic planning and governance.",
    },
    {
      photo: "/images/leadership/chairman.webp",
      name: "Sri K. Madan Mohan Reddy",
      role: "Chairman",
      href: "/about/chairman",
      bio: "Chairman of K.S.R.M. College of Engineering and custodian of the proud legacy of the Kandula family's educational mission. With decades of experience in institutional governance and strategic management, he provides visionary leadership that guides the college towards educational excellence and social responsibility.",
    },
    {
      photo: "/images/leadership/managing-director.webp",
      name: "Dr. K. Chandra Obula Reddy",
      role: "Vice Chairman & Managing Director",
      email: "md@ksrmce.ac.in",
      href: "/about/managing-director",
      bio: "The Kandula Group of Institutions' youngest and most energetic Managing Director. An entrepreneur who founded KOR Ginning & Oil Mills Private Limited and serves as Director of three organizations. He took over as Managing Director to continue the legacy of his father and grandfather.",
    },
    {
      photo: "/images/leadership/principalphoto.webp",
      name: "Dr. T. Nageswara Prasad",
      role: "Principal",
      email: "principal@ksrmce.ac.in",
      href: "/about/principal",
      bio: "Since its inception in 1980, KSRMCE has shown its impact on producing quality technical graduates not only for the country but also the world. Over the past four decades, KSRMCE has transformed into a premier hub of learning, blending state-of-the-art infrastructure with human resource deeply committed to imparting quality technical education.",
    },
  ]

  const statsData = [
    { number: "45+", label: "Years of Excellence" },
    { number: "35", label: "Acres Campus" },
    { number: "26,700 sqm", label: "Built-up Area" },
    { number: "1,000+", label: "Students Intake" },
    { number: "8", label: "Departments" },
    { number: "4", label: "Hostels" },
  ]

  const strategicDocs = [
    { title: "Strategic Plan 2023-28", url: mediaFile(163), icon: "📊" },
    { title: "Strategic Plan 2018-23", url: mediaFile(164), icon: "📊" },
    { title: "Organizational Procedure Manual", url: mediaFile(165), icon: "📋" },
    { title: "Student Hand Book", url: mediaFile(166), icon: "📚" },
    { title: "Principal Hand Book", url: mediaFile(167), icon: "📖" },
  ]

  const policyDocs = [
    { title: "Institution Core Values", url: mediaFile(168), icon: "🎯" },
    { title: "Code of Professional Conduct", url: mediaFile(169), icon: "📜" },
    { title: "Code of Conduct Handbook", url: mediaFile(170), icon: "📘" },
    { title: "Faculty Evaluation System", url: mediaFile(171), icon: "📈" },
    { title: "Code of Ethics in Research and Innovation", url: mediaFile(172), icon: "🔬" },
  ]

  const jbosDocuments = [
    { title: "Board of Studies Members 2020-21", url: "/demo1/BOARD%20OF%20STUDIES%20MEMBERS%20FOR%20THE%20YEAR%202020-21.pdf", icon: "👥" },
    { title: "04-09-2014", url: "/demo1/JBoSMeeting/JBoS%202014-09-04.pdf", icon: "📄" },
    { title: "22-06-2015", url: "/demo1/JBoSMeeting/JBoS%202015-06-22.pdf", icon: "📄" },
    { title: "08-06-2018", url: "/demo1/JBoSMeeting/JBoS%202018-06-08.pdf", icon: "📄" },
    { title: "03-06-2019", url: "/demo1/JBoSMeeting/JBoS%202019-06-03.pdf", icon: "📄" },
    { title: "28-12-2019", url: "/demo1/JBoSMeeting/JBoS%202019-12-28.pdf", icon: "📄" },
    { title: "10-01-2021", url: "/demo1/JBoSMeeting/JBoS%202021-01-10.pdf", icon: "📄" },
    { title: "04-08-2022", url: "/demo1/JBoSMeeting/JBoS%202022-08-04.pdf", icon: "📄" },
  ]

  return (
    <main style={{ backgroundColor: "#F5EFE4", fontFamily: "Arimo, Arial, Helvetica, sans-serif", color: "#1F2937" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arimo, Arial, Helvetica, sans-serif; }
        .k-container { max-width: 1760px; margin: 0 auto; padding: 0 24px; }
        .k-section { padding: 72px 0; }
        h2 { color: #2B3490; font-size: 40.8px; font-weight: 700; margin-bottom: 48px; text-align: left; }
        h3 { color: #2B3490; font-size: 19px; font-weight: 700; }

        .k-hero { position: relative; background-image: url('/site-images/topview.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; padding: 80px 0; display: flex; align-items: center; color: white; overflow: hidden; }
        .k-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); z-index: 1; }
        .k-hero-content { position: relative; z-index: 2; }
        .k-hero-content { }
        .k-hero-eyebrow { color: #D4A500; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
        .k-hero-title { font-size: 61.2px; font-weight: 700; margin-bottom: 8px; }
        .k-hero-subtitle { color: #D4A500; font-size: 19px; font-weight: 600; }

        .k-stats { background: white; border-top: 2px solid #D4A500; padding: 40px 0; }
        .k-stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px; text-align: center; }
        .k-stat-item { }
        .k-stat-number { color: #2B3490; font-size: clamp(19px, 5.1vw, 32px); font-weight: 700; font-family: Rajdhani; margin-bottom: 8px; }
        .k-stat-label { color: #666; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

        .k-vision-mission { background: white; }
        .k-vision-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        .k-vision-box { background: #F9F9F9; border: 1.6px solid #D4A500; border-radius: 8px; padding: 28px; }
        .k-mission-items { display: flex; flex-direction: column; gap: 16px; }
        .k-mission-item { background: #F4F3EF; border-radius: 8px; padding: 20px; position: relative; }
        .k-mission-badge { position: absolute; top: 12px; right: 12px; background: #2B3490; color: #D4A500; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 4px; }
        .k-mission-text { padding-top: 16px; color: #555; font-size: 15px; line-height: 1.7; }

        .k-leadership { background: #F4F3EF; }
        .k-leadership-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .k-leadership-card { background: white; border: 0.8px solid #E5E7EB; border-radius: 12px; padding: 28px; text-align: center; }
        .k-leader-photo { width: 120px; height: 120px; border: 4px solid #D4A500; border-radius: 50%; object-fit: cover; margin: 0 auto 16px; display: block; }
        .k-leader-name { color: #2B3490; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .k-leader-role { display: inline-block; background: #2B3490; color: white; font-size: 14px; font-weight: 600; padding: 3px 10px; border-radius: 4px; margin-bottom: 16px; }
        .k-leader-email { font-size: 13px; color: #999; margin-bottom: 12px; }
        .k-leader-bio { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
        .k-leader-btn { display: inline-block; background: #2B3490; color: #D4A500; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; }
        .k-leadership-card:hover .k-leader-btn { background: #D4A500; color: #2B3490; }

        .k-docs { background: white; }
        .k-docs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .k-doc-card { background: white; border: 0.8px solid #DDD; border-radius: 8px; padding: 20px; display: flex; gap: 16px; align-items: flex-start; position: relative; transition: all 0.2s; }
        .k-doc-card:hover { border-color: #D4A500; box-shadow: 0 2px 8px rgba(212,165,0,0.1); }
        .k-doc-icon { font-size: 28px; min-width: 44px; height: 44px; background: #EEF1FF; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .k-doc-content { flex: 1; }
        .k-doc-title { color: #2B3490; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .k-doc-subtitle { color: #999; font-size: 13px; }
        .k-doc-link { position: absolute; top: 12px; right: 12px; color: #D4A500; font-size: 17px; }

        .k-contact { background: white; }
        .k-contact-subtitle { text-align: center; color: #999; font-size: 15px; margin-bottom: 32px; }
        .k-contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .k-contact-box { border-radius: 12px; padding: 32px; }
        .k-contact-find { background: linear-gradient(135deg, #2B3490 0%, #1A1D4D 100%); color: white; }
        .k-contact-find h3 { color: #D4A500; }
        .k-contact-other { background: #F9F9F9; border-radius: 12px; padding: 32px; }
        .k-contact-contact { border: 1.6px solid #D4A500; }
        .k-contact-contact h3 { color: #2B3490; }
        .k-contact-connect { border: 0.8px solid #E5E7EB; }
        .k-contact-connect h3 { color: #2B3490; }
        .k-contact-text { font-size: 15px; line-height: 1.8; margin-bottom: 12px; }
        .k-contact-link { color: #2B3490; text-decoration: none; transition: color 0.2s; }
        .k-contact-link:hover { color: #D4A500; }
        .k-social-links { display: flex; gap: 12px; margin-top: 16px; }
        .k-social-btn { display: inline-block; padding: 8px 14px; background: #2B3490; color: white; border-radius: 4px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .k-social-btn:hover { background: #D4A500; color: #2B3490; }

        @media (max-width: 1024px) {
          .k-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .k-leadership-grid { grid-template-columns: repeat(2, 1fr); }
          .k-docs-grid { grid-template-columns: repeat(2, 1fr); }
          .k-contact-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          h2 { font-size: 28px; }
          .k-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .k-vision-grid { grid-template-columns: 1fr; }
          .k-leadership-grid { grid-template-columns: 1fr; }
          .k-docs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO BANNER */}
      <section className="k-hero" style={{ backgroundImage: "url('/banners/about.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="k-container">
          <div className="k-hero-content">
            <div className="k-hero-eyebrow">🏛️ ABOUT US</div>
            <h1 className="k-hero-title">K.S.R.M. College of Engineering</h1>
            <div className="k-hero-subtitle">Excellence in Technical Education Since 1980</div>
          </div>
        </div>
      </section>

      {/* NAVIGATION MENU */}
      <style>{`
        .nav-menu { background: white; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #E5E7EB; }
        .nav-menu .k-container { display: flex; gap: 12px; padding: 16px 0; overflow-x: auto; align-items: center; }
        .nav-link { color: #666; text-decoration: none; font-weight: 600; font-size: 15px; padding: 10px 20px; border-radius: 20px; white-space: nowrap; transition: all 0.2s; }
        .nav-link:hover { color: #333; }
        .nav-link.active { background: #2B3490; color: white; }
      `}</style>

      <nav className="nav-menu">
        <div className="k-container">
          <a href="#stats" className="nav-link active" style={{ background: "#2B3490", color: "white" }}>About</a>
          <a href="#vision-mission" className="nav-link">Vision & Mission</a>
          <a href="#leadership" className="nav-link">Leadership</a>
          <a href="#jbos" className="nav-link">Joint Board of Studies</a>
          <a href="#strategic" className="nav-link">Strategic Plan</a>
          <a href="#policies" className="nav-link">Policies</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
      </nav>

      {/* STATS STRIP */}
      <section className="k-stats" id="stats">
        <div className="k-container">
          <div className="k-stats-grid">
            {statsData.map((stat, i) => (
              <div key={i} className="k-stat-item">
                <div className="k-stat-number">{stat.number}</div>
                <div className="k-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="k-section k-vision-mission" id="vision-mission">
        <div className="k-container">
          <h2>Vision & Mission</h2>
          <div className="k-vision-grid">
            <div>
              <h3 style={{ marginBottom: "16px" }}>Our Vision</h3>
              <div className="k-vision-box">
                <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.7" }}>
                  To evolve as center of repute for providing quality academic programs amalgamated with creative learning and research excellence to produce graduates with leadership qualities, ethical and human values to serve the nation.
                </p>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: "16px" }}>Our Mission</h3>
              <div className="k-mission-items">
                <div className="k-mission-item">
                  <div className="k-mission-badge">M1</div>
                  <div className="k-mission-text">To provide high quality education with enriched curriculum blended with impactful teaching-learning practices.</div>
                </div>
                <div className="k-mission-item">
                  <div className="k-mission-badge">M2</div>
                  <div className="k-mission-text">To promote research, entrepreneurship and innovation through industry collaborations.</div>
                </div>
                <div className="k-mission-item">
                  <div className="k-mission-badge">M3</div>
                  <div className="k-mission-text">To produce highly competent professional leaders for contributing to Socio-economic development of region and the nation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="k-section k-leadership" id="leadership">
        <div className="k-container">
          <h2>Leadership</h2>
          <div className="k-leadership-grid">
            {leadershipData.map((leader, i) => (
              <Link key={i} href={leader.href} style={{ textDecoration: "none" }}>
                <div className="k-leadership-card" style={{ cursor: "pointer" }}>
                  <img src={leader.photo} alt={leader.name} className="k-leader-photo" />
                  <div className="k-leader-name">{leader.name}</div>
                  <div className="k-leader-role">{leader.role}</div>
                  {leader.email && <div className="k-leader-email">📧 {leader.email}</div>}
                  <div className="k-leader-bio">{leader.bio}</div>
                  <div className="k-leader-btn">View Profile →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* JOINT BOARD OF STUDIES */}
      <section className="k-section k-docs" id="jbos">
        <div className="k-container">
          <h2>Joint Board of Studies</h2>
          <div className="k-docs-grid">
            {jbosDocuments.map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="k-doc-card">
                  <div className="k-doc-icon">{doc.icon}</div>
                  <div className="k-doc-content">
                    <div className="k-doc-title">{doc.title}</div>
                    <div className="k-doc-subtitle">Download PDF →</div>
                  </div>
                  <div className="k-doc-link">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGIC PLAN & DEPLOYMENT DOCUMENTS */}
      <section className="k-section k-docs" id="strategic" style={{ background: "#F5EFE4" }}>
        <div className="k-container">
          <h2>Strategic Plan & Deployment Documents</h2>
          <div className="k-docs-grid">
            {strategicDocs.map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="k-doc-card">
                  <div className="k-doc-icon">{doc.icon}</div>
                  <div className="k-doc-content">
                    <div className="k-doc-title">{doc.title}</div>
                    <div className="k-doc-subtitle">Download PDF →</div>
                  </div>
                  <div className="k-doc-link">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL POLICY DOCUMENTS */}
      <section className="k-section k-docs" id="policies">
        <div className="k-container">
          <h2>Institutional Policy Documents</h2>
          <div className="k-docs-grid">
            {policyDocs.map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="k-doc-card">
                  <div className="k-doc-icon">{doc.icon}</div>
                  <div className="k-doc-content">
                    <div className="k-doc-title">{doc.title}</div>
                    <div className="k-doc-subtitle">Download PDF →</div>
                  </div>
                  <div className="k-doc-link">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="k-section k-contact" id="contact">
        <div className="k-container">
          <h2 style={{ textAlign: "center" }}>Get In Touch</h2>
          <div style={{ textAlign: "center", marginBottom: "32px" }} className="k-contact-subtitle">
            EAPCET Code: KSRM | Affiliated to JNTUA | UGC Autonomous
          </div>
          <div className="k-contact-grid">
            <div className="k-contact-box k-contact-find">
              <h3>Find Us</h3>
              <div className="k-contact-text">K.S.R.M. College of Engineering, Kadapa – 516003, Andhra Pradesh, India.</div>
              <div className="k-contact-text" style={{ fontSize: "14px" }}>7 KM from Kadapa town on Kadapa–Pulivendula Highway.</div>
            </div>
            <div className="k-contact-box k-contact-other k-contact-contact">
              <h3>Contact Us</h3>
              <div className="k-contact-text"><a href="tel:+919000073434" className="k-contact-link">+91-9000073434</a></div>
              <div className="k-contact-text"><a href="tel:+918143731960" className="k-contact-link">+91-8143731960</a></div>
              <div className="k-contact-text"><a href="tel:+918562295972" className="k-contact-link">08562-295972</a></div>
              <div className="k-contact-text"><a href="mailto:ksrmcengg@yahoo.co.in" className="k-contact-link">ksrmcengg@yahoo.co.in</a></div>
              <div className="k-contact-text"><a href="mailto:principal@ksrmce.ac.in" className="k-contact-link">principal@ksrmce.ac.in</a></div>
            </div>
            <div className="k-contact-box k-contact-other k-contact-connect">
              <h3>Connect With Us</h3>
              <div className="k-contact-text"><a href="https://www.ksrmce.ac.in" target="_blank" rel="noopener noreferrer" className="k-contact-link">www.ksrmce.ac.in</a></div>
              <div className="k-social-links">
                <a href="https://www.facebook.com/ksrmce" target="_blank" rel="noopener noreferrer" className="k-social-btn">Facebook</a>
                <a href="https://twitter.com/ksrmce" target="_blank" rel="noopener noreferrer" className="k-social-btn">Twitter</a>
                <a href="https://www.instagram.com/ksrmce" target="_blank" rel="noopener noreferrer" className="k-social-btn">Instagram</a>
                <a href="https://www.youtube.com/@ksrmceofficialmedia" target="_blank" rel="noopener noreferrer" className="k-social-btn">YouTube</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <PageResources section="about" />
      </main>
  )
}
