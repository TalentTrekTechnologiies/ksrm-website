"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { examinations } from "@/data/examinations"
import { FileText, Clock } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function ExaminationsTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .exam-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .exam-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .exam-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .exam-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .exam-quick-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 56px 0;
        }
        .exam-link-button {
          padding: 28px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
        }
        .exam-link-button.primary {
          background: #FFE619;
          color: #1a1a2e;
        }
        .exam-link-button.primary:hover {
          background: #2B3490;
          color: #FFE619;
          transform: translateY(-4px);
        }
        .exam-link-button.secondary {
          background: #f7f8fa;
          color: #2B3490;
          border: 2px solid #2B3490;
        }
        .exam-link-button.secondary:hover {
          background: #2B3490;
          color: #fff;
          transform: translateY(-4px);
        }
        .exam-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin: 56px 0;
        }
        .exam-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .exam-list-item {
          background: #f7f8fa;
          border-left: 4px solid #FFE619;
          border-radius: 0 8px 8px 0;
          padding: 20px;
          margin-bottom: 16px;
          transition: all 0.2s;
        }
        .exam-list-item:hover {
          box-shadow: 0 8px 24px rgba(43,52,144,0.1);
          transform: translateX(4px);
        }
        .exam-list-item-date {
          font-size: 12px;
          color: #999;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .exam-list-item-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .exam-list-item-title a {
          color: #2B3490;
          text-decoration: none;
          transition: color 0.2s;
        }
        .exam-list-item-title a:hover {
          color: #FFE619;
        }
        .exam-list-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .exam-contact-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          margin: 56px 0;
        }
        .exam-contact-card h2 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 20px;
        }
        .exam-contact-card p {
          color: #666;
          font-size: 14px;
          margin: 0 0 12px;
        }
        .exam-contact-card a {
          color: #2B3490;
          font-weight: 600;
          text-decoration: none;
          display: block;
          margin-bottom: 8px;
          transition: color 0.2s;
        }
        .exam-contact-card a:hover {
          color: #FFE619;
        }
        @media (max-width: 1024px) {
          .exam-quick-links {
            grid-template-columns: 1fr;
          }
          .exam-content-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .exam-quick-links {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="exam-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="exam-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{examinations.pageTitle}</span>
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
                {examinations.pageTitle}
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
                {examinations.subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "48px 0", background: "#f7f8fa" }}>
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
              {examinations.about}
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* QUICK LINKS */}
      <section style={{ padding: "56px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="exam-quick-links">
            {examinations.quickLinks.map((link, idx) => (
              <motion.a
                key={idx}
                variants={fadeUp}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`exam-link-button ${link.type}`}
              >
                {link.label}
              </motion.a>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* NOTIFICATIONS & TIMETABLES */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="exam-content-grid">
            {/* Notifications */}
            <motion.div variants={fadeUp}>
              <h2 className="exam-list-title">
                <FileText size={24} color="#2B3490" />
                Recent Notifications
              </h2>
              <ul className="exam-list">
                {examinations.recentNotifications.map((notif, idx) => (
                  <li key={idx} className="exam-list-item">
                    <div className="exam-list-item-date">{notif.date}</div>
                    <p className="exam-list-item-title">
                      <a href={notif.link}>{notif.title}</a>
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Timetables */}
            <motion.div variants={fadeUp}>
              <h2 className="exam-list-title">
                <Clock size={24} color="#2B3490" />
                Recent Timetables
              </h2>
              <ul className="exam-list">
                {examinations.recentTimetables.map((timetable, idx) => (
                  <li key={idx} className="exam-list-item">
                    <div className="exam-list-item-date">{timetable.date}</div>
                    <p className="exam-list-item-title">
                      <a href={timetable.link}>{timetable.title}</a>
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} className="exam-contact-card">
              <h2>{examinations.contact.section}</h2>
              <p>
                <strong>Location:</strong> {examinations.contact.location}
              </p>
              <p>
                <strong>Phone:</strong>
              </p>
              <a href={`tel:${examinations.contact.phone}`}>{examinations.contact.phone}</a>
              <p style={{ marginTop: 12 }}>
                <strong>Email:</strong>
              </p>
              <a href={`mailto:${examinations.contact.email}`}>{examinations.contact.email}</a>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
