"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

export default function LeadershipDetail() {
  const params = useParams()
  const slug = params.slug as string

  const leadershipData = {
    correspondent: {
      name: "Smt. K. Rajeswari",
      role: "Secretary cum Correspondent",
      photo: "/images/leadership/correspondent.jpg",
      email: "rajeswari@ksrmce.ac.in",
      bio: "Hon'ble Secretary cum Correspondent of KSRM College of Engineering, guiding the institution with unwavering dedication and a vision for quality technical education in the Rayalaseema region of Andhra Pradesh. With her administrative acumen and commitment to academic excellence, she plays a pivotal role in the institution's strategic planning and governance.",
      about: "With decades of experience in educational administration, she has been instrumental in shaping KSRM's growth trajectory. Her vision encompasses not just academic excellence but also the holistic development of students.",
    },
    chairman: {
      name: "Sri K. Madan Mohan Reddy",
      role: "Chairman",
      photo: "/images/leadership/chairman.webp",
      email: "chairman@ksrmce.ac.in",
      bio: "Chairman of K.S.R.M. College of Engineering and custodian of the proud legacy of the Kandula family's educational mission. With decades of experience in institutional governance and strategic management, he provides visionary leadership.",
      about: "His tenure as Chairman has been marked by strategic initiatives that blend tradition with modern educational practices. He envisions KSRM as an institution that produces technically skilled engineers with strong intellectual and ethical capabilities.",
    },
    "managing-director": {
      name: "Dr. K. Chandra Obula Reddy",
      role: "Vice Chairman & Managing Director",
      photo: "/images/leadership/managing-director.webp",
      email: "md@ksrmce.ac.in",
      bio: "The Kandula Group of Institutions' youngest and most energetic Managing Director. An entrepreneur who founded KOR Ginning & Oil Mills Private Limited and serves as Director of three organizations.",
      about: "Dr. K. Chandra Obula Reddy brings a unique blend of entrepreneurial spirit and educational commitment. His dynamic approach has modernized KSRM's administrative processes and infrastructure.",
    },
    principal: {
      name: "Dr. T. Nageswara Prasad",
      role: "Principal",
      photo: "/images/leadership/principalphoto.webp",
      email: "principal@ksrmce.ac.in",
      bio: "Since its inception in 1980, KSRMCE has shown its impact on producing quality technical graduates. Over the past four decades, KSRMCE has transformed into a premier hub of learning.",
      about: "His leadership as Principal focuses on creating an educational ecosystem that balances academic rigor with practical application. He champions research initiatives and fosters a culture of continuous improvement.",
    },
  }

  const leader = leadershipData[slug as keyof typeof leadershipData]

  if (!leader) {
    return (
      <main style={{ backgroundColor: "#F5EFE4", minHeight: "100vh", padding: "80px 24px", fontFamily: "Arimo, Arial, sans-serif" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ color: "#2B3490", fontSize: "32px", marginBottom: "16px" }}>Profile Not Found</h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>The leadership profile you're looking for doesn't exist.</p>
          <Link href="/about" style={{ color: "#2B3490", textDecoration: "underline", fontWeight: 600 }}>
            ← Back to Leadership
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: "#F5EFE4", fontFamily: "Arimo, Arial, Helvetica, sans-serif", color: "#1F2937" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .k-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
        .k-hero { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); min-height: 280px; padding: 0; display: flex; align-items: center; color: white; position: relative; }
        .k-hero-content { display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 80px 0; }
        .k-hero-title { font-size: 72px; font-weight: 700; margin: 0; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
        .k-back-btn { color: #D4A500; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; width: fit-content; }
        .k-back-btn:hover { color: #FFD700; }
        .k-section { padding: 60px 0; }
        .k-profile-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
        .k-profile-header { display: grid; grid-template-columns: 380px 1fr; gap: 48px; padding: 48px; align-items: flex-start; }
        .k-profile-photo { width: 100%; height: 380px; border: 8px solid #2B3490; border-radius: 12px; object-fit: cover; }
        .k-profile-info { padding: 12px 0; }
        .k-profile-name { color: #2B3490; font-size: 42px; font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
        .k-profile-role { color: #D4A500; font-size: 16px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #D4A500; width: fit-content; }
        .k-quote-icon { font-size: 48px; color: #FFE619; opacity: 0.6; margin-bottom: 16px; }
        .k-profile-bio { color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 24px; }
        .k-about-section { background: #F9F9F9; padding: 40px; border-top: 1px solid #EEE; }
        .k-about-title { color: #2B3490; font-size: 28px; font-weight: 700; margin-bottom: 20px; }
        .k-about-text { color: #555; font-size: 15px; line-height: 1.8; }
        @media (max-width: 768px) {
          .k-hero { min-height: 280px; }
          .k-hero-title { font-size: 48px; }
          .k-profile-header { grid-template-columns: 1fr; gap: 24px; padding: 24px; }
          .k-profile-photo { height: 320px; }
          .k-profile-name { font-size: 28px; }
        }
      `}</style>

      <section className="k-hero">
        <div className="k-container">
          <div className="k-hero-content">
            <Link href="/about" className="k-back-btn">
              ← Back to About
            </Link>
            <h1 className="k-hero-title">{leader.role}</h1>
          </div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container">
          <div className="k-profile-container">
            <div className="k-profile-header">
              <img src={leader.photo} alt={leader.name} className="k-profile-photo" />
              <div className="k-profile-info">
                <div className="k-profile-name">{leader.name}</div>
                <div className="k-profile-role">{leader.role}</div>
                <div className="k-quote-icon">"</div>
                <div className="k-profile-bio">{leader.bio}</div>
                {leader.email && (
                  <div style={{ color: "#888", fontSize: "14px", marginTop: "24px" }}>
                    📧 <a href={`mailto:${leader.email}`} style={{ color: "#2B3490", textDecoration: "none" }}>
                      {leader.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="k-about-section">
              <h2 className="k-about-title">About</h2>
              <div className="k-about-text">{leader.about}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
