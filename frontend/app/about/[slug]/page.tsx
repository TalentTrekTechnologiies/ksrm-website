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
      bio: "Hon'ble Secretary cum Correspondent of KSRM College of Engineering, guiding the institution with unwavering dedication and a vision for quality technical education in the Rayalaseema region of Andhra Pradesh. With her administrative acumen and commitment to academic excellence, she plays a pivotal role in the institution's strategic planning and governance. Under her stewardship, KSRM continues to uphold the values of the Kandula family legacy while fostering innovation, research, and holistic student development. Her leadership ensures that the institution remains at the forefront of technical education, empowering students to become responsible citizens and global contributors.\n\nWith decades of experience in educational administration, Smt. K. Rajeswari has been instrumental in shaping KSRM's growth trajectory from a regional institute to a nationally recognized center of excellence. Her vision encompasses not just academic excellence but also the holistic development of students. She believes in creating an ecosystem where innovation, research, and ethical values converge to produce engineers who can make a positive impact on society. Her unwavering commitment to quality assurance, faculty development, and infrastructure enhancement has led to numerous accreditations and recognitions including NAAC A++ and NBA accreditation for multiple programs. She actively participates in policy formulation at national and state levels, advocating for quality technical education accessible to all.",
    },
    chairman: {
      name: "Sri K. Madan Mohan Reddy",
      role: "Chairman",
      photo: "/images/leadership/chairman.webp",
      email: "chairman@ksrmce.ac.in",
      bio: "Chairman of K.S.R.M. College of Engineering and custodian of the proud legacy of the Kandula family's educational mission. With decades of experience in institutional governance and strategic management, he provides visionary leadership that guides the college towards educational excellence and social responsibility. His commitment to nurturing quality technical talent has been instrumental in establishing KSRM as a beacon of learning in the Rayalaseema region. Under his watchful stewardship, the institution continues to evolve, adapt to global standards, and prepare students to meet the challenges of a rapidly changing world while maintaining the values and traditions that define the Kandula Group of Institutions.\n\nSri K. Madan Mohan Reddy's tenure as Chairman has been marked by strategic initiatives that blend tradition with modern educational practices. He envisions KSRM as an institution that not only produces technically skilled engineers but also develops their intellectual and ethical capabilities. His focus on industry collaboration, research promotion, and international partnerships has elevated KSRM's standing in the educational landscape. He believes in the transformative power of education and works tirelessly to ensure that every student receives world-class education combined with practical training. His visionary approach has resulted in the establishment of modern laboratories, collaboration with leading industries, and exchange programs with international universities.",
    },
    "managing-director": {
      name: "Dr. K. Chandra Obula Reddy",
      role: "Vice Chairman & Managing Director",
      photo: "/images/leadership/managing-director.webp",
      email: "md@ksrmce.ac.in",
      bio: "The Kandula Group of Institutions' youngest and most energetic Managing Director. An entrepreneur who founded KOR Ginning & Oil Mills Private Limited and serves as Director of three organizations. He took over as Managing Director to continue the legacy of his father and grandfather, with a passion for delivering high-quality education. Under his capable leadership, the Kandula Group of Institutions is flourishing in all areas with expanded academic programs, enhanced infrastructure, and stronger industry partnerships.\n\nDr. K. Chandra Obula Reddy brings a unique blend of entrepreneurial spirit and educational commitment. His dynamic approach to institutional management has modernized KSRM's administrative processes and infrastructure. He believes in harnessing technology for educational advancement and creating an environment where students can experiment, innovate, and excel. His vision extends beyond campus boundaries, promoting industry-academia partnerships that create real-world learning opportunities. He has successfully implemented digital transformation initiatives, upgraded facilities, and established centers of excellence in emerging technologies. His focus on financial sustainability and institutional excellence has positioned KSRM as one of the premier engineering colleges in South India.",
    },
    principal: {
      name: "Dr. T. Nageswara Prasad",
      role: "Principal",
      photo: "/images/leadership/principalphoto.webp",
      email: "principal@ksrmce.ac.in",
      bio: "Since its inception in 1980, KSRMCE has shown its impact on producing quality technical graduates not only for the country but also the world. Over the past four decades, KSRMCE has transformed into a premier hub of learning, blending state-of-the-art infrastructure with human resource deeply committed to imparting quality technical education. At KSRMCE, we prioritize interdisciplinary research, experiential learning, and outcome-based education (OBE). Beyond the classroom, KSRMCE offers comprehensive education with opportunities for extracurricular and co-curricular activities through technical clubs, cultural events, games, sports, and volunteer work.\n\nDr. T. Nageswara Prasad's leadership as Principal focuses on creating an educational ecosystem that balances academic rigor with practical application. His emphasis on outcome-based education ensures that students acquire competencies essential for professional success. He champions research initiatives, mentors faculty in cutting-edge pedagogies, and fosters a culture of continuous improvement. His open-door policy and stakeholder engagement have strengthened the institution's connection with industry, alumni, and the community at large. Under his stewardship, KSRM has achieved numerous milestones including improved placement outcomes, enhanced research publications, international collaborations, and community development initiatives that align with sustainable development goals.",
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
              <div className="k-profile-bio" style={{ marginBottom: "32px" }}>{leader.about}</div>
                {leader.email && (
                  <div style={{ color: "#888", fontSize: "14px", marginTop: "0" }}>
                    📧 <a href={`mailto:${leader.email}`} style={{ color: "#2B3490", textDecoration: "none" }}>
                      {leader.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
