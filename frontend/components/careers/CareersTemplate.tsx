"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { Users, Zap, BookOpen, Award } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function CareersTemplate() {
  const whyJoin = [
    { title: "Excellence in Education", description: "Join an institution recognized for academic excellence", icon: BookOpen },
    { title: "Research Opportunities", description: "Contribute to cutting-edge research initiatives", icon: Zap },
    { title: "Supportive Culture", description: "Work in a collaborative and supportive environment", icon: Users },
    { title: "Career Growth", description: "Access professional development and advancement opportunities", icon: Award },
  ]

  const openings = [
    {
      position: "Assistant Professor - CSE",
      department: "Computer Science & Engineering",
      qualification: "M.Tech/Ph.D. in Computer Science",
      experience: "0-2 years",
    },
    {
      position: "Lab Technician - ECE",
      department: "Electronics & Communication",
      qualification: "Diploma/B.Tech in Electronics",
      experience: "2-3 years",
    },
    {
      position: "Administrative Officer",
      department: "Administration",
      qualification: "Bachelor's Degree",
      experience: "3-5 years",
    },
  ]

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .car-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .car-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .car-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .car-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: color 0.2s;
        }
        .car-breadcrumb a:hover {
          color: #fff;
        }
        .car-whyjoin-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .car-whyjoin-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .car-whyjoin-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
        }
        .car-whyjoin-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .car-whyjoin-card p {
          font-size: 15px;
          color: #666;
          margin: 0;
        }
        .car-openings-list {
          margin: 32px 0;
        }
        .car-opening-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .car-opening-card:hover {
          box-shadow: 0 8px 24px rgba(43,52,144,0.1);
        }
        .car-opening-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 8px;
        }
        .car-cta-button {
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
        .car-cta-button:hover {
          background: #2B3490;
          color: #FFE619;
          transform: translateY(-2px);
        }
        @media (max-width: 1200px) {
          .car-whyjoin-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="car-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="car-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>Careers</span>
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
                Careers at KSRM
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 400,
                  maxWidth: 600,
                }}
              >
                Join Our Team of Excellence
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* WHY JOIN */}
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
              Why Join KSRM?
            </motion.h2>
            <motion.div variants={stagger} className="car-whyjoin-grid">
              {whyJoin.map((item, idx) => {
                const Icon = item.icon
                return (
                  <motion.div key={idx} variants={fadeUp} className="car-whyjoin-card">
                    <h3>
                      <Icon size={24} color="#2B3490" />
                      {item.title}
                    </h3>
                    <p>{item.description}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CURRENT OPENINGS */}
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
              Current Openings
            </motion.h2>
            <motion.div variants={stagger} className="car-openings-list">
              {openings.map((opening, idx) => (
                <motion.div key={idx} variants={fadeUp} className="car-opening-card">
                  <p className="car-opening-title">{opening.position}</p>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
                    <span style={{ fontWeight: 600, color: "#2B3490" }}>Department:</span> {opening.department}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
                      <span style={{ fontWeight: 600, color: "#2B3490" }}>Qualification:</span> {opening.qualification}
                    </p>
                    <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
                      <span style={{ fontWeight: 600, color: "#2B3490" }}>Experience:</span> {opening.experience}
                    </p>
                  </div>
                  <button className="car-cta-button" style={{ marginTop: 12, marginBottom: 0, fontSize: 14, padding: "12px 24px" }}>
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>
              Ready to Join KSRM?
            </h2>
            <a href="mailto:hr@ksrmce.ac.in" className="car-cta-button">
              Contact HR Department
            </a>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
