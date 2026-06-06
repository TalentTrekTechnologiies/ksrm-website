"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { news } from "@/data/news"
import { ChevronRight } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    Examinations: { bg: "#eef1ff", text: "#2B3490" },
    Events: { bg: "#fff3e0", text: "#f57c00" },
    Accreditation: { bg: "#e8f5e9", text: "#388e3c" },
    Rankings: { bg: "#fce4ec", text: "#c2185b" },
    Placements: { bg: "#e0f2f1", text: "#00897b" },
  }
  return colors[category] || { bg: "#f7f8fa", text: "#666" }
}

export default function NewsTemplate() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredNews =
    activeCategory === "All" ? news.news : news.news.filter((item) => item.category === activeCategory)

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .news-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .news-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .news-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .news-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .news-filters {
          display: flex;
          gap: 12px;
          margin: 48px 0;
          flex-wrap: wrap;
        }
        .news-filter-btn {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          color: #666;
          padding: 12px 24px;
          border-radius: 24px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
        }
        .news-filter-btn:hover {
          border-color: #2B3490;
          color: #2B3490;
        }
        .news-filter-btn.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin: 32px 0;
        }
        .news-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
          position: relative;
        }
        .news-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(43,52,144,0.15);
        }
        .news-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          z-index: 10;
        }
        .news-new-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #FF6B6B;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          z-index: 10;
        }
        .news-content {
          padding: 24px;
        }
        .news-date {
          font-size: 12px;
          color: #999;
          margin-bottom: 12px;
          display: block;
        }
        .news-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 12px;
          line-height: 1.4;
        }
        .news-description {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .news-read-more {
          color: #2B3490;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .news-read-more:hover {
          color: #FFE619;
        }
        @media (max-width: 1024px) {
          .news-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .news-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="news-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="news-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{news.pageTitle}</span>
              </div>
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
                {news.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 300,
                  maxWidth: 600,
                }}
              >
                {news.subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* FILTERS */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="news-filters">
            {news.categories.map((category) => (
              <button
                key={category}
                className={`news-filter-btn ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* NEWS GRID */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="news-grid">
            {filteredNews.map((item) => {
              const categoryColor = getCategoryColor(item.category)
              return (
                <motion.div key={item.id} variants={fadeUp} className="news-card">
                  <div
                    className="news-badge"
                    style={{
                      background: categoryColor.bg,
                      color: categoryColor.text,
                    }}
                  >
                    {item.category}
                  </div>
                  {item.isNew && <div className="news-new-badge">🆕 NEW</div>}
                  <div className="news-content">
                    <span className="news-date">{item.date}</span>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-description">{item.description}</p>
                    <a href={item.link} className="news-read-more">
                      Read More
                      <ChevronRight size={16} />
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
