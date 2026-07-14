"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { cultural } from "@/data/campusLife/cultural"
import { Music, Users, Mic, Palette, BookOpen, Star, Trophy, Phone } from "lucide-react"
import Link from "next/link"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const clubIcons: { [key: string]: React.ReactNode } = {
  Music: <Music size={28} />,
  Users: <Users size={28} />,
  Mic: <Mic size={28} />,
  Palette: <Palette size={28} />,
  BookOpen: <BookOpen size={28} />,
}

export default function CulturalTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .cul-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .cul-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .cul-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .cul-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .cul-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .cul-breadcrumb span {
          color: #FFE619;
        }
        .cul-fest-banner {
          background: linear-gradient(135deg, #FFE619 0%, #ffd700 100%);
          color: #2B3490;
          padding: 40px;
          border-radius: 12px;
          margin-top: 40px;
          text-align: center;
        }
        .cul-fest-name {
          font-family: "Rajdhani", sans-serif;
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 16px;
        }
        .cul-fest-desc {
          font-size: 16px;
          line-height: 1.7;
          margin: 0 0 20px;
        }
        .cul-fest-meta {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        .cul-fest-meta-item {
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
        }
        .cul-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
          justify-content: center;
        }
        .cul-highlight-chip {
          background: rgba(43, 52, 144, 0.1);
          color: #2B3490;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
        }
        .cul-club-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .cul-club-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .cul-club-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .cul-club-icon {
          width: 48px;
          height: 48px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2B3490;
          margin-bottom: 12px;
        }
        .cul-club-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 12px;
        }
        .cul-club-card p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0 0 12px;
        }
        .cul-coordinator {
          font-size: 13px;
          color: #2B3490;
          font-weight: 600;
        }
        .cul-achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .cul-achievement-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cul-achievement-card h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          margin: 0;
        }
        .cul-achievement-card p {
          font-size: 14px;
          margin: 0;
          line-height: 1.6;
        }
        .cul-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
        }
        .cul-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .cul-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .cul-contact-item p {
          font-size: 15px;
          margin: 8px 0 0;
        }
        .cul-contact-item a {
          color: #FFE619;
          text-decoration: none;
        }
        @media (max-width: 900px) {
          .cul-fest-name {
            font-size: 28px;
          }
          .cul-contact-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="cul-hero"
        style={{
          backgroundImage: `url('/images/campus/15.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="cul-eyebrow" style={{ marginBottom: 16 }}>
                Campus Life
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.08,
                  margin: 0,
                }}
              >
                {cultural.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 400,
                  maxWidth: 700,
                }}
              >
                {cultural.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="cul-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{cultural.pageTitle}</span>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* INTRO */}
      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            style={{ maxWidth: 820 }}
          >
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              {cultural.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* KALAKRITI FEST */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="cul-fest-banner">
              <div className="cul-fest-name">{cultural.annualFest.name}</div>
              <div className="cul-fest-desc">{cultural.annualFest.description}</div>
              <div className="cul-fest-meta">
                <div className="cul-fest-meta-item">📅 {cultural.annualFest.month}</div>
              </div>
              <div className="cul-highlights">
                {cultural.annualFest.highlights.map((highlight, idx) => (
                  <div key={idx} className="cul-highlight-chip">
                    ✨ {highlight}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CLUBS */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 40px",
              }}
            >
              Cultural Clubs
            </motion.h2>

            <div className="cul-club-grid">
              {cultural.clubs.map((club, idx) => (
                <motion.div key={idx} variants={fadeUp} className="cul-club-card">
                  <div className="cul-club-icon">{clubIcons[club.icon]}</div>
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                  <div className="cul-coordinator">
                    <Phone size={12} style={{ display: "inline", marginRight: 6 }} />
                    {club.coordinator.phone}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ACHIEVEMENTS */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 40px",
              }}
            >
              Awards & Achievements
            </motion.h2>

            <div className="cul-achievement-grid">
              {cultural.achievements.map((achievement, idx) => (
                <motion.div key={idx} variants={fadeUp} className="cul-achievement-card">
                  <Trophy size={32} style={{ margin: "0 auto" }} />
                  <h4>{achievement.event}</h4>
                  <p>{achievement.result}</p>
                  <span className="cul-badge">{achievement.level}</span>
                  <p style={{ fontSize: 12, opacity: 0.8 }}>{achievement.year}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="cul-contact-card"
          >
            <div className="cul-contact-item">
              <h4>{cultural.culturalSecretary.name}</h4>
              <p>Organizing cultural programmes and events</p>
            </div>
            <div className="cul-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${cultural.culturalSecretary.phone}`}>{cultural.culturalSecretary.phone}</a>
              </p>
            </div>
            <div className="cul-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${cultural.culturalSecretary.email}`}>{cultural.culturalSecretary.email}</a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}

