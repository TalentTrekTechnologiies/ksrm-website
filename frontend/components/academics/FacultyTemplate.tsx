"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { faculty } from "@/data/academics/faculty"
import { Users, Award, Briefcase } from "lucide-react"
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

export default function FacultyTemplate() {
  const [selectedDept, setSelectedDept] = useState(0)
  const currentDept = faculty.departments[selectedDept]

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .fac-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .fac-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .fac-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .fac-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .fac-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .fac-breadcrumb a:hover {
          opacity: 0.8;
        }
        .fac-breadcrumb span {
          color: #FFE619;
        }
        .fac-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
        }
        .fac-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .fac-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fac-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #FFE619;
        }
        .fac-stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .fac-tabs {
          display: flex;
          gap: 8px;
          padding: 40px 0;
          overflow-x: auto;
          scrollbar-width: none;
          margin-bottom: 40px;
        }
        .fac-tabs::-webkit-scrollbar {
          display: none;
        }
        .fac-tab {
          padding: 10px 18px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .fac-tab.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .fac-tab:hover {
          border-color: #2B3490;
        }
        .fac-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .fac-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .fac-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .fac-photo {
          width: 100%;
          aspect-ratio: 1/1;
          background: linear-gradient(135deg, #2B3490, #1e2570);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .fac-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .fac-info {
          padding: 20px;
        }
        .fac-name {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px;
        }
        .fac-designation {
          color: #2B3490;
          font-size: 12px;
          font-weight: 700;
          margin: 0 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .fac-meta {
          font-size: 13px;
          color: #666;
          margin: 0 0 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .fac-meta strong {
          color: #2B3490;
        }
        .fac-specialization {
          display: inline-block;
          background: #eef1ff;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
        }
        @media (max-width: 1200px) {
          .fac-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .fac-grid {
            grid-template-columns: 1fr;
          }
          .fac-stats-bar {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            padding: 24px 0;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="fac-hero"
        style={{
          backgroundImage: `url('/images/campus/13.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="fac-eyebrow" style={{ marginBottom: 16 }}>
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
                {faculty.pageTitle}
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
                {faculty.subtitle}
              </motion.p>

              {/* BREADCRUMB */}
              <motion.div variants={fadeUp} className="fac-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span>{faculty.pageTitle}</span>
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
              {faculty.intro}
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
            className="fac-stats-bar"
          >
            <motion.div variants={fadeUp} className="fac-stat-item">
              <div className="fac-stat-icon">
                <Users size={24} color="#FFE619" />
              </div>
              <div className="fac-stat-number">{faculty.stats.totalFaculty}</div>
              <div className="fac-stat-label">Total Faculty</div>
            </motion.div>
            <motion.div variants={fadeUp} className="fac-stat-item">
              <div className="fac-stat-icon">
                <Award size={24} color="#FFE619" />
              </div>
              <div className="fac-stat-number">{faculty.stats.phdHolders}</div>
              <div className="fac-stat-label">PhD Holders</div>
            </motion.div>
            <motion.div variants={fadeUp} className="fac-stat-item">
              <div className="fac-stat-icon">
                <Briefcase size={24} color="#FFE619" />
              </div>
              <div className="fac-stat-number">{faculty.stats.avgExperience}</div>
              <div className="fac-stat-label">Avg. Experience</div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* FACULTY LIST */}
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
              Our Faculty by Department
            </motion.h2>

            {/* DEPARTMENT TABS */}
            <motion.div variants={fadeUp}>
              <div className="fac-tabs">
                {faculty.departments.map((dept, idx) => (
                  <button
                    key={idx}
                    className={`fac-tab ${selectedDept === idx ? "active" : ""}`}
                    onClick={() => setSelectedDept(idx)}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* FACULTY GRID */}
            <motion.div variants={stagger} className="fac-grid">
              {currentDept.faculty.map((member, idx) => (
                <motion.div key={idx} variants={fadeUp} className="fac-card">
                  <div className="fac-photo">
                    <img src={member.photoUrl} alt={member.name} onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }} />
                  </div>
                  <div className="fac-info">
                    <h3 className="fac-name">{member.name}</h3>
                    <div className="fac-designation">{member.designation}</div>
                    <div className="fac-meta">
                      <div><strong>Qualification:</strong> {member.qualification}</div>
                      <div><strong>Experience:</strong> {member.experience}</div>
                    </div>
                    <div className="fac-specialization">{member.specialization}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
