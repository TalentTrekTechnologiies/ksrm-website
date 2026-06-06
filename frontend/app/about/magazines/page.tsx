"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { BookOpen, Download } from "lucide-react"
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

const magazines = [
  { year: 2025, title: "KSRM Magazine - 2025", path: "/documents/magazine-2025.pdf" },
  { year: 2024, title: "KSRM Magazine - 2024", path: "/documents/magazine-2024.pdf" },
  { year: 2023, title: "KSRM Magazine - 2023", path: "/documents/magazine-2023.pdf" },
]

export default function MagazinesPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .mag-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .mag-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .mag-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #FFE619;
        }
        .mag-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px;
        }
        @media (max-width: 900px) {
          .mag-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .mag-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="mag-hero">
        <Container>
          <div style={{ padding: "84px 0 72px", position: "relative", zIndex: 1, maxWidth: 760 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mag-eyebrow" style={{ marginBottom: 18 }}>
                Publications
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0,
                }}
              >
                Magazines & Publications
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 1.7,
                  margin: "20px 0 0", maxWidth: 620, fontWeight: 300,
                }}
              >
                Celebrating student creativity, achievements and voices through our annual college publications.
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
              Our college magazines showcase the creativity, achievements and voices of our students and faculty—featuring technical articles, cultural highlights, campus milestones, and perspectives on innovation and learning. These publications are a platform for creative expression, technical discourse, and institutional storytelling.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* MAGAZINE GRID */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px",
              }}
            >
              Latest Issues
            </motion.h2>

            <div className="mag-grid">
              {magazines.map((mag) => (
                <motion.div
                  key={mag.year}
                  variants={fadeUp}
                  style={{
                    background: "#fff",
                    border: "1px solid #eef0f3",
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)"
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(43,52,144,0.15)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  {/* Cover placeholder */}
                  <div
                    style={{
                      width: "100%",
                      height: 240,
                      background: "linear-gradient(135deg, #2B3490, #1e2570)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <BookOpen size={64} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        background: "#FFE619",
                        color: "#1a1a2e",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {mag.year}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" }}>
                      {mag.title}
                    </h3>
                    <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
                      Annual college magazine featuring student achievements, technical articles, and campus highlights.
                    </p>
                    <a
                      href={mag.path}
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
                        width: "fit-content",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#FFE619"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#2B3490"
                      }}
                    >
                      <Download size={16} />
                      Read / Download
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ARCHIVE NOTE */}
      <section style={{ padding: "56px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            style={{
              background: "#f9f9f9",
              border: "1px solid #eef0f3",
              borderRadius: 12,
              padding: "24px",
              textAlign: "center",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Previous magazine archives are available in our library. For access to older issues, please visit the <strong>Central Library</strong> or contact the Student Affairs Office.
            </p>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
