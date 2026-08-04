import Link from "next/link"
import { LEADERSHIP, leaderBySlug } from "@/data/leadership"

export function generateStaticParams() {
  // Driven by the data, so adding a leader cannot leave their page unbuilt.
  return LEADERSHIP.map((l) => ({ slug: l.slug }))
}

/**
 * `params` is a Promise in this version of Next, so reading params.slug
 * synchronously yielded undefined and every profile rendered "Profile Not
 * Found" - which is what clicking View Profile did.
 */
export default async function LeadershipDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const leader = leaderBySlug(slug)

  if (!leader) {
    return (
      <main style={{ backgroundColor: "#F5EFE4", minHeight: "100vh", padding: "80px 24px", fontFamily: "Arimo, Arial, sans-serif" }}>
        <div style={{ maxWidth: "1760px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ color: "#2B3490", fontSize: "clamp(19px, 5.1vw, 32px)", marginBottom: "16px" }}>Profile Not Found</h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>The leadership profile you&rsquo;re looking for doesn&rsquo;t exist.</p>
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
        .k-container { max-width: 1760px; margin: 0 auto; padding: 0 24px; }
        .k-hero { position: relative; background-image: url('/site-images/topview.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 280px; padding: 0; display: flex; align-items: center; color: white; overflow: hidden; }
        .k-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); z-index: 1; }
        .k-hero-content { position: relative; z-index: 2; }
        .k-hero-content { display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 80px 0; }
        .k-hero-title { font-size: clamp(43px, 11.5vw, 72px); font-weight: 700; margin: 0; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
        .k-back-btn { color: #D4A500; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; width: fit-content; }
        .k-back-btn:hover { color: #FFD700; }
        .k-section { padding: 60px 0; }
        .k-profile-header { display: grid; grid-template-columns: 400px 1fr; gap: 48px; padding: 0; align-items: stretch; }
        .k-profile-photo { width: 100%; object-fit: cover; border: 8px solid #2B3490; border-radius: 8px; box-shadow: 0 4px 12px rgba(43, 52, 144, 0.15); }
        .k-profile-info { padding: 0; display: flex; flex-direction: column; justify-content: flex-start; }
        .k-profile-name { color: #2B3490; font-size: clamp(25px, 6.7vw, 42px); font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
        .k-profile-role { color: #D4A500; font-size: 17px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #D4A500; width: fit-content; }
        .k-quote-icon { font-size: clamp(29px, 7.7vw, 48px); color: #FFE619; opacity: 0.6; margin-bottom: 16px; }
        .k-profile-bio { color: #555; font-size: 16px; line-height: 1.8; margin-bottom: 18px; }
        .k-profile-cred { color: #444; font-size: 15px; font-style: italic; margin-bottom: 18px; }
        .k-profile-msg-heading { color: #2B3490; font-size: 20px; font-weight: 700; margin-bottom: 14px; }
        @media (max-width: 768px) {
          .k-hero { min-height: 280px; }
          .k-hero-title { font-size: clamp(29px, 7.7vw, 48px); }
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
          <div className="k-profile-header">
            <img src={leader.photo} alt={leader.name} className="k-profile-photo" />
            <div className="k-profile-info">
              <div className="k-profile-name">{leader.name}</div>
              <div className="k-profile-role">{leader.role}</div>
              {leader.credential && <div className="k-profile-cred">{leader.credential}</div>}
              <div className="k-quote-icon">&ldquo;</div>
              <h2 className="k-profile-msg-heading">{leader.messageHeading}</h2>
              {leader.paragraphs.map((para, i) => (
                <p className="k-profile-bio" key={i}>{para}</p>
              ))}
              {leader.email && (
                <div style={{ color: "#888", fontSize: "15px", marginTop: "0" }}>
                  📧 <a href={`mailto:${leader.email}`} style={{ color: "#2B3490", textDecoration: "none" }}>
                    {leader.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
