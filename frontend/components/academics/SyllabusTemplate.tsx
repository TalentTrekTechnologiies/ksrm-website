"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { syllabus } from "@/data/academics/syllabus"
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

export default function SyllabusTemplate() {
  const [expandedProgramme, setExpandedProgramme] = useState<number | null>(0)

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .syl-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .syl-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .syl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .syl-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .syl-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .syl-breadcrumb a:hover {
          opacity: 0.8;
        }
        .syl-breadcrumb span {
          color: #FFE619;
        }
        .syl-accordion {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }
        .syl-accordion-item {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 8px;
          overflow: hidden;
        }
        .syl-accordion-header {
          background: #2B3490;
          color: #fff;
          padding: 20px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          transition: all 0.2s;
          border: none;
          width: 100%;
        }
        .syl-accordion-header:hover {
          background: #1e2570;
        }
        .syl-accordion-header .syl-chevron {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .syl-accordion-item.expanded .syl-accordion-header .syl-chevron {
          transform: rotate(180deg);
        }
        .syl-accordion-content {
          padding: 24px;
          background: #f4f3ef;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .syl-accordion-item.expanded .syl-accordion-content {
          max-height: 1000px;
        }
        .syl-regulations {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
          font-family: "Rajdhani", sans-serif;
        }
        .syl-table-wrapper {
          overflow-x: auto;
        }
        .syl-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 15px;
        }
        .syl-table thead th {
          background: #fff;
          border-bottom: 2px solid #2B3490;
          padding: 12px;
          text-align: left;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #2B3490;
        }
        .syl-table tbody td {
          padding: 12px;
          border-bottom: 1px solid #eef0f3;
          color: #555;
        }
        .syl-table tbody tr:nth-child(odd) {
          background: #ffffff;
        }
        .syl-table tbody tr:nth-child(even) {
          background: #f7f8fa;
        }
        .syl-table tbody tr:hover {
          background: #fffaed;
        }
        .syl-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFE619;
          color: #2B3490;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .syl-download-btn:hover {
          background: #ffd700;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 230, 25, 0.3);
        }
        .syl-note {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 24px;
          border-radius: 8px;
          margin-top: 40px;
        }
        .syl-note p {
          color: #555;
          font-size: 16px;
          line-height: 1.7;
          margin: 0;
        }
        @media (max-width: 900px) {
          .syl-accordion-header {
            font-size: 15px;
            padding: 16px 20px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="syl-hero"
        style={{
          backgroundImage: `url('/images/campus/05.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="syl-eyebrow" style={{ marginBottom: 16 }}>
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
                {syllabus.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 400,
                  maxWidth: 700,
                }}
              >
                {syllabus.subtitle}
              </motion.p>

              {/* BREADCRUMB */}
              <motion.div variants={fadeUp} className="syl-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span>{syllabus.pageTitle}</span>
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
              {syllabus.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* SYLLABI */}
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
              Download Syllabus by Programme
            </motion.h2>

            <div className="syl-accordion">
              {syllabus.programmes.map((prog, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={`syl-accordion-item ${expandedProgramme === idx ? "expanded" : ""}`}
                >
                  <button
                    className="syl-accordion-header"
                    onClick={() => setExpandedProgramme(expandedProgramme === idx ? null : idx)}
                  >
                    <span>{prog.name}</span>
                    <div className="syl-chevron">
                      <ChevronDown size={20} />
                    </div>
                  </button>
                  <div className="syl-accordion-content">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
                      {prog.entries.map((entry: any, entryIdx: number) => (
                        <div key={entryIdx} style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: 8, padding: 16, transition: "all 0.2s" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fffaed"
                            e.currentTarget.style.borderColor = "#FFE619"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff"
                            e.currentTarget.style.borderColor = "#eef0f3"
                          }}>
                          <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#2B3490", margin: "0 0 12px" }}>
                            {entry.regulation}
                          </h4>
                          <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px", lineHeight: 1.6 }}>
                            <strong>Branches:</strong><br />
                            {entry.branches.join(", ")}
                          </p>
                          <a href={entry.pdfLink} className="syl-download-btn" target="_blank" rel="noopener noreferrer">
                            <Download size={14} />
                            Download PDF
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* NOTE */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="syl-note"
          >
            <p>{syllabus.note}</p>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
