"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { Download, FileText } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function StrategicPlanPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .sp-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .sp-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .sp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #FFE619;
        }
      `}</style>

      {/* HERO */}
      <section className="sp-hero">
        <Container>
          <div style={{ padding: "84px 0 72px", position: "relative", zIndex: 1, maxWidth: 760 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="sp-eyebrow" style={{ marginBottom: 18 }}>
                Strategic Direction
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0,
                }}
              >
                Strategic Plan & Deployment
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 1.7,
                  margin: "20px 0 0", maxWidth: 620, fontWeight: 300,
                }}
              >
                Our comprehensive roadmap for institutional excellence, innovation, and sustainable growth.
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* INTRO */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            style={{ maxWidth: 820, marginBottom: 48 }}
          >
            <motion.p
              variants={fadeUp}
              style={{
                color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0,
              }}
            >
              KSRMCE follows a structured strategic plan that guides its academic, research, infrastructure and community-development goals, with periodic deployment and review to ensure measurable progress toward institutional excellence. Our strategic initiatives align with the institution's vision while remaining responsive to evolving educational needs and societal expectations.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* DOCUMENTS */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            style={{ maxWidth: 820 }}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 32px",
              }}
            >
              Documents
            </motion.h2>

            <motion.div
              variants={fadeUp}
              style={{
                background: "#fff",
                border: "1px solid #eef0f3",
                borderRadius: 16,
                padding: "32px",
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(43,52,144,0.12)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "#eef1ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={28} color="#2B3490" />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                  Strategic Plan Document (PDF)
                </h3>
                <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
                  Comprehensive strategic plan document outlining the institution's vision, goals, and implementation strategies.
                </p>
                <a
                  href="/documents/strategic-plan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#2B3490",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FFE619"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#2B3490"
                  }}
                >
                  <Download size={16} />
                  Download PDF
                </a>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                background: "#fff9e6",
                border: "1px solid #ffe6b3",
                borderRadius: 12,
                padding: "20px 24px",
                marginTop: 32,
              }}
            >
              <p style={{ color: "#8b6f47", fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                <strong>Note:</strong> Detailed deployment documents and periodic review reports are available on request from the Registrar's Office.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
