"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Container from "@/components/ui/Container"
import { placements } from "@/data/placements"
import { Award, Users, TrendingUp, Briefcase } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function PlacementsTemplate() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

const statIcons = [Users, Award, TrendingUp, Briefcase]
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .place-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .place-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .place-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .place-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: color 0.2s;
        }
        .place-breadcrumb a:hover {
          color: #fff;
        }
        .place-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 48px 0;
        }
        .place-stat-card {
          background: rgba(255,230,25,0.1);
          border: 1px solid rgba(255,230,25,0.2);
          padding: 28px;
          border-radius: 12px;
          text-align: center;
        }
        .place-stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 8px;
        }
        .place-stat-label {
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }
        .place-table {
          width: 100%;
          border-collapse: collapse;
          margin: 32px 0;
        }
        .place-table th {
          background: #2B3490;
          color: #fff;
          padding: 16px;
          text-align: left;
          font-weight: 600;
        }
        .place-table td {
          padding: 16px;
          border-bottom: 1px solid #eef0f3;
        }
        .place-table tr:nth-child(even) {
          background: #f7f8fa;
        }
        .place-programs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .place-program-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .place-program-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
        }
        .place-program-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .place-program-card p {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }
        .place-recruiters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 32px 0;
        }
        .place-recruiter-pill {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 24px;
          padding: 16px;
          text-align: center;
          font-weight: 600;
          color: #2B3490;
          transition: all 0.2s;
        }
        .place-recruiter-pill:hover {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .place-cta-button {
          display: inline-block;
          background: #FFE619;
          color: #1a1a2e;
          padding: 16px 40px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer;
          border: none;
          margin: 24px 0;
        }
        .place-cta-button:hover {
          background: #2B3490;
          color: #FFE619;
          transform: translateY(-2px);
        }
        .place-contact-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          margin: 48px 0;
        }
        @media (max-width: 1200px) {
          .place-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .place-programs-grid { grid-template-columns: repeat(2, 1fr); }
          .place-recruiters-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .place-stats-grid { grid-template-columns: 1fr; }
          .place-programs-grid { grid-template-columns: 1fr; }
          .place-recruiters-grid { grid-template-columns: repeat(2, 1fr); }
          .place-table { font-size: 14px; }
          .place-table th, .place-table td { padding: 12px; }
        }
      `}</style>

      {/* HERO */}
      <section className="place-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="place-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{placements.pageTitle}</span>
              </div>
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
                {placements.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 300,
                  maxWidth: 600,
                }}
              >
                {placements.subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="place-stats-grid">
            {[
              { label: "Students Placed", value: placements.stats.studentsPlaced, icon: 0 },
              { label: "Companies Visited", value: placements.stats.companiesVisited, icon: 1 },
              { label: "Highest Package", value: placements.stats.highestPackage, icon: 2 },
              { label: "Average Package", value: placements.stats.averagePackage, icon: 3 },
            ].map((stat, idx) => {
              const Icon = statIcons[idx]
              return (
                <motion.div key={stat.label} variants={fadeUp} className="place-stat-card">
                  <Icon size={32} color="#2B3490" style={{ marginBottom: 12 }} />
                  <div className="place-stat-number">{stat.value}</div>
                  <div className="place-stat-label">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} style={{ maxWidth: 820 }}>
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
              About TAP Cell
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0 }}
            >
              {placements.about}
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* PLACEMENT RECORD */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
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
              Placement Record
            </motion.h2>
            <motion.div variants={fadeUp}>
              <table className="place-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Students Placed</th>
                    <th>Companies Visited</th>
                    <th>Highest Package</th>
                    <th>Average Package</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.placementRecord.map((record, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "#2B3490" }}>{record.year}</td>
                      <td>{record.studentsPlaced}</td>
                      <td>{record.companiesVisited}</td>
                      <td style={{ color: "#FFE619", fontWeight: 600 }}>{record.highestPackage}</td>
                      <td>{record.averagePackage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* TRAINING PROGRAMS */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
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
              Training Programs
            </motion.h2>
            <motion.div variants={stagger} className="place-programs-grid">
              {placements.trainingPrograms.map((program, idx) => (
                <motion.div key={idx} variants={fadeUp} className="place-program-card">
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* TOP RECRUITERS */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
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
              Our Top Recruiters
            </motion.h2>
            <motion.div variants={stagger} className="place-recruiters-grid">
              {placements.topRecruiters.map((recruiter, idx) => (
                <motion.div key={idx} variants={fadeUp} className="place-recruiter-pill">
                  {recruiter.name}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* REGISTER CTA */}
      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>
              Ready to Register?
            </h2>
            <a href={placements.registrationLink} target="_blank" rel="noopener noreferrer" className="place-cta-button">
              Register Now
            </a>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} className="place-contact-card">
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: "0 0 20px" }}>
                {placements.contact.officer}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                <div>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 4px" }}>Phone</p>
                  <a href={`tel:${placements.contact.phone}`} style={{ color: "#2B3490", fontWeight: 600, textDecoration: "none" }}>
                    {placements.contact.phone}
                  </a>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 4px" }}>Email</p>
                  <a href={`mailto:${placements.contact.email}`} style={{ color: "#2B3490", fontWeight: 600, textDecoration: "none" }}>
                    {placements.contact.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
