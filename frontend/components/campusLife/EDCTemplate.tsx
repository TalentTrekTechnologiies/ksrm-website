"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { edc } from "@/data/campusLife/edc"
import { Lightbulb, Rocket, TrendingUp, Target, Phone, Mail } from "lucide-react"
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

const activityIcons = [Lightbulb, Rocket, TrendingUp, Target, Target, Target]

export default function EDCTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .edc-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .edc-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .edc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .edc-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .edc-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .edc-breadcrumb a:hover {
          opacity: 0.8;
        }
        .edc-breadcrumb span {
          color: #FFE619;
        }
        .edc-mission-vision {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .edc-mv-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          transition: all 0.2s;
        }
        .edc-mv-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .edc-mv-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 16px;
        }
        .edc-mv-card p {
          font-size: 14px;
          color: #555;
          line-height: 1.7;
          margin: 0;
        }
        .edc-activity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .edc-activity-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .edc-activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .edc-activity-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .edc-activity-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .edc-activity-card p {
          font-size: 13px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .edc-event-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .edc-event-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .edc-event-card h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }
        .edc-event-card p {
          font-size: 13px;
          margin: 0;
          line-height: 1.6;
        }
        .edc-startup-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .edc-startup-card {
          background: #f4f3ef;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .edc-startup-card h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #2B3490;
          margin: 0;
        }
        .edc-startup-card p {
          font-size: 12px;
          color: #555;
          margin: 0;
          line-height: 1.5;
        }
        .edc-startup-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          width: fit-content;
          margin-top: 8px;
        }
        .edc-coordinator-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .edc-coordinator-info h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px;
        }
        .edc-coordinator-info p {
          font-size: 13px;
          margin: 0;
          opacity: 0.9;
        }
        .edc-coordinator-contact {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .edc-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .edc-contact-item p {
          font-size: 14px;
          margin: 6px 0 0;
        }
        .edc-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .edc-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .edc-coordinator-card {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="edc-hero"
        style={{
          backgroundImage: `url('/images/campus/09.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="edc-eyebrow" style={{ marginBottom: 16 }}>
                Campus Life
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
                {edc.pageTitle}
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
                {edc.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="edc-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{edc.pageTitle}</span>
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
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              {edc.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* VISION & MISSION */}
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
              Vision & Mission
            </motion.h2>

            <div className="edc-mission-vision">
              <motion.div variants={fadeUp} className="edc-mv-card">
                <h3>Vision</h3>
                <p>{edc.vision}</p>
              </motion.div>
              <motion.div variants={fadeUp} className="edc-mv-card">
                <h3>Mission</h3>
                <p>{edc.mission}</p>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ACTIVITIES */}
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
              Our Activities
            </motion.h2>

            <div className="edc-activity-grid">
              {edc.activities.map((activity, idx) => {
                const IconComponent = activityIcons[idx]
                return (
                  <motion.div key={idx} variants={fadeUp} className="edc-activity-card">
                    <div className="edc-activity-icon">
                      <IconComponent size={24} color="#2B3490" />
                    </div>
                    <h3>{activity.name}</h3>
                    <p>{activity.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* EVENTS */}
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
              Featured Events
            </motion.h2>

            <div className="edc-event-grid">
              {edc.events.map((event, idx) => (
                <motion.div key={idx} variants={fadeUp} className="edc-event-card">
                  <h4>{event.name}</h4>
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p>{event.description}</p>
                  <p style={{ fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                    Outcome: {event.outcome}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* STARTUPS */}
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
              Startups Incubated
            </motion.h2>

            <div className="edc-startup-grid">
              {edc.startupsIncubated.map((startup, idx) => (
                <motion.div key={idx} variants={fadeUp} className="edc-startup-card">
                  <h4>{startup.name}</h4>
                  <p>
                    <strong>Founder:</strong> {startup.founder}
                  </p>
                  <p>
                    <strong>Domain:</strong> {startup.domain}
                  </p>
                  <p>
                    <strong>Year:</strong> {startup.year}
                  </p>
                  <div className="edc-startup-badge">{startup.status}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* COORDINATOR */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="edc-coordinator-card"
          >
            <div className="edc-coordinator-info">
              <h3>{edc.coordinator.name}</h3>
              <p>{edc.coordinator.designation}</p>
              <p style={{ marginTop: 16, opacity: 1, fontSize: 14, lineHeight: 1.6 }}>
                Leading the entrepreneurial vision and supporting student-founded startups through mentorship and resources.
              </p>
            </div>
            <div className="edc-coordinator-contact">
              <div className="edc-contact-item">
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${edc.coordinator.phone}`}>{edc.coordinator.phone}</a>
                </p>
              </div>
              <div className="edc-contact-item">
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${edc.coordinator.email}`}>{edc.coordinator.email}</a>
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


