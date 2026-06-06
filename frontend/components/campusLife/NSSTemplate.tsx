"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { nss } from "@/data/campusLife/nss"
import { Users, Leaf, Award, Heart, Phone, Mail } from "lucide-react"
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

const activityIcons = [Heart, Leaf, Award, Heart, Users, Users]

export default function NSSTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .nss-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .nss-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .nss-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .nss-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .nss-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .nss-breadcrumb a:hover {
          opacity: 0.8;
        }
        .nss-breadcrumb span {
          color: #FFE619;
        }
        .nss-about {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          margin-top: 40px;
          font-size: 15px;
          color: #555;
          line-height: 1.8;
        }
        .nss-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .nss-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .nss-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nss-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFE619;
        }
        .nss-stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .nss-activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .nss-activity-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .nss-activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .nss-activity-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nss-activity-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .nss-activity-card p {
          font-size: 13px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .nss-achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .nss-achievement-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .nss-achievement-card h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }
        .nss-achievement-card p {
          font-size: 13px;
          margin: 0;
          line-height: 1.6;
        }
        .nss-officer-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .nss-officer-info h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .nss-officer-info p {
          font-size: 13px;
          margin: 0;
          opacity: 0.9;
        }
        .nss-officer-contact {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .nss-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .nss-contact-item p {
          font-size: 14px;
          margin: 6px 0 0;
        }
        .nss-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .nss-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .nss-officer-card {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="nss-hero"
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
              <motion.div variants={fadeUp} className="nss-eyebrow" style={{ marginBottom: 16 }}>
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
                {nss.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 300,
                  maxWidth: 700,
                }}
              >
                {nss.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="nss-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{nss.pageTitle}</span>
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
              {nss.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ABOUT NSS */}
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
                margin: "0 0 24px",
              }}
            >
              About NSS
            </motion.h2>

            <motion.div variants={fadeUp} className="nss-about">
              {nss.aboutNSS}
            </motion.div>

            {/* STATS */}
            <motion.div variants={stagger} className="nss-stats-bar">
              <motion.div variants={fadeUp} className="nss-stat-item">
                <div className="nss-stat-icon">
                  <Users size={24} color="#FFE619" />
                </div>
                <div className="nss-stat-number">{nss.stats.volunteers}</div>
                <div className="nss-stat-label">Volunteers</div>
              </motion.div>
              <motion.div variants={fadeUp} className="nss-stat-item">
                <div className="nss-stat-icon">
                  <Award size={24} color="#FFE619" />
                </div>
                <div className="nss-stat-number">{nss.stats.campsHeld}</div>
                <div className="nss-stat-label">Camps Held</div>
              </motion.div>
              <motion.div variants={fadeUp} className="nss-stat-item">
                <div className="nss-stat-icon">
                  <Leaf size={24} color="#FFE619" />
                </div>
                <div className="nss-stat-number">{nss.stats.treesPlanted}</div>
                <div className="nss-stat-label">Trees Planted</div>
              </motion.div>
              <motion.div variants={fadeUp} className="nss-stat-item">
                <div className="nss-stat-icon">
                  <Heart size={24} color="#FFE619" />
                </div>
                <div className="nss-stat-number">{nss.stats.villagesAdopted}</div>
                <div className="nss-stat-label">Villages Adopted</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ACTIVITIES */}
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
              NSS Activities
            </motion.h2>

            <div className="nss-activity-grid">
              {nss.activities.map((activity, idx) => {
                const IconComponent = activityIcons[idx]
                return (
                  <motion.div key={idx} variants={fadeUp} className="nss-activity-card">
                    <div className="nss-activity-icon">
                      <IconComponent size={24} color="#2B3490" />
                    </div>
                    <h3>{activity.name}</h3>
                    <p>{activity.description}</p>
                  </motion.div>
                )
              })}
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
              Awards & Recognition
            </motion.h2>

            <div className="nss-achievement-grid">
              {nss.achievements.map((achievement, idx) => (
                <motion.div key={idx} variants={fadeUp} className="nss-achievement-card">
                  <Award size={32} style={{ margin: "0 auto" }} />
                  <h4>{achievement.award}</h4>
                  <p>{achievement.level}</p>
                  <p style={{ fontSize: 11, opacity: 0.8 }}>{achievement.year}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* PROGRAMME OFFICER */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="nss-officer-card"
          >
            <div className="nss-officer-info">
              <h3>{nss.programmeOfficer.name}</h3>
              <p>{nss.programmeOfficer.designation}</p>
              <p style={{ marginTop: 16, opacity: 1, fontSize: 14, lineHeight: 1.6 }}>
                Dedicated to fostering social responsibility and community engagement through NSS initiatives and volunteer outreach programs.
              </p>
            </div>
            <div className="nss-officer-contact">
              <div className="nss-contact-item">
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${nss.programmeOfficer.phone}`}>{nss.programmeOfficer.phone}</a>
                </p>
              </div>
              <div className="nss-contact-item">
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${nss.programmeOfficer.email}`}>{nss.programmeOfficer.email}</a>
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


