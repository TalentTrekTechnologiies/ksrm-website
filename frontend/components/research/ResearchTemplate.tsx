"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { Book, Award, Lightbulb, Users } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function ResearchTemplate() {
  const statIcons = [Book, Award, Lightbulb, Users]

  const researchCenters = [
    {
      name: "Center for VLSI & Embedded Systems",
      description: "Advanced research in chip design and embedded systems",
      faculty: "15+",
      projects: "12+",
    },
    {
      name: "Center for AI & Machine Learning",
      description: "Cutting-edge research in artificial intelligence and deep learning",
      faculty: "18+",
      projects: "14+",
    },
    {
      name: "Center for Structural Engineering",
      description: "Innovation in structural design and sustainable construction",
      faculty: "12+",
      projects: "10+",
    },
  ]

  const ongoingProjects = [
    {
      title: "Smart Grid Control Systems using AI",
      department: "Electrical & Electronics Engineering",
      agency: "Department of Science & Technology",
      amount: "₹28 Lakhs",
      duration: "2023-2025",
    },
    {
      title: "Biomedical Signal Processing for Remote Health Monitoring",
      department: "Electronics & Communication Engineering",
      agency: "SERB",
      amount: "₹22 Lakhs",
      duration: "2023-2026",
    },
    {
      title: "Sustainable Building Materials from Industrial Waste",
      department: "Civil Engineering",
      agency: "Ministry of Environment",
      amount: "₹35 Lakhs",
      duration: "2023-2027",
    },
    {
      title: "IoT-Based Water Quality Monitoring System",
      department: "Computer Science & Engineering",
      agency: "INNOVATE India Challenge",
      amount: "₹18 Lakhs",
      duration: "2024-2026",
    },
  ]

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .res-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .res-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .res-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .res-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: color 0.2s;
        }
        .res-breadcrumb a:hover {
          color: #fff;
        }
        .res-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 48px 0;
        }
        .res-stat-card {
          background: rgba(255,230,25,0.1);
          border: 1px solid rgba(255,230,25,0.2);
          padding: 28px;
          border-radius: 12px;
          text-align: center;
        }
        .res-stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #2B3490;
          margin-bottom: 8px;
        }
        .res-stat-label {
          font-size: 15px;
          color: #666;
          font-weight: 600;
        }
        .res-centers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .res-center-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .res-center-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
        }
        .res-center-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .res-center-card p {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .res-projects-list {
          margin: 32px 0;
        }
        .res-project-item {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .res-project-item:hover {
          box-shadow: 0 8px 24px rgba(43,52,144,0.1);
        }
        .res-cta-button {
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
        .res-cta-button:hover {
          background: #2B3490;
          color: #FFE619;
          transform: translateY(-2px);
        }
        @media (max-width: 1200px) {
          .res-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .res-centers-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .res-stats-grid { grid-template-columns: 1fr; }
          .res-centers-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="res-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="res-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>Research & Innovation</span>
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
                Research & Innovation
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
                Advancing Knowledge Through Cutting-Edge Research
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="res-stats-grid">
            {[
              { label: "Publications", value: "50+", icon: 0 },
              { label: "Patents Filed", value: "10+", icon: 1 },
              { label: "Funded Projects", value: "15+", icon: 2 },
              { label: "PhD Scholars", value: "5+", icon: 3 },
            ].map((stat, idx) => {
              const Icon = statIcons[idx]
              return (
                <motion.div key={stat.label} variants={fadeUp} className="res-stat-card">
                  <Icon size={32} color="#2B3490" style={{ marginBottom: 12 }} />
                  <div className="res-stat-number">{stat.value}</div>
                  <div className="res-stat-label">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* RESEARCH CENTERS */}
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
              Research Centers
            </motion.h2>
            <motion.div variants={stagger} className="res-centers-grid">
              {researchCenters.map((center, idx) => (
                <motion.div key={idx} variants={fadeUp} className="res-center-card">
                  <h3>{center.name}</h3>
                  <p>{center.description}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16, borderTop: "1px solid #eef0f3" }}>
                    <div>
                      <p style={{ color: "#2B3490", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>{center.faculty}</p>
                      <p style={{ color: "#999", fontSize: 12, margin: 0 }}>Faculty Members</p>
                    </div>
                    <div>
                      <p style={{ color: "#2B3490", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>{center.projects}</p>
                      <p style={{ color: "#999", fontSize: 12, margin: 0 }}>Active Projects</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ONGOING PROJECTS */}
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
              Ongoing Research Projects
            </motion.h2>
            <motion.div variants={stagger} className="res-projects-list">
              {ongoingProjects.map((project, idx) => (
                <motion.div key={idx} variants={fadeUp} className="res-project-item">
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                    {project.title}
                  </h3>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>
                    <span style={{ fontWeight: 600, color: "#2B3490" }}>Department:</span> {project.department}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <p style={{ color: "#666", fontSize: 13, margin: 0 }}>
                      <span style={{ fontWeight: 600, color: "#2B3490" }}>Agency:</span> {project.agency}
                    </p>
                    <p style={{ color: "#2B3490", fontSize: 13, fontWeight: 600, margin: 0 }}>{project.amount}</p>
                    <p style={{ color: "#666", fontSize: 13, margin: 0 }}>{project.duration}</p>
                  </div>
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
              Interested in Research Opportunities?
            </h2>
            <button className="res-cta-button">Contact Research Department</button>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
