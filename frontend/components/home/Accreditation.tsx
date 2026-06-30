"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

type ColorClass = "naac" | "nba" | "nirf" | "ugc"

interface Accred {
  shortName: string
  grade: string
  name: string
  sub: string
  link: string
  linkText: string
  colorClass: ColorClass
  image?: string
}

const accreditations: Accred[] = [
  { shortName: "NAAC", grade: "A++",        name: "NAAC Accredited", sub: "3.60 CGPA",              link: "/accreditation", linkText: "View Certificate", colorClass: "naac", image: "/naac.png"  },
  { shortName: "NBA",  grade: "Tier-1",     name: "NBA Accredited",  sub: "CE, ECE, CSE, EEE, ME",  link: "/accreditation", linkText: "View Programs",    colorClass: "nba",  image: "/nba.png"   },
  { shortName: "NIRF", grade: "Ranked",     name: "NIRF India",      sub: "Engineering Category",   link: "/accreditation", linkText: "View Ranking",     colorClass: "nirf", image: "/nirf.jpg"  },
  { shortName: "UGC",  grade: "Autonomous", name: "UGC Status",      sub: "Affiliated to JNTUA",    link: "/accreditation", linkText: "Learn More",        colorClass: "ugc",  image: "/ugc.webp"  },
]

const gradients: Record<ColorClass, string> = {
  naac: "linear-gradient(135deg, #c8960c, #a8540c)",
  nba:  "linear-gradient(135deg, #1a8fb8, #134e7a)",
  nirf: "linear-gradient(135deg, #2B3490, #1e2570)",
  ugc:  "linear-gradient(135deg, #0d7a4d, #064d30)",
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

export default function Accreditation() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      className="accred-section"
      style={{ width: "100%", background: "#f7f8fa", padding: "56px 0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
        .accred-section { box-sizing: border-box; }
        .accred-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin: 32px 0 0;
        }
        @media (max-width: 1024px) {
          .accred-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .accred-section { padding: 32px 0 !important; }
          .accred-grid    { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 380px) {
          .accred-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
      {/* HEADER */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" as const }}>
          RECOGNIZED FOR QUALITY
        </div>
        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "32px", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 6px" }}>
          Accreditations & Rankings
        </h2>
        <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
          Certified excellence you can trust.
        </p>
      </div>

      {/* CARDS GRID */}
      <motion.div
        className="accred-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {(Array.isArray(accreditations) ? accreditations : []).map((item, i) => {
          const hovered = hoveredIndex === i
          return (
            <motion.div key={item.shortName} variants={cardVariants}>
              <Link href={item?.link ?? "/"} style={{ textDecoration: "none", display: "block" }}>
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #eef0f3",
                    borderRadius: "16px",
                    padding: "28px 22px",
                    textAlign: "center",
                    cursor: "pointer",
                    transform: hovered ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: hovered
                      ? "0 14px 32px rgba(43,52,144,0.13)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  {/* CIRCULAR BADGE — logo image if available, else gradient + text */}
                  <div style={{
                    width: "72px", height: "72px",
                    borderRadius: "50%",
                    background: item.image ? "#ffffff" : gradients[item.colorClass],
                    border: item.image ? "1px solid #eef0f3" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                    overflow: "hidden",
                  }}>
                    {item.image ? (
                      <img
                        src={item?.image ?? ""}
                        alt={item.shortName}
                        style={{ width: "88%", height: "88%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "18px", fontWeight: 700,
                        color: "#ffffff",
                      }}>
                        {item.shortName}
                      </span>
                    )}
                  </div>

                  {/* GRADE */}
                  <div style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "26px", fontWeight: 700,
                    color: "#1a1a2e", lineHeight: 1,
                  }}>
                    {item.grade}
                  </div>

                  {/* NAME */}
                  <div style={{ fontSize: "13px", color: "#555", fontWeight: 600, margin: "6px 0 4px" }}>
                    {item?.name ?? ""}
                  </div>

                  {/* SUB */}
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {item.sub}
                  </div>

                  {/* LINK TEXT */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                    marginTop: "14px",
                    fontSize: "12px", fontWeight: 600, color: "#2B3490",
                  }}>
                    {item?.linkText ?? "Learn More"} <ArrowRight size={13} strokeWidth={2} />
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
