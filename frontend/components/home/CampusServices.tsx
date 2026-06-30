"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { homeData } from "@/data/home"

const EASE = [0.22, 1, 0.36, 1] as const

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
        {(Array.isArray(homeData?.services) ? homeData.services : []).map((service) => (
          <motion.div key={service.title} variants={cardVariants}>
            <Link href={service.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
              <div style={{
                background: "#ffffff",
                border: "1px solid #eef0f3",
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                height: "100%",
                boxSizing: "border-box",
              }}>
                {/* NAVY TOP WITH SVG POSTER */}
                <div style={{
                  background: "#2B3490",
                  padding: "20px",
                  height: "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}>
                  <img
                    src={service?.poster}
                    alt={service?.label ?? "Service"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100px",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {/* WHITE TEXT SECTION */}
                <div style={{
                  padding: "16px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: "6px",
                  }}>
                    {service.title}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "#888",
                  }}>
                    {service.desc}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      </Container>
    </section>
  )
}
