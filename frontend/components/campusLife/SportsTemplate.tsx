"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { sports } from "@/data/campusLife/sports"
import { Trophy, Zap, Target, Medal, Phone, Mail } from "lucide-react"
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

export default function SportsTemplate() {
  const [facilityFilter, setFacilityFilter] = useState<"all" | "indoor" | "outdoor">("all")

  const filtered = sports.facilities.filter(
    (f) => facilityFilter === "all" || f.type === facilityFilter
  )

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .spo-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .spo-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .spo-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .spo-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .spo-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .spo-breadcrumb a:hover {
          opacity: 0.8;
        }
        .spo-breadcrumb span {
          color: #FFE619;
        }
        .spo-filters {
          display: flex;
          gap: 12px;
          margin-top: 40px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .spo-filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          font-size: 13px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .spo-filter-btn.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .spo-filter-btn:hover {
          border-color: #2B3490;
        }
        .spo-facility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .spo-facility-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .spo-facility-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .spo-facility-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spo-facility-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .spo-facility-card p {
          font-size: 13px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .spo-facility-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #eef0f3;
          font-size: 12px;
          color: #666;
        }
        .spo-achievement-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }
        .spo-achievement-card {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 20px;
          border-radius: 8px;
          display: flex;
          gap: 16px;
        }
        .spo-achievement-badge {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }
        .spo-achievement-badge.state {
          background: #3498db;
        }
        .spo-achievement-badge.national {
          background: #e74c3c;
        }
        .spo-achievement-badge.university {
          background: #27ae60;
        }
        .spo-achievement-content h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px;
        }
        .spo-achievement-content p {
          font-size: 13px;
          color: #555;
          margin: 0;
          line-height: 1.6;
        }
        .spo-achievement-level {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          margin-top: 8px;
        }
        .spo-upcoming-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .spo-event-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .spo-event-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }
        .spo-event-card p {
          font-size: 13px;
          margin: 0;
          line-height: 1.6;
        }
        .spo-coordinator-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          text-align: center;
        }
        .spo-coordinator-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 24px;
        }
        .spo-contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
          margin-top: 24px;
        }
        .spo-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .spo-contact-item p {
          font-size: 14px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .spo-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .spo-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .spo-contact-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="spo-hero"
        style={{
          backgroundImage: `url('/images/campus/indoor1.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="spo-eyebrow" style={{ marginBottom: 16 }}>
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
                {sports.pageTitle}
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
                {sports.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="spo-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{sports.pageTitle}</span>
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
              {sports.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* FACILITIES */}
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
                margin: "0 0 24px",
              }}
            >
              Sports Facilities
            </motion.h2>

            <motion.div variants={fadeUp} className="spo-filters">
              <button
                className={`spo-filter-btn ${facilityFilter === "all" ? "active" : ""}`}
                onClick={() => setFacilityFilter("all")}
              >
                All Facilities
              </button>
              <button
                className={`spo-filter-btn ${facilityFilter === "indoor" ? "active" : ""}`}
                onClick={() => setFacilityFilter("indoor")}
              >
                Indoor
              </button>
              <button
                className={`spo-filter-btn ${facilityFilter === "outdoor" ? "active" : ""}`}
                onClick={() => setFacilityFilter("outdoor")}
              >
                Outdoor
              </button>
            </motion.div>

            <div className="spo-facility-grid">
              {filtered.map((facility, idx) => (
                <motion.div key={idx} variants={fadeUp} className="spo-facility-card">
                  <div className="spo-facility-icon">
                    <Zap size={24} color="#2B3490" />
                  </div>
                  <h3>{facility.name}</h3>
                  <p>{facility.description}</p>
                  <div className="spo-facility-meta">
                    <span>{facility.type === "indoor" ? "Indoor" : "Outdoor"}</span>
                    <span>Capacity: {facility.capacity}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ACHIEVEMENTS */}
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
              Achievements
            </motion.h2>

            <div className="spo-achievement-list">
              {sports.achievements.map((achievement, idx) => (
                <motion.div key={idx} variants={fadeUp} className="spo-achievement-card">
                  <div className={`spo-achievement-badge ${achievement.level}`}>
                    <Trophy size={28} />
                  </div>
                  <div className="spo-achievement-content">
                    <h4>{achievement.event}</h4>
                    <p>{achievement.result}</p>
                    <div className="spo-achievement-level">
                      {achievement.level === "state" && "🏆 State Level"}
                      {achievement.level === "national" && "🥇 National Level"}
                      {achievement.level === "university" && "🏅 University Level"}
                    </div>
                    <p style={{ fontSize: 12, marginTop: 8 }}>Year: {achievement.year}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* UPCOMING EVENTS */}
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
              Upcoming Events
            </motion.h2>

            <div className="spo-upcoming-grid">
              {sports.upcomingEvents.map((event, idx) => (
                <motion.div key={idx} variants={fadeUp} className="spo-event-card">
                  <h3>{event.name}</h3>
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p>
                    <strong>Venue:</strong> {event.venue}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* COORDINATOR */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="spo-coordinator-card"
          >
            <h3>{sports.coordinator.name}</h3>
            <p>Sports Coordinator</p>
            <div className="spo-contact-info">
              <div className="spo-contact-item">
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${sports.coordinator.phone}`}>{sports.coordinator.phone}</a>
                </p>
              </div>
              <div className="spo-contact-item">
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${sports.coordinator.email}`}>{sports.coordinator.email}</a>
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


