"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import Container from "@/components/ui/Container"
import { Leader, leadershipOrder } from "./leaders"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

interface LeadershipProfileProps {
  leader: Leader
}

export default function LeadershipProfile({ leader }: LeadershipProfileProps) {
  const roleLabel = leader.honorific ? `From the ${leader.honorific}'s Desk` : `From the ${leader.role}'s Desk`

  const roleDisplayName = {
    correspondent: "Correspondent",
    "managing-director": "Managing Director",
    chairman: "Chairman",
    principal: "Principal",
  }[leader.slug] || leader.role

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .leadership-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .leadership-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .leadership-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #2B3490;
        }
        .leadership-tabs {
          display: flex; gap: 12px; margin: 32px 0;
          flex-wrap: wrap;
        }
        .leadership-tab {
          padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 600;
          border: 1.5px solid #e0e3ea; color: #555; text-decoration: none;
          transition: all 0.3s ease;
        }
        .leadership-tab.active {
          background: #2B3490; color: #fff; border-color: #2B3490;
        }
        .leadership-tab:hover { border-color: #2B3490; }

        .leadership-grid {
          display: grid; grid-template-columns: 320px 1fr; gap: 48px; align-items: start;
        }
        @media (max-width: 860px) {
          .leadership-grid { grid-template-columns: 1fr; gap: 32px; }
        }

        .leadership-photo {
          width: 100%; aspect-ratio: 3/4; border-radius: 16px; overflow: hidden;
          background: linear-gradient(135deg, #2B3490, #1e2570);
          display: flex; align-items: center; justify-content: center;
        }
        .leadership-photo img { width: 100%; height: 100%; object-fit: cover; }

        .leadership-card {
          background: #f7f8fa; border-radius: 16px; padding: 28px;
          border: 1px solid #eef0f3;
        }
        .leadership-name {
          font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700;
          color: #1a1a2e; margin: 0 0 8px;
        }
        .leadership-credentials {
          font-size: 13px; font-weight: 600; color: #2B3490; margin: 0 0 16px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .leadership-role {
          font-size: 14px; color: #666; margin: 0 0 20px; line-height: 1.6;
        }
        .leadership-contact {
          display: flex; flex-direction: column; gap: 10px;
          padding-top: 16px; border-top: 1px solid #e0e3ea;
        }
        .leadership-contact-item {
          display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555;
        }
        .leadership-contact-item svg { flex-shrink: 0; color: #2B3490; }

        .leadership-message {
          font-size: 16px; line-height: 1.8; color: #555;
        }
        .leadership-message p { margin: 0 0 16px; }
        .leadership-message p:last-child { margin-bottom: 0; }
      `}</style>

      {/* HERO */}
      <section className="leadership-hero">
        <Container>
          <div style={{ padding: "72px 0 48px", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="leadership-eyebrow" style={{ marginBottom: 16 }}>
                Leadership
              </div>
              <h1
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: 0,
                }}
              >
                {roleLabel}
              </h1>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* NAVIGATION TABS */}
      <section style={{ padding: "32px 0 0", borderBottom: "1px solid #eef0f3" }}>
        <Container>
          <div className="leadership-tabs">
            {leadershipOrder.map((slug) => (
              <Link
                key={slug}
                href={`/about/${slug}`}
                className={`leadership-tab ${slug === leader.slug ? "active" : ""}`}
              >
                {roleDisplayName === leader.role ? slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : ["Correspondent", "Managing Director", "Chairman", "Principal"][leadershipOrder.indexOf(slug)]}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "56px 0" }}>
        <Container>
          <div className="leadership-grid">
            {/* LEFT: PHOTO + CARD */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
              <div className="leadership-photo">
                <img src={leader.photo} alt={leader.name} />
              </div>

              {/* IDENTITY CARD */}
              <div className="leadership-card" style={{ marginTop: 24 }}>
                <h2 className="leadership-name">{leader.name}</h2>
                {leader.credentials && <div className="leadership-credentials">{leader.credentials}</div>}
                <div className="leadership-role">{leader.role}</div>

                {(leader.phone || leader.email) && (
                  <div className="leadership-contact">
                    {leader.phone && (
                      <a href={`tel:${leader.phone}`} className="leadership-contact-item" style={{ textDecoration: "none" }}>
                        <Phone size={16} />
                        <span>{leader.phone}</span>
                      </a>
                    )}
                    {leader.email && (
                      <a href={`mailto:${leader.email}`} className="leadership-contact-item" style={{ textDecoration: "none" }}>
                        <Mail size={16} />
                        <span>{leader.email}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* RIGHT: MESSAGE */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
              style={{ paddingTop: 20 }}
            >
              <div style={{ marginBottom: 24 }}>
                <div className="leadership-eyebrow" style={{ marginBottom: 16 }}>
                  Message
                </div>
                <h2
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                    fontWeight: 700, color: "#1a1a2e", margin: 0,
                  }}
                >
                  {leader.honorific || `The ${leader.role}'s Perspective`}
                </h2>
              </div>

              <div className="leadership-message">
                {leader.message.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>
    </main>
  )
}
