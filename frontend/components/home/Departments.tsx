"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Code, Radio, Zap, Cog, Building2, BookText, BarChart3, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

interface Department {
  Icon: LucideIcon
  code: string
  name: string
  hod: string
  link: string
}

const departments: Department[] = [
  { Icon: Code,      code: "CSE",   name: "Computer Science & Engineering", hod: "Dr. V. Lokeswara Reddy",    link: "/departments/cse"   },
  { Icon: Radio,     code: "ECE",   name: "Electronics & Communication",    hod: "Dr. M. Venkatanarayana",    link: "/departments/ece"   },
  { Icon: Zap,       code: "EEE",   name: "Electrical & Electronics",       hod: "Dr. M.S. Priyadarshini",    link: "/departments/eee"   },
  { Icon: Cog,       code: "MECH",  name: "Mechanical Engineering",         hod: "Dr. D. Ravikanth",          link: "/departments/mech"  },
  { Icon: Building2, code: "CIVIL", name: "Civil Engineering",              hod: "Dr. G. Chennakesava Reddy", link: "/departments/civil" },
  { Icon: BookText,  code: "H&S",   name: "Humanities & Sciences",          hod: "Dr. V. Ramachandra Reddy",  link: "/departments/hs"    },
  { Icon: BarChart3, code: "MBA",   name: "Management Studies",             hod: "Department of MBA",         link: "/departments/mba"   },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

export default function Departments() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      className="depts-section"
      style={{ width: "100%", background: "#ffffff", padding: "56px 0", borderTop: "1px solid #f1f5f9" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
        .depts-section { box-sizing: border-box; }
        .depts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 32px 0 0;
        }
        @media (max-width: 1024px) {
          .depts-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .depts-section { padding: 32px 0 !important; }
          .depts-grid    { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 380px) {
          .depts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
      {/* HEADER */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" as const }}>
          ACADEMICS
        </div>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "32px", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 6px" }}>
          Our Departments
        </h2>
        <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
          Seven departments. Decades of academic excellence.
        </p>
      </div>

      {/* GRID */}
      <motion.div
        className="depts-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* 7 DEPARTMENT CARDS */}
        {departments.map((dept, i) => {
          const hovered = hoveredIndex === i
          return (
            <motion.div key={dept.code} variants={cardVariants} style={{ height: "100%" }}>
              <Link href={dept.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #eef0f3",
                    borderRadius: "14px",
                    padding: "24px 20px",
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    height: "100%",
                    boxSizing: "border-box" as const,
                    transform: hovered ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: hovered
                      ? "0 14px 32px rgba(43,52,144,0.16)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  {/* NAVY FILL — grows upward from bottom */}
                  <div style={{
                    position: "absolute",
                    bottom: 0, left: 0,
                    width: "100%",
                    height: hovered ? "100%" : "0%",
                    background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
                    zIndex: 0,
                    transition: "height 0.3s ease",
                  }} />

                  {/* CONTENT — above fill */}
                  <div style={{ position: "relative", zIndex: 1 }}>

                    {/* ICON BOX */}
                    <div style={{
                      width: "48px", height: "48px",
                      borderRadius: "12px",
                      background: hovered ? "rgba(255,255,255,0.15)" : "#eef1ff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "14px",
                      transition: "background 0.25s ease",
                    }}>
                      <dept.Icon size={22} strokeWidth={1.8} color={hovered ? "#ffffff" : "#2B3490"} />
                    </div>

                    {/* CODE */}
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "13px", fontWeight: 700,
                      color: "#FFE619",
                      letterSpacing: "1px",
                      marginBottom: "4px",
                    }}>
                      {dept.code}
                    </div>

                    {/* NAME */}
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "17px", fontWeight: 700,
                      color: hovered ? "#ffffff" : "#1a1a2e",
                      lineHeight: 1.25,
                      marginBottom: "8px",
                      transition: "color 0.25s ease",
                    }}>
                      {dept.name}
                    </div>

                    {/* HOD */}
                    <div style={{
                      fontSize: "12px",
                      color: hovered ? "rgba(255,255,255,0.72)" : "#888",
                      transition: "color 0.25s ease",
                    }}>
                      {dept.hod}
                    </div>

                    {/* EXPLORE */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      marginTop: "14px",
                      fontSize: "13px", fontWeight: 600,
                      color: hovered ? "#FFE619" : "#2B3490",
                      transition: "color 0.25s ease",
                    }}>
                      Explore <ArrowRight size={13} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {/* 8th CARD — View All */}
        <motion.div variants={cardVariants} style={{ height: "100%" }}>
          <Link href="/departments" style={{ textDecoration: "none", display: "block", height: "100%" }}>
            <div style={{
              border: "2px dashed #d1d5db",
              borderRadius: "14px",
              padding: "24px 20px",
              background: "#f7f8fa",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              height: "100%",
              minHeight: "200px",
              textAlign: "center",
              boxSizing: "border-box" as const,
            }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: "#eef1ff",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <ArrowRight size={22} color="#2B3490" strokeWidth={1.8} />
              </div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "17px", fontWeight: 700, color: "#555",
              }}>
                View All<br />Departments
              </div>
              <div style={{ fontSize: "12px", color: "#2B3490", fontWeight: 600, marginTop: "8px" }}>
                Explore all →
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
      </Container>
    </section>
  )
}
