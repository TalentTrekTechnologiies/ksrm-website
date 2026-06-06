"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { regulations } from "@/data/academics/regulations"
import { Download, ChevronDown } from "lucide-react"
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

export default function RegulationsTemplate() {
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set())

  const toggleRule = (idx: number) => {
    const newSet = new Set(expandedRules)
    if (newSet.has(idx)) {
      newSet.delete(idx)
    } else {
      newSet.add(idx)
    }
    setExpandedRules(newSet)
  }

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .reg-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .reg-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .reg-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .reg-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .reg-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .reg-breadcrumb a:hover {
          opacity: 0.8;
        }
        .reg-breadcrumb span {
          color: #FFE619;
        }
        .reg-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .reg-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.2s;
        }
        .reg-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
          border-color: #FFE619;
        }
        .reg-code-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 6px 12px;
          border-radius: 6px;
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          width: fit-content;
        }
        .reg-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .reg-card-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: #666;
        }
        .reg-card-meta strong {
          color: #2B3490;
          font-weight: 700;
        }
        .reg-card-description {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .reg-keypoints {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .reg-keypoint {
          font-size: 13px;
          color: #555;
          padding-left: 20px;
          position: relative;
        }
        .reg-keypoint::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #2B3490;
          font-weight: 700;
        }
        .reg-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFE619;
          color: #2B3490;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }
        .reg-download-btn:hover {
          background: #ffd700;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 230, 25, 0.3);
        }
        .reg-rules-accordion {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 40px;
        }
        .reg-rule-item {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 8px;
          overflow: hidden;
        }
        .reg-rule-header {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 16px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #2B3490;
          transition: all 0.2s;
          border: 1px solid #eef0f3;
        }
        .reg-rule-header:hover {
          background: #fffaed;
        }
        .reg-rule-header .reg-chevron {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .reg-rule-item.expanded .reg-rule-header .reg-chevron {
          transform: rotate(180deg);
        }
        .reg-rule-content {
          padding: 20px;
          background: #ffffff;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .reg-rule-item.expanded .reg-rule-content {
          max-height: 500px;
        }
        .reg-rule-content p {
          color: #555;
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
        }
        .reg-note {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 24px;
          border-radius: 8px;
          margin-top: 40px;
        }
        .reg-note p {
          color: #555;
          font-size: 15px;
          line-height: 1.7;
          margin: 0;
        }
        @media (max-width: 900px) {
          .reg-card-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="reg-hero"
        style={{
          backgroundImage: `url('/images/campus/06.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="reg-eyebrow" style={{ marginBottom: 16 }}>
                Academics
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
                {regulations.pageTitle}
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
                {regulations.subtitle}
              </motion.p>

              {/* BREADCRUMB */}
              <motion.div variants={fadeUp} className="reg-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span>{regulations.pageTitle}</span>
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
            <p
              style={{
                color: "#555",
                fontSize: 16,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {regulations.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* REGULATION SETS */}
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
              Academic Regulations
            </motion.h2>

            <div className="reg-card-grid">
              {regulations.regulationSets.map((regSet, idx) => (
                <motion.div key={idx} variants={fadeUp} className="reg-card">
                  <div className="reg-code-badge">{regSet.code}</div>
                  <h3>{regSet.code} Regulations ({regSet.year})</h3>

                  <div className="reg-card-meta">
                    <div>
                      <strong>Applicable To:</strong> {regSet.applicableTo}
                    </div>
                  </div>

                  <p className="reg-card-description">{regSet.description}</p>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2B3490", marginBottom: 8 }}>
                      KEY POINTS
                    </div>
                    <div className="reg-keypoints">
                      {regSet.keyPoints.map((point, pointIdx) => (
                        <div key={pointIdx} className="reg-keypoint">
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>

                  <a href={regSet.pdfLink} className="reg-download-btn" target="_blank" rel="noopener noreferrer">
                    <Download size={14} />
                    Download PDF
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* EXAMINATION RULES */}
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
              {regulations.examinationRules.title}
            </motion.h2>

            <div className="reg-rules-accordion">
              {regulations.examinationRules.rules.map((rule, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={`reg-rule-item ${expandedRules.has(idx) ? "expanded" : ""}`}
                >
                  <button
                    className="reg-rule-header"
                    onClick={() => toggleRule(idx)}
                  >
                    <span>{rule.rule}</span>
                    <div className="reg-chevron">
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  <div className="reg-rule-content">
                    <p>{rule.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* NOTE */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="reg-note"
          >
            <p>{regulations.note}</p>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
