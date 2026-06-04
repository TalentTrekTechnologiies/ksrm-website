"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  GraduationCap, FileText, Briefcase, BookOpen,
  ScrollText, Monitor, Users, FlaskConical,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

interface Service {
  Icon: LucideIcon
  title: string
  desc: string
  link: string
}

const services: Service[] = [
  { Icon: GraduationCap, title: "Admissions",   desc: "Apply & eligibility",     link: "/admissions" },
  { Icon: FileText,      title: "Examinations", desc: "Results & timetables",    link: "/results"    },
  { Icon: Briefcase,     title: "Placements",   desc: "Careers & recruiters",    link: "/placements" },
  { Icon: BookOpen,      title: "Library",      desc: "E-resources & OPAC",      link: "/library"    },
  { Icon: ScrollText,    title: "Syllabus",     desc: "Download by semester",    link: "/academics"  },
  { Icon: Monitor,       title: "Student ERP",  desc: "Login portal",            link: "/contact"    },
  { Icon: Users,         title: "Alumni",       desc: "Network & events",        link: "/alumni"     },
  { Icon: FlaskConical,  title: "Research",     desc: "Publications & R&D",      link: "/research"   },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

export default function CampusServices() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      className="services-section"
      style={{ width: "100%", background: "#ffffff", padding: "52px 0", borderTop: "1px solid #f1f5f9" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

        .services-section { box-sizing: border-box; }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 32px 0 0;
        }

        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .services-section { padding: 32px 0 !important; }
          .services-grid    { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 380px) {
          .services-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
      {/* SECTION HEADER */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
          color: "#2B3490", textTransform: "uppercase",
        }}>
          QUICK ACCESS
        </div>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "32px", fontWeight: 700,
          color: "#1a1a2e", margin: "8px 0 0",
        }}>
          Digital Campus Services
        </h2>
      </div>

      {/* CARDS GRID */}
      <motion.div
        className="services-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {services.map((service, i) => {
          const hovered = hoveredIndex === i
          return (
            <motion.div key={service.title} variants={cardVariants}>
              <Link href={service.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #eef0f3",
                    borderRadius: "14px",
                    padding: "32px 20px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    height: "100%",
                    boxSizing: "border-box",
                    transform: hovered ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: hovered
                      ? "0 14px 34px rgba(43,52,144,0.14)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  {/* YELLOW TOP ACCENT — slides in on hover */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "100%", height: "3px",
                    background: "#FFE619",
                    transform: hovered ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.25s ease",
                  }} />

                  {/* ICON CIRCLE */}
                  <div style={{
                    width: "60px", height: "60px",
                    borderRadius: "50%",
                    background: hovered ? "#2B3490" : "#eef1ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    transition: "background 0.25s ease",
                  }}>
                    <service.Icon
                      size={27}
                      strokeWidth={1.8}
                      color={hovered ? "#ffffff" : "#2B3490"}
                    />
                  </div>

                  {/* TITLE */}
                  <div style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "19px", fontWeight: 700, color: "#1a1a2e",
                  }}>
                    {service.title}
                  </div>

                  {/* DESCRIPTION */}
                  <div style={{ fontSize: "12.5px", color: "#888", marginTop: "4px" }}>
                    {service.desc}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
      </Container>
    </section>
  )
}
