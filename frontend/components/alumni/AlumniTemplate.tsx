"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { Users, Building2, Globe, Award } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function AlumniTemplate() {
  const statIcons = [Users, Building2, Globe, Award]

  const notableAlumni = [
    {
      name: "Dr. Rajesh Kumar",
      batch: "2008",
      company: "Google",
      designation: "Senior Software Engineer",
    },
    {
      name: "Smt. Anitha Reddy",
      batch: "2010",
      company: "Microsoft India",
      designation: "Project Manager",
    },
    {
      name: "Sri. Vishwanath Sharma",
      batch: "2012",
      company: "Infosys",
      designation: "Principal Architect",
    },
    {
      name: "Dr. Priya Mehta",
      batch: "2015",
      company: "TCS Research",
      designation: "Research Scientist",
    },
  ]

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .alum-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .alum-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .alum-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .alum-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: color 0.2s;
        }
        .alum-breadcrumb a:hover {
          color: #fff;
        }
        .alum-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 48px 0;
        }
        .alum-stat-card {
          background: rgba(255,230,25,0.1);
          border: 1px solid rgba(255,230,25,0.2);
          padding: 28px;
          border-radius: 12px;
          text-align: center;
        }
        .alum-stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 8px;
        }
        .alum-stat-label {
          font-size: 15px;
          color: #666;
          font-weight: 600;
        }
        .alum-notable-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .alum-alumni-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .alum-alumni-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
        }
        .alum-alumni-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 4px;
        }
        .alum-alumni-card p {
          font-size: 14px;
          color: #666;
          margin: 0 0 8px;
        }
        .alum-cta-button {
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
          margin: 12px 8px 12px 0;
        }
        .alum-cta-button:hover {
          background: #2B3490;
          color: #FFE619;
          transform: translateY(-2px);
        }
        .alum-cta-button-secondary {
          display: inline-block;
          background: transparent;
          color: #2B3490;
          padding: 16px 40px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer;
          border: 2px solid #2B3490;
          margin: 12px 8px 12px 0;
        }
        .alum-cta-button-secondary:hover {
          background: #2B3490;
          color: #FFE619;
        }
        @media (max-width: 1200px) {
          .alum-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .alum-notable-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .alum-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="alum-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="alum-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>Alumni</span>
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
                Alumni
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
                Our Pride, Our Legacy
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="alum-stats-grid">
            {[
              { label: "Alumni", value: "10000+", icon: 0 },
              { label: "Companies", value: "500+", icon: 1 },
              { label: "Countries", value: "25+", icon: 2 },
              { label: "Years Legacy", value: "40+", icon: 3 },
            ].map((stat, idx) => {
              const Icon = statIcons[idx]
              return (
                <motion.div key={stat.label} variants={fadeUp} className="alum-stat-card">
                  <Icon size={32} color="#2B3490" style={{ marginBottom: 12 }} />
                  <div className="alum-stat-number">{stat.value}</div>
                  <div className="alum-stat-label">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* NOTABLE ALUMNI */}
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
              Notable Alumni
            </motion.h2>
            <motion.div variants={stagger} className="alum-notable-grid">
              {notableAlumni.map((alumni, idx) => (
                <motion.div key={idx} variants={fadeUp} className="alum-alumni-card">
                  <h3>{alumni.name}</h3>
                  <p style={{ color: "#FFE619", fontWeight: 600, margin: "0 0 8px" }}>Batch: {alumni.batch}</p>
                  <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 12 }}>
                    <p><span style={{ color: "#2B3490", fontWeight: 600 }}>Company:</span> {alumni.company}</p>
                    <p><span style={{ color: "#2B3490", fontWeight: 600 }}>Designation:</span> {alumni.designation}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ALUMNI ASSOCIATION */}
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
              Alumni Association
            </motion.h2>
            <motion.div
              variants={fadeUp}
              style={{
                background: "#f7f8fa",
                borderRadius: 12,
                padding: 32,
                marginTop: 24,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <p style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8 }}>
                    The KSRM Alumni Association connects graduates across the globe. Our mission is to foster lifelong relationships, facilitate knowledge sharing, and support institutional development. Through networking events, mentorship programs, and scholarship initiatives, we strengthen the bond between KSRM and its alumni community.
                  </p>
                </div>
                <div>
                  <button className="alum-cta-button">Update Your Profile</button>
                  <br />
                  <button className="alum-cta-button-secondary">Contribute to Alumni Fund</button>
                  <br />
                  <button className="alum-cta-button">Attend Reunion Event</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>
              Join the KSRM Alumni Network
            </h2>
            <button className="alum-cta-button">Register as Alumni</button>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
