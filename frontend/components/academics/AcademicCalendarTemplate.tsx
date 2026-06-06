"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { academicCalendar } from "@/data/academics/academicCalendar"
import { Download, Calendar, ExternalLink } from "lucide-react"
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

export default function AcademicCalendarTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .ac-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .ac-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .ac-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .ac-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .ac-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .ac-breadcrumb a:hover {
          opacity: 0.8;
        }
        .ac-breadcrumb span {
          color: #FFE619;
        }
        .ac-year-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 10px 20px;
          border-radius: 20px;
          font-family: "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          margin-top: 24px;
        }
        .ac-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFE619;
          color: #2B3490;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 24px;
        }
        .ac-cta-button:hover {
          background: #ffd700;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 230, 25, 0.3);
        }
        .ac-calendar-section {
          margin-top: 40px;
        }
        .ac-year-title {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 40px 0 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #FFE619;
        }
        .ac-calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .ac-calendar-row {
          background: #f4f3ef;
          border: 1px solid #eef0f3;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .ac-calendar-row:hover {
          background: #fffaed;
          border-color: #FFE619;
          box-shadow: 0 4px 12px rgba(255, 230, 25, 0.15);
        }
        .ac-calendar-info h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px;
        }
        .ac-calendar-info p {
          font-size: 12px;
          color: #666;
          margin: 0;
        }
        .ac-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #2B3490;
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ac-download-btn:hover {
          background: #1e2570;
          transform: translateY(-2px);
        }
        .ac-note {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 24px;
          border-radius: 8px;
          margin-top: 40px;
          font-size: 14px;
          color: #555;
          line-height: 1.7;
        }
        .ac-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .ac-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .ac-contact-item p {
          font-size: 14px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .ac-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .ac-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .ac-calendar-grid {
            grid-template-columns: 1fr;
          }
          .ac-contact-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="ac-hero"
        style={{
          backgroundImage: `url('/images/campus/02.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="ac-eyebrow" style={{ marginBottom: 16 }}>
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
                {academicCalendar.pageTitle}
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
                {academicCalendar.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="ac-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span>{academicCalendar.pageTitle}</span>
              </motion.div>

              <motion.div variants={fadeUp} className="ac-year-badge">
                Current AY: {academicCalendar.currentAY}
              </motion.div>

              <motion.a
                variants={fadeUp}
                href={academicCalendar.examPortalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ac-cta-button"
              >
                <ExternalLink size={16} />
                View Exam Results
              </motion.a>
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
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              {academicCalendar.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* CALENDARS */}
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
              Download Academic Calendars by Year
            </motion.h2>

            {academicCalendar.calendars.map((yearGroup, idx) => (
              <motion.div key={idx} variants={fadeUp} className="ac-calendar-section">
                <h3 className="ac-year-title">Academic Year {yearGroup.year}</h3>
                <div className="ac-calendar-grid">
                  {yearGroup.entries.map((entry, entryIdx) => (
                    <motion.div key={entryIdx} variants={fadeUp} className="ac-calendar-row">
                      <div className="ac-calendar-info">
                        <h4>{entry.label}</h4>
                        <p>{entry.regulation}</p>
                      </div>
                      <a href={entry.pdfLink} className="ac-download-btn" target="_blank" rel="noopener noreferrer">
                        <Download size={14} />
                        PDF
                      </a>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
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
            className="ac-note"
          >
            {academicCalendar.note}
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="ac-contact-card"
          >
            <div className="ac-contact-item">
              <h4>{academicCalendar.contact.section}</h4>
              <p>For calendar queries and exam timetable information</p>
            </div>
            <div className="ac-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${academicCalendar.contact.phone.split("/")[0].trim()}`}>
                  {academicCalendar.contact.phone}
                </a>
              </p>
            </div>
            <div className="ac-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${academicCalendar.contact.email}`}>{academicCalendar.contact.email}</a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
