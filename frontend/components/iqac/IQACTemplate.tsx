"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { iqac } from "@/data/iqac"
import { CheckCircle, Download } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function IQACTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .iqac-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .iqac-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .iqac-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .iqac-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .iqac-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin: 56px 0;
        }
        .iqac-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
        }
        .iqac-card h2 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 16px;
        }
        .iqac-card p {
          color: #555;
          font-size: 15px;
          line-height: 1.8;
          margin: 0;
        }
        .iqac-objectives {
          background: #f7f8fa;
          border-left: 4px solid #FFE619;
          padding: 24px;
          border-radius: 0 8px 8px 0;
          margin: 16px 0;
        }
        .iqac-objectives ol {
          color: #555;
          font-size: 15px;
          line-height: 1.8;
          padding-left: 20px;
          margin: 0;
        }
        .iqac-objectives li {
          margin-bottom: 12px;
        }
        .iqac-functions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .iqac-function-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          text-align: center;
          transition: all 0.2s;
        }
        .iqac-function-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
        }
        .iqac-function-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .iqac-function-card p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        .iqac-table {
          width: 100%;
          border-collapse: collapse;
          margin: 32px 0;
        }
        .iqac-table th {
          background: #2B3490;
          color: #fff;
          padding: 16px;
          text-align: left;
          font-weight: 600;
        }
        .iqac-table td {
          padding: 16px;
          border-bottom: 1px solid #eef0f3;
        }
        .iqac-table tr:nth-child(even) {
          background: #f7f8fa;
        }
        .iqac-aqar-list {
          list-style: none;
          padding: 0;
          margin: 32px 0;
        }
        .iqac-aqar-item {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .iqac-aqar-item h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #2B3490;
          margin: 0;
        }
        .iqac-aqar-link {
          background: #2B3490;
          color: #fff;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .iqac-aqar-link:hover {
          background: #FFE619;
          color: #2B3490;
        }
        .iqac-contact-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          margin: 48px 0;
        }
        @media (max-width: 1024px) {
          .iqac-cards-grid {
            grid-template-columns: 1fr;
          }
          .iqac-functions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .iqac-functions-grid {
            grid-template-columns: 1fr;
          }
          .iqac-table {
            font-size: 14px;
          }
          .iqac-table th, .iqac-table td {
            padding: 12px;
          }
          .iqac-aqar-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="iqac-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="iqac-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{iqac.pageTitle}</span>
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
                {iqac.pageTitle}
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
                {iqac.subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ABOUT + VISION */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="iqac-cards-grid">
            <motion.div variants={fadeUp} className="iqac-card">
              <h2>About IQAC</h2>
              <p>{iqac.about}</p>
            </motion.div>
            <motion.div variants={fadeUp} className="iqac-card">
              <h2>Our Vision</h2>
              <p>{iqac.vision}</p>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* OBJECTIVES */}
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
              Our Objectives
            </motion.h2>
            <motion.div variants={fadeUp} className="iqac-objectives">
              <ol>
                {iqac.objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* FUNCTIONS */}
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
              Key Functions
            </motion.h2>
            <motion.div variants={stagger} className="iqac-functions-grid">
              {iqac.functions.map((func, idx) => (
                <motion.div key={idx} variants={fadeUp} className="iqac-function-card">
                  <CheckCircle size={32} color="#2B3490" style={{ marginBottom: 12 }} />
                  <h3>{func.title}</h3>
                  <p>{func.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* COMMITTEE */}
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
              IQAC Committee
            </motion.h2>
            <motion.div variants={fadeUp}>
              <table className="iqac-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {iqac.committee.map((member, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: "#2B3490" }}>{member.name}</td>
                      <td>{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* AQAR */}
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
              Annual Quality Assurance Reports
            </motion.h2>
            <motion.ul variants={stagger} className="iqac-aqar-list">
              {iqac.aqarLinks.map((aqar, idx) => (
                <motion.li key={idx} variants={fadeUp} className="iqac-aqar-item">
                  <h4>{aqar.year} AQAR</h4>
                  <a href={aqar.link} className="iqac-aqar-link">
                    <Download size={16} />
                    Download
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} className="iqac-contact-card">
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: "0 0 20px" }}>
                {iqac.contact.coordinator}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
                <div>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 4px" }}>Phone</p>
                  <a href={`tel:${iqac.contact.phone}`} style={{ color: "#2B3490", fontWeight: 600, textDecoration: "none" }}>
                    {iqac.contact.phone}
                  </a>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: 14, margin: "0 0 4px" }}>Email</p>
                  <a href={`mailto:${iqac.contact.email}`} style={{ color: "#2B3490", fontWeight: 600, textDecoration: "none" }}>
                    {iqac.contact.email}
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
