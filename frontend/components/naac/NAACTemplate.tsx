"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { naac } from "@/data/naac"
import { Award, Download } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function NAACTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .naac-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .naac-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .naac-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .naac-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .naac-badge {
          background: #f7f8fa;
          border: 2px solid #FFE619;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          margin: 48px 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        .naac-grade {
          font-family: 'Rajdhani', sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 12px;
        }
        .naac-badge-detail {
          font-size: 16px;
          color: #555;
          margin: 8px 0;
        }
        .naac-criteria-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .naac-criteria-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          transition: all 0.2s;
        }
        .naac-criteria-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
          border-color: #FFE619;
        }
        .naac-criteria-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 12px;
        }
        .naac-criteria-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .naac-criteria-card p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        .naac-documents-list {
          list-style: none;
          padding: 0;
          margin: 32px 0;
        }
        .naac-document-item {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .naac-document-item:hover {
          background: #eef1ff;
          border-color: #2B3490;
        }
        .naac-document-item h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }
        .naac-document-link {
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
          cursor: pointer;
        }
        .naac-document-link:hover {
          background: #FFE619;
          color: #2B3490;
        }
        .naac-cta-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin: 48px 0;
          max-width: 600px;
        }
        .naac-cta-button {
          background: #2B3490;
          color: #fff;
          padding: 20px 40px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer;
          border: none;
          font-size: 16px;
        }
        .naac-cta-button:hover {
          background: #FFE619;
          color: #2B3490;
          transform: translateY(-2px);
        }
        @media (max-width: 1024px) {
          .naac-criteria-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .naac-cta-buttons {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .naac-criteria-grid {
            grid-template-columns: 1fr;
          }
          .naac-document-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="naac-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="naac-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{naac.pageTitle}</span>
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
                {naac.pageTitle}
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
                {naac.subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} style={{ maxWidth: 820, margin: "0 auto" }}>
            <motion.p
              variants={fadeUp}
              style={{
                color: "#555",
                fontSize: 15.5,
                lineHeight: 1.8,
                margin: 0,
                textAlign: "center",
              }}
            >
              {naac.about}
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* ACCREDITATION BADGE */}
      <section style={{ padding: "48px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="naac-badge">
            <Award size={48} color="#FFE619" style={{ marginBottom: 16 }} />
            <div className="naac-grade">{naac.accreditationStatus.grade}</div>
            <div className="naac-badge-detail">CGPA: {naac.accreditationStatus.cgpa}</div>
            <div className="naac-badge-detail">{naac.accreditationStatus.cycle}</div>
            <div className="naac-badge-detail">Valid Until: {naac.accreditationStatus.validUntil}</div>
          </motion.div>
        </Container>
      </section>

      {/* CRITERIA */}
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
                textAlign: "center",
              }}
            >
              NAAC Accreditation Criteria
            </motion.h2>
            <motion.div variants={stagger} className="naac-criteria-grid">
              {naac.criteria.map((criterion, idx) => (
                <motion.div key={idx} variants={fadeUp} className="naac-criteria-card">
                  <div className="naac-criteria-number">Criterion {criterion.number}</div>
                  <h3>{criterion.title}</h3>
                  <p>{criterion.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* DOCUMENTS */}
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
              Key Documents
            </motion.h2>
            <motion.ul variants={stagger} className="naac-documents-list">
              {naac.documents.map((doc, idx) => (
                <motion.li key={idx} variants={fadeUp} className="naac-document-item">
                  <h4>{doc.name}</h4>
                  <a href={doc.link} target="_blank" rel="noopener noreferrer" className="naac-document-link">
                    <Download size={16} />
                    View
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </Container>
      </section>

      {/* CTA BUTTONS */}
      <section style={{ padding: "56px 0", background: "#ffffff", textAlign: "center" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h3 variants={fadeUp} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
              Explore NAAC Documentation
            </motion.h3>
            <motion.div variants={stagger} className="naac-cta-buttons">
              <motion.a variants={fadeUp} href={naac.ssrLink} target="_blank" rel="noopener noreferrer" className="naac-cta-button">
                SSR Report
              </motion.a>
              <motion.a variants={fadeUp} href={naac.dvvLink} target="_blank" rel="noopener noreferrer" className="naac-cta-button">
                DVV Clarifications
              </motion.a>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
