"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { FileText, Calendar, Download } from "lucide-react"
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

const meetingMinutes = [
  { date: "04 September 2014", path: "/documents/jbos/04-sep-2014" },
  { date: "22 June 2015", path: "/documents/jbos/22-jun-2015" },
  { date: "08 June 2018", path: "/documents/jbos/08-jun-2018" },
  { date: "03 June 2019", path: "/documents/jbos/03-jun-2019" },
  { date: "28 December 2019", path: "/documents/jbos/28-dec-2019" },
  { date: "10 January 2021", path: "/documents/jbos/10-jan-2021" },
  { date: "04 August 2022", path: "/documents/jbos/04-aug-2022" },
]

export default function JointBoardPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .jbos-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .jbos-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .jbos-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #FFE619;
        }
        .jbos-card {
          background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 16px; padding: 32px;
        }
        .jbos-minutes-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
        }
        @media (max-width: 600px) {
          .jbos-minutes-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="jbos-hero">
        <Container>
          <div style={{ padding: "84px 0 72px", position: "relative", zIndex: 1, maxWidth: 760 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="jbos-eyebrow" style={{ marginBottom: 18 }}>
                Academic Governance
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0,
                }}
              >
                Joint Board of Studies
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 1.7,
                  margin: "20px 0 0", maxWidth: 620, fontWeight: 300,
                }}
              >
                Reviews and updates curriculum, regulations, and academic standards to ensure alignment with industry and excellence.
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
              The Joint Board of Studies (JBoS) reviews and updates the curriculum, regulations and academic standards across departments, ensuring alignment with industry needs and academic excellence. The board comprises faculty members, industry experts, and academic leaders who meet periodically to assess our programs and guide their continuous improvement.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* BOARD MEMBERS */}
      <section style={{ padding: "56px 0", background: "#f7f8fa" }}>
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
              Board Members
            </motion.h2>

            <motion.a
              variants={fadeUp}
              href="/documents/jbos-members.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 24px",
                background: "#2B3490",
                color: "#fff",
                borderRadius: 8,
                textDecoration: "none",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600,
                fontSize: 15,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e2570"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2B3490"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <FileText size={18} />
              View Board Members (PDF)
            </motion.a>
          </motion.div>
        </Container>
      </section>

      {/* MINUTES OF MEETINGS */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px",
              }}
            >
              Minutes of Meetings
            </motion.h2>

            <div className="jbos-minutes-grid">
              {meetingMinutes.map((meeting) => (
                <motion.div
                  key={meeting.date}
                  variants={fadeUp}
                  className="jbos-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    cursor: "pointer",
                    transition: "all 0.2s",
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Calendar size={20} color="#2B3490" />
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, color: "#1a1a2e" }}>
                      {meeting.date}
                    </span>
                  </div>
                  <a
                    href={meeting.path}
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
                    View PDF
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
