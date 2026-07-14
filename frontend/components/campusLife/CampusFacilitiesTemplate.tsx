"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { campusFacilities } from "@/data/campusLife/campusFacilities"
import {
  School,
  Monitor,
  FlaskConical,
  BookOpen,
  Presentation,
  BedDouble,
  UtensilsCrossed,
  HeartPulse,
  CreditCard,
  Trophy,
  Mic,
  Bus,
  Wifi,
  Shield,
  Zap,
} from "lucide-react"
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

const iconMap: { [key: string]: React.ReactNode } = {
  School: <School size={28} />,
  Monitor: <Monitor size={28} />,
  FlaskConical: <FlaskConical size={28} />,
  BookOpen: <BookOpen size={28} />,
  Presentation: <Presentation size={28} />,
  BedDouble: <BedDouble size={28} />,
  UtensilsCrossed: <UtensilsCrossed size={28} />,
  HeartPulse: <HeartPulse size={28} />,
  CreditCard: <CreditCard size={28} />,
  Trophy: <Trophy size={28} />,
  Mic: <Mic size={28} />,
  Bus: <Bus size={28} />,
  Wifi: <Wifi size={28} />,
  Shield: <Shield size={28} />,
  Zap: <Zap size={28} />,
}

export default function CampusFacilitiesTemplate() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered =
    activeCategory === "All"
      ? campusFacilities.facilities
      : campusFacilities.facilities.filter((f) => f.category === activeCategory)

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .cf-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .cf-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .cf-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .cf-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .cf-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .cf-breadcrumb a:hover {
          opacity: 0.8;
        }
        .cf-breadcrumb span {
          color: #FFE619;
        }
        .cf-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .cf-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .cf-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFE619;
        }
        .cf-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFE619;
        }
        .cf-stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .cf-filters {
          display: flex;
          gap: 12px;
          margin-top: 40px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .cf-filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          font-size: 14px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cf-filter-btn.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .cf-filter-btn:hover {
          border-color: #2B3490;
        }
        .cf-facility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .cf-facility-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .cf-facility-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .cf-facility-icon {
          width: 48px;
          height: 48px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2B3490;
        }
        .cf-facility-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .cf-facility-card p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .cf-category-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          margin-top: 8px;
        }
        .cf-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .cf-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .cf-contact-item p {
          font-size: 15px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .cf-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .cf-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .cf-contact-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="cf-hero"
        style={{
          backgroundImage: `url('/images/campus/01.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="cf-eyebrow" style={{ marginBottom: 16 }}>
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
                {campusFacilities.pageTitle}
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
                {campusFacilities.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="cf-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{campusFacilities.pageTitle}</span>
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
              {campusFacilities.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* STATS */}
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
              Campus Overview
            </motion.h2>

            <motion.div variants={stagger} className="cf-stats-bar">
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">📏</div>
                <div className="cf-stat-number">{campusFacilities.stats.campusArea}</div>
                <div className="cf-stat-label">Campus Area</div>
              </motion.div>
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">🏢</div>
                <div className="cf-stat-number">{campusFacilities.stats.buildings}</div>
                <div className="cf-stat-label">Buildings</div>
              </motion.div>
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">🔬</div>
                <div className="cf-stat-number">{campusFacilities.stats.labs}</div>
                <div className="cf-stat-label">Labs</div>
              </motion.div>
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">🏫</div>
                <div className="cf-stat-number">{campusFacilities.stats.classrooms}</div>
                <div className="cf-stat-label">Classrooms</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* FACILITIES WITH FILTER */}
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
                margin: "0 0 24px",
              }}
            >
              Campus Facilities
            </motion.h2>

            <motion.div variants={fadeUp} className="cf-filters">
              {campusFacilities.categories.map((cat) => (
                <button
                  key={cat}
                  className={`cf-filter-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            <div className="cf-facility-grid">
              {filtered.map((facility, idx) => (
                <motion.div key={idx} variants={fadeUp} className="cf-facility-card">
                  <div className="cf-facility-icon">{iconMap[facility.icon]}</div>
                  <h3>{facility.name}</h3>
                  <p>{facility.description}</p>
                  <div className="cf-category-badge">{facility.category}</div>
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
            className="cf-contact-card"
          >
            <div className="cf-contact-item">
              <h4>{campusFacilities.contact.office}</h4>
              <p>For questions about campus facilities and infrastructure</p>
            </div>
            <div className="cf-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${campusFacilities.contact.phone}`}>{campusFacilities.contact.phone}</a>
              </p>
            </div>
            <div className="cf-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${campusFacilities.contact.email}`}>{campusFacilities.contact.email}</a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
