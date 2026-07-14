"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { transport } from "@/data/campusLife/transport"
import { Bus, Users, MapPin, Clock } from "lucide-react"
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

export default function TransportTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .trn-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .trn-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .trn-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .trn-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .trn-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .trn-breadcrumb a:hover {
          opacity: 0.8;
        }
        .trn-breadcrumb span {
          color: #FFE619;
        }
        .trn-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
        }
        .trn-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .trn-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .trn-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFE619;
        }
        .trn-stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .trn-table-wrapper {
          overflow-x: auto;
          margin-top: 40px;
        }
        .trn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 15px;
        }
        .trn-table thead th {
          background: #2B3490;
          color: #fff;
          padding: 14px;
          text-align: left;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .trn-table tbody td {
          padding: 12px 14px;
          border-bottom: 1px solid #eef0f3;
          color: #555;
        }
        .trn-table tbody tr:nth-child(odd) {
          background: #f4f3ef;
        }
        .trn-table tbody tr:nth-child(even) {
          background: #ffffff;
        }
        .trn-table tbody tr:hover {
          background: #fffaed;
        }
        .trn-route-no {
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          color: #2B3490;
        }
        .trn-via {
          font-size: 13px;
          color: #666;
        }
        .trn-rules {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 40px;
        }
        .trn-rule {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 14px 16px;
          border-radius: 4px;
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }
        .trn-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          text-align: center;
        }
        .trn-contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
          margin-top: 32px;
        }
        .trn-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .trn-contact-item p {
          font-size: 15px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .trn-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .trn-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .trn-contact-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="trn-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="trn-eyebrow" style={{ marginBottom: 16 }}>
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
                {transport.pageTitle}
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
                {transport.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="trn-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{transport.pageTitle}</span>
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
              {transport.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* STATS */}
      <section style={{ padding: "40px 0", background: "#2B3490" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="trn-stats-bar"
          >
            <motion.div variants={fadeUp} className="trn-stat-item">
              <div className="trn-stat-icon">
                <Bus size={24} color="#FFE619" />
              </div>
              <div className="trn-stat-number">{transport.stats.totalBuses}</div>
              <div className="trn-stat-label">Total Buses</div>
            </motion.div>
            <motion.div variants={fadeUp} className="trn-stat-item">
              <div className="trn-stat-icon">
                <MapPin size={24} color="#FFE619" />
              </div>
              <div className="trn-stat-number">{transport.stats.routesCovered}</div>
              <div className="trn-stat-label">Routes</div>
            </motion.div>
            <motion.div variants={fadeUp} className="trn-stat-item">
              <div className="trn-stat-icon">
                <Users size={24} color="#FFE619" />
              </div>
              <div className="trn-stat-number">{transport.stats.studentsServed}</div>
              <div className="trn-stat-label">Students</div>
            </motion.div>
            <motion.div variants={fadeUp} className="trn-stat-item">
              <div className="trn-stat-icon">
                <Clock size={24} color="#FFE619" />
              </div>
              <div className="trn-stat-number">{transport.stats.kmPerDay}</div>
              <div className="trn-stat-label">KM/Day</div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ROUTES */}
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
              Bus Routes
            </motion.h2>

            <motion.div variants={fadeUp} className="trn-table-wrapper">
              <table className="trn-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>From</th>
                    <th>Via (Stops)</th>
                    <th>Departure</th>
                    <th>Return</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {transport.routes.map((route, idx) => (
                    <tr key={idx}>
                      <td className="trn-route-no">{route.routeNo}</td>
                      <td>{route.from}</td>
                      <td className="trn-via">{route.via.join(" → ")}</td>
                      <td>{route.departureTime}</td>
                      <td>{route.returnTime}</td>
                      <td style={{ fontWeight: 700, color: "#2B3490" }}>{route.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* RULES */}
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
              Transport Rules
            </motion.h2>

            <div className="trn-rules">
              {transport.rules.map((rule, idx) => (
                <motion.div key={idx} variants={fadeUp} className="trn-rule">
                  {rule}
                </motion.div>
              ))}
            </div>
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
            className="trn-contact-card"
          >
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, margin: 0 }}>
              {transport.contact.inCharge}
            </h3>
            <div className="trn-contact-info">
              <div className="trn-contact-item">
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${transport.contact.phone}`}>{transport.contact.phone}</a>
                </p>
              </div>
              <div className="trn-contact-item">
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${transport.contact.email}`}>{transport.contact.email}</a>
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


