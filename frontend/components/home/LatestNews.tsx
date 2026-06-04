"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

interface NewsItem {
  category: string
  date: string
  title: string
  link: string
  gradient: string
}

const news: NewsItem[] = [
  {
    category: "Examinations",
    date:     "May 28, 2026",
    title:    "Sem-End Exams May-June 2026 Preponed — Revised Schedule Released",
    link:     "/news",
    gradient: "linear-gradient(135deg, #2B3490, #1e2570)",
  },
  {
    category: "Results",
    date:     "May 20, 2026",
    title:    "M.Tech II Sem (R22PG) Supplementary Results Now Available",
    link:     "/news",
    gradient: "linear-gradient(135deg, #1a6ea8, #134e7a)",
  },
  {
    category: "Event",
    date:     "May 15, 2026",
    title:    "Graduation Day 2K26 — Application Forms Open for Final Year Students",
    link:     "/news",
    gradient: "linear-gradient(135deg, #9c2752, #6e1839)",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

export default function LatestNews() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section
      className="news-section"
      style={{ width: "100%", background: "#f7f8fa", padding: "56px 0" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
        .news-section { box-sizing: border-box; }

        .news-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin: 0 0 28px;
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .news-desktop-view { display: block; }
        .news-mobile-view  { display: none; }

        @media (max-width: 1024px) {
          .news-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .news-section { padding: 40px 0 !important; }
        }
        @media (max-width: 768px) {
          .news-section      { padding: 0 !important; background: #fff !important; }
          .news-desktop-view { display: none !important; }
          .news-mobile-view  { display: block !important; }
        }
      `}</style>

      {/* ── DESKTOP VIEW ── */}
      <div className="news-desktop-view">
      <Container>
      {/* HEADER ROW */}
      <div className="news-header">
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" as const }}>
            STAY UPDATED
          </div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "32px", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}>
            Latest News & Events
          </h2>
        </div>
        <Link href="/news" style={{
          fontSize: "14px", fontWeight: 600, color: "#2B3490",
          textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
          flexShrink: 0, paddingBottom: "4px",
        }}>
          View All <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>

      {/* CARDS GRID */}
      <motion.div
        className="news-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {news.map((item, i) => {
          const hovered = hoveredIndex === i
          return (
            <motion.div key={i} variants={cardVariants}>
              <Link href={item.link} style={{ textDecoration: "none", display: "block" }}>
                <div
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid #eef0f3",
                    cursor: "pointer",
                    transform: hovered ? "translateY(-6px)" : "translateY(0)",
                    boxShadow: hovered
                      ? "0 16px 36px rgba(43,52,144,0.13)"
                      : "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  {/* GRADIENT TOP AREA */}
                  <div style={{
                    height: "160px",
                    background: item.gradient,
                    position: "relative",
                  }}>
                    {/* CATEGORY TAG */}
                    <div style={{
                      position: "absolute",
                      top: "12px", left: "12px",
                      background: "rgba(255,255,255,0.95)",
                      color: "#2B3490",
                      fontSize: "10px", fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "20px",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.5px",
                    }}>
                      {item.category}
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div style={{ padding: "18px 18px 22px" }}>

                    {/* DATE */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      fontSize: "12px", color: "#999", marginBottom: "8px",
                    }}>
                      <Calendar size={13} strokeWidth={1.8} />
                      {item.date}
                    </div>

                    {/* TITLE */}
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "18px", fontWeight: 700,
                      color: "#1a1a2e", lineHeight: 1.3,
                      marginBottom: "14px",
                    }}>
                      {item.title}
                    </div>

                    {/* READ MORE */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      fontSize: "13px", fontWeight: 600, color: "#2B3490",
                    }}>
                      Read More <ArrowRight size={14} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
      </Container>
      </div>{/* end desktop-view */}

      {/* ── MOBILE VIEW: flat notification list ── */}
      <div className="news-mobile-view">
        <div style={{
          background: "#2B3490",
          color: "#fff",
          padding: "11px 16px",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase" as const,
        }}>
          News &amp; Announcements
        </div>

        {news.map((item, i) => (
          <Link key={i} href={item.link} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "13px 16px",
            borderBottom: "1px solid #eee",
            background: "#fff",
            textDecoration: "none",
          }}>
            <span style={{
              background: "#FFE619",
              color: "#1a1a2e",
              fontSize: "8px",
              fontWeight: 800,
              padding: "2px 6px",
              borderRadius: "3px",
              letterSpacing: "0.5px",
              flexShrink: 0,
              marginTop: "3px",
              display: "inline-block",
              textTransform: "uppercase" as const,
            }}>NEW</span>
            <span style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#1a3a8a",
              lineHeight: 1.45,
            }}>
              {item.title}
            </span>
          </Link>
        ))}

        <Link href="/news" style={{
          display: "block",
          padding: "12px 16px",
          background: "#f4f6fb",
          color: "#2B3490",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          textAlign: "center" as const,
          borderTop: "2px solid #e5e9f5",
        }}>
          View All Notifications →
        </Link>
      </div>
    </section>
  )
}
