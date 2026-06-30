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
      photo: "/images/leaderships/correspondent.webp",
      email: "rajeswari@ksrmce.ac.in",
      bio: "Hon'ble Secretary cum Correspondent of KSRM College of Engineering, guiding the institution with unwavering dedication and a vision for quality technical education in the Rayalaseema region of Andhra Pradesh. With her administrative acumen and commitment to academic excellence, she plays a pivotal role in the institution's strategic planning and governance.",
      about: "With decades of experience in educational administration, she has been instrumental in shaping KSRM's growth trajectory. Her vision encompasses not just academic excellence but also the holistic development of students.",
    },
    chairman: {
      name: "Sri K. Madan Mohan Reddy",
      role: "Chairman",
      photo: "/images/leaderships/vicechairman.webp",
      email: "chairman@ksrmce.ac.in",
      bio: "Chairman of K.S.R.M. College of Engineering and custodian of the proud legacy of the Kandula family's educational mission. With decades of experience in institutional governance and strategic management, he provides visionary leadership.",
      about: "His tenure as Chairman has been marked by strategic initiatives that blend tradition with modern educational practices. He envisions KSRM as an institution that produces technically skilled engineers with strong intellectual and ethical capabilities.",
    },
    "managing-director": {
      name: "Dr. K. Chandra Obula Reddy",
      role: "Vice Chairman & Managing Director",
      photo: "/images/leaderships/managing-director.webp",
      email: "md@ksrmce.ac.in",
      bio: "The Kandula Group of Institutions' youngest and most energetic Managing Director. An entrepreneur who founded KOR Ginning & Oil Mills Private Limited and serves as Director of three organizations.",
      about: "Dr. K. Chandra Obula Reddy brings a unique blend of entrepreneurial spirit and educational commitment. His dynamic approach has modernized KSRM's administrative processes and infrastructure.",
    },
    principal: {
      name: "Dr. T. Nageswara Prasad",
      role: "Principal",
      photo: "/images/leaderships/principalphoto.webp",
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
        .k-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
        .k-hero { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); min-height: 320px; padding: 80px 0; display: flex; align-items: center; color: white; }
        .k-hero-title { font-size: 61.2px; font-weight: 700; margin-bottom: 8px; }
        .k-hero-subtitle { color: #D4A500; font-size: 18px; font-weight: 600; }
        .k-section { padding: 72px 0; }
        h2 { color: #2B3490; font-size: 40.8px; font-weight: 700; margin-bottom: 48px; }
        .k-profile-header { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; background: white; padding: 40px; border-radius: 12px; margin-bottom: 40px; }
        .k-profile-photo { width: 280px; height: 280px; border: 6px solid #D4A500; border-radius: 12px; object-fit: cover; }
        .k-profile-info h3 { color: #2B3490; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .k-profile-role { color: #D4A500; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
        .k-profile-email { color: #666; font-size: 14px; margin-bottom: 24px; }
        .k-profile-text { color: #555; font-size: 15px; line-height: 1.8; margin-bottom: 24px; }
        .k-back-link { display: inline-block; padding: 12px 24px; background: #2B3490; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
        .k-back-link:hover { background: #D4A500; color: #2B3490; }
        @media (max-width: 768px) {
          .k-profile-header { grid-template-columns: 1fr; }
          .k-profile-photo { width: 100%; max-width: 280px; margin: 0 auto; }
          h2 { font-size: 28px; }
          .k-hero-title { font-size: 36px; }
        }
      `}</style>

      <section className="k-hero">
        <div className="k-container">
          <Link href="/about" style={{ color: "#D4A500", textDecoration: "none", fontWeight: 600, marginBottom: "16px", display: "block" }}>
            ← Back to About
          </Link>
          <h1 className="k-hero-title">{leader.name}</h1>
          <div className="k-hero-subtitle">{leader.role}</div>
        </div>
      </section>

      <section className="k-section">
        <div className="k-container">
          <div className="k-profile-header">
            <img src={leader.photo} alt={leader.name} className="k-profile-photo" />
            <div className="k-profile-info">
              <h3>{leader.name}</h3>
              <div className="k-profile-role">{leader.role}</div>
              <div className="k-profile-email">
                📧 <a href={`mailto:${leader.email}`} style={{ color: "#2B3490", textDecoration: "none" }}>
                  {leader.email}
                </a>
              </div>
              <div className="k-profile-text">{leader.bio}</div>
              <a href="/about" className="k-back-link">
                ← Back to Leadership
              </a>
            </div>
          </div>

          <div style={{ background: "#F9F9F9", padding: "40px", borderRadius: "12px", border: "1.6px solid #D4A500" }}>
            <h2 style={{ marginTop: 0 }}>About</h2>
            <div className="k-profile-text">{leader.about}</div>
          </div>
        </div>
      </section>
    </main>
  )
}
