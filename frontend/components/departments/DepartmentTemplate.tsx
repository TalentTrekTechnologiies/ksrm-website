"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Container from "@/components/ui/Container"
import { Department } from "@/data/departments"
import { Cpu, BookOpen, User } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

interface DepartmentTemplateProps {
  department: Department
}

export default function DepartmentTemplate({ department }: DepartmentTemplateProps) {
  const [activeSection, setActiveSection] = useState("about")

  const sections = [
    { id: "about", label: "About" },
    { id: "vision-mission", label: "Vision & Mission" },
    { id: "hod", label: "HOD" },
    { id: "faculty", label: "Faculty" },
    { id: "programmes", label: "Programmes" },
    { id: "labs", label: "Laboratories" },
    { id: "outcomes", label: "Outcomes" },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 200) {
            setActiveSection(section.id)
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .dept-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .dept-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .dept-sticky-nav {
          position: sticky;
          top: 48px;
          background: #fff;
          border-bottom: 1px solid #eef0f3;
          z-index: 100;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dept-sticky-nav::-webkit-scrollbar { display: none; }
        .dept-nav-container {
          display: flex;
          gap: 8px;
          padding: 12px 5%;
          min-width: max-content;
        }
        .dept-nav-pill {
          padding: 10px 18px;
          border-radius: 24px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dept-nav-pill.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .dept-nav-pill:hover {
          border-color: #2B3490;
        }
        .dept-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #FFE619;
        }
        .dept-card {
          background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 16px; padding: 32px;
        }
        .dept-vision-quote {
          border-left: 4px solid #FFE619;
          padding-left: 24px;
          margin: 24px 0;
        }
        .dept-mission-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;
          margin-top: 24px;
        }
        .dept-programmes-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
          margin-top: 24px;
        }
        .dept-labs-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
          margin-top: 24px;
        }
        .dept-faculty-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
          margin-top: 24px;
        }
        @media (max-width: 1760px) {
          .dept-faculty-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .dept-faculty-grid { grid-template-columns: 1fr; }
        }
        .dept-outcomes-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;
          margin-top: 24px;
        }
        .dept-pos-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;
          margin-top: 24px;
        }
        .dept-po-item {
          background: #f7f8fa; padding: 20px; border-radius: 12px; border: 1px solid #eef0f3;
        }
        @media (max-width: 900px) {
          .dept-programmes-grid { grid-template-columns: 1fr; }
          .dept-labs-grid { grid-template-columns: 1fr; }
          .dept-outcomes-grid { grid-template-columns: 1fr; }
          .dept-pos-grid { grid-template-columns: 1fr; }
          .dept-mission-grid { grid-template-columns: 1fr; }
          .dept-faculty-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="dept-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="dept-eyebrow" style={{ marginBottom: 16 }}>
                {department.shortName}
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0,
                }}
              >
                {department.name}
              </motion.h1>
              {department.tagline && (
                <motion.p
                  variants={fadeUp}
                  style={{
                    color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6,
                    margin: "16px 0 0", fontWeight: 400, maxWidth: 700,
                  }}
                >
                  {department.tagline}
                </motion.p>
              )}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* STICKY NAV */}
      <div className="dept-sticky-nav">
        <div className="dept-nav-container">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`dept-nav-pill ${activeSection === section.id ? "active" : ""}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            style={{ maxWidth: 820 }}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px",
              }}
            >
              About the Department
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{
                color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0,
              }}
            >
              {department.about}
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* VISION & MISSION */}
      <section id="vision-mission" style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
          >
            {/* VISION */}
            <motion.div variants={fadeUp} style={{ maxWidth: 820, marginBottom: 56 }}>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px",
                }}
              >
                Vision
              </motion.h2>
              <div className="dept-vision-quote">
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#2B3490",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  "{department.vision}"
                </p>
              </div>
            </motion.div>

            {/* MISSION */}
            <motion.div variants={fadeUp}>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                  fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px",
                }}
              >
                Mission
              </motion.h2>
              <div className="dept-mission-grid">
                {(department.mission || []).map((m, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="dept-card"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 50,
                      background: "#FFE619",
                      color: "#2B3490",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <p style={{
                      color: "#555",
                      fontSize: 15,
                      lineHeight: 1.7,
                      margin: 0,
                    }}>
                      {m}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* HOD */}
      <section id="hod" style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px",
              }}
            >
              Head of Department
            </motion.h2>

            {department.hod && (
              <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 48, alignItems: "start" }}>
                {/* LEFT: PHOTO + CARD */}
                <motion.div variants={slideInLeft}>
                  <div
                    style={{
                      width: "100%", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden",
                      background: "linear-gradient(135deg, #2B3490, #1e2570)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {department.hod?.photo ? (
                      <img
                        src={department.hod.photo}
                        alt={department.hod?.name || "HOD"}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = "flex"
                        }}
                      />
                    ) : null}
                    {!department.hod?.photo && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <User size={64} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 24, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", margin: "16px 0 0", letterSpacing: "1px" }}>
                            {department.hod?.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="dept-card" style={{ marginTop: 24 }}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                      {department.hod.name}
                    </h3>
                    <p style={{ color: "#2B3490", fontSize: 12, fontWeight: 700, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {department.hod.designation}
                    </p>
                    <p style={{ color: "#666", fontSize: 14, margin: "0 0 16px", borderTop: "1px solid #eef0f3", paddingTop: 12 }}>
                      {department.hod.qualification}
                    </p>
                    {department.hod.email && (
                      <a href={`mailto:${department.hod.email}`} style={{ color: "#2B3490", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                        {department.hod.email}
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* RIGHT: MESSAGE */}
                <motion.div variants={slideInRight} style={{ paddingTop: 20 }}>
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{
                      fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)",
                      fontWeight: 700, color: "#1a1a2e", margin: 0,
                    }}>
                      Message
                    </h3>
                  </div>
                  {(department.hod.message || []).map((msg, idx) => (
                    <p key={idx} style={{ color: "#555", fontSize: 15, lineHeight: 1.8, margin: "0 0 16px" }}>
                      {msg}
                    </p>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        </Container>
      </section>

      {/* FACULTY */}
      <section id="faculty" style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <div>
            <h2
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 32px",
              }}
            >
              Our Faculty
            </h2>

            <div className="dept-faculty-grid">
              {(department.faculty || []).map((member, idx) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()

                return (
                  <div
                    key={idx}
                    style={{
                      background: "#fff",
                      border: "1px solid #eef0f3",
                      borderRadius: 12,
                      overflow: "hidden",
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
                    {/* PHOTO */}
                    <div
                      style={{
                        width: "100%", aspectRatio: "1/1", borderRadius: "12px 12px 0 0",
                        overflow: "hidden",
                        background: "linear-gradient(135deg, #2B3490, #1e2570)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          loading="eager"
                          fetchPriority="high"
                          style={{
                            width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
                            display: "block",
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = "flex"
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: member.photo ? "none" : "flex",
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, #2B3490, #1e2570)",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                          }}
                        >
                          <User size={48} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                          <p
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: 18,
                              fontWeight: 700,
                              fontFamily: "'Rajdhani', sans-serif",
                              margin: "12px 0 0",
                              letterSpacing: "1px",
                            }}
                          >
                            {initials}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* INFO */}
                    <div style={{ padding: "16px" }}>
                      <h3
                        style={{
                          fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700,
                          color: "#1a1a2e", margin: "0 0 4px",
                        }}
                      >
                        {member.name}
                      </h3>
                      <p
                        style={{
                          color: "#2B3490", fontSize: 12, fontWeight: 700,
                          margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5,
                        }}
                      >
                        {member.designation}
                      </p>
                      <p style={{ color: "#666", fontSize: 12, margin: "0 0 8px" }}>
                        {member.qualification}
                      </p>
                      {member.specialization && (
                        <div
                          style={{
                            display: "inline-block",
                            background: "#eef1ff",
                            color: "#2B3490",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          {member.specialization}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* PROGRAMMES */}
      <section id="programmes" style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 32px",
              }}
            >
              Programmes Offered
            </motion.h2>

            <div className="dept-programmes-grid">
              {(department.programmes || []).map((prog, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="dept-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BookOpen size={20} color="#2B3490" />
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                      {prog.name}
                    </h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                    <div>
                      <p style={{ color: "#666", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Level</p>
                      <p style={{ color: "#1a1a2e", fontSize: 14, fontWeight: 600, margin: 0 }}>{prog.level}</p>
                    </div>
                    <div>
                      <p style={{ color: "#666", fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Intake</p>
                      <p style={{ color: "#1a1a2e", fontSize: 14, fontWeight: 600, margin: 0 }}>{prog.intake}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* LABORATORIES */}
      <section id="labs" style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700, color: "#1a1a2e", margin: "0 0 32px",
              }}
            >
              Laboratories
            </motion.h2>

            <div className="dept-labs-grid">
              {(department.labs || []).map((lab, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  style={{
                    background: "#fff",
                    border: "1px solid #eef0f3",
                    borderRadius: 12,
                    overflow: "hidden",
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
                  {/* LAB IMAGE */}
                  {lab.imageUrl && (
                    <img
                      src={lab.imageUrl || "/images/campus/01.jpg"}
                      alt={lab.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        objectPosition: "center",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/campus/01.jpg"
                        e.currentTarget.onerror = null
                      }}
                    />
                  )}

                  {/* LAB INFO */}
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <Cpu size={24} color="#2B3490" />
                      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                        {lab.name}
                      </h3>
                    </div>
                    {lab.description && (
                      <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                        {lab.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* OUTCOMES */}
      <section id="outcomes" style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
          >
            {/* PEOs */}
            <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                  fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px",
                }}
              >
                Programme Educational Objectives (PEOs)
              </motion.h2>
              <div className="dept-outcomes-grid">
                {(department.peos || []).map((peo) => (
                  <motion.div
                    key={peo.code}
                    variants={fadeUp}
                    className="dept-card"
                  >
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                      {peo.code}
                    </h3>
                    <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {peo.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* PSOs */}
            <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                  fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px",
                }}
              >
                Programme Specific Outcomes (PSOs)
              </motion.h2>
              <div className="dept-outcomes-grid">
                {(department.psos || []).map((pso) => (
                  <motion.div
                    key={pso.code}
                    variants={fadeUp}
                    className="dept-card"
                  >
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                      {pso.code}
                    </h3>
                    <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {pso.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* POs */}
            <motion.div variants={fadeUp}>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                  fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px",
                }}
              >
                Programme Outcomes (POs) - NBA Standards
              </motion.h2>
              <div className="dept-pos-grid">
                {(department.pos || []).map((po) => (
                  <motion.div
                    key={po.code}
                    variants={fadeUp}
                    className="dept-po-item"
                  >
                    <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: "#2B3490", margin: "0 0 6px" }}>
                      {po.code}: {po.title}
                    </h4>
                    <p style={{ color: "#555", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                      {po.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
