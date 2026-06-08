"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"
import { Image } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function GalleryTemplate() {
  const [activeCategory, setActiveCategory] = useState("All")

  const categories = ["All", "Events", "Campus", "Sports", "Cultural", "Achievements"]

  const galleryItems = [
    { id: 1, title: "Annual Tech Fest 2024", year: "2024", category: "Events", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: 2, title: "Campus Infrastructure", year: "2024", category: "Campus", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: 3, title: "Cricket Championship", year: "2024", category: "Sports", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: 4, title: "Cultural Fest Opening", year: "2024", category: "Cultural", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { id: 5, title: "Placements Celebration", year: "2024", category: "Achievements", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: 6, title: "Convocation 2024", year: "2024", category: "Events", gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
    { id: 7, title: "Library Renovation", year: "2024", category: "Campus", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { id: 8, title: "Volleyball Tournament", year: "2024", category: "Sports", gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)" },
    { id: 9, title: "Music and Dance Show", year: "2024", category: "Cultural", gradient: "linear-gradient(135deg, #2e2e78 0%, #662d8c 100%)" },
    { id: 10, title: "100% Placement Record", year: "2024", category: "Achievements", gradient: "linear-gradient(135deg, #cd5c5c 0%, #ffb347 100%)" },
    { id: 11, title: "Sports Day Opening", year: "2024", category: "Sports", gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)" },
    { id: 12, title: "National Award Win", year: "2024", category: "Achievements", gradient: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)" },
  ]

  const filteredItems = activeCategory === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory)

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .gal-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .gal-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .gal-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .gal-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: color 0.2s;
        }
        .gal-breadcrumb a:hover {
          color: #fff;
        }
        .gal-filters {
          display: flex;
          gap: 12px;
          margin: 32px 0;
          flex-wrap: wrap;
        }
        .gal-filter-btn {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          color: #2B3490;
          padding: 12px 24px;
          border-radius: 24px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Rajdhani', sans-serif;
          transition: all 0.2s;
        }
        .gal-filter-btn.active {
          background: #2B3490;
          color: #FFE619;
          border-color: #2B3490;
        }
        .gal-filter-btn:hover {
          background: #2B3490;
          color: #FFE619;
          border-color: #2B3490;
        }
        .gal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 32px 0;
        }
        .gal-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
        }
        .gal-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.1);
        }
        .gal-card-image {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .gal-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.2);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .gal-card:hover .gal-card-overlay {
          opacity: 1;
        }
        .gal-card-content {
          padding: 16px;
        }
        .gal-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 8px;
        }
        .gal-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #999;
        }
        @media (max-width: 1200px) {
          .gal-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .gal-grid { grid-template-columns: 1fr; }
          .gal-filters { gap: 8px; }
          .gal-filter-btn { padding: 10px 16px; font-size: 13px; }
        }
      `}</style>

      {/* HERO */}
      <section className="gal-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="gal-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>Gallery</span>
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
                Gallery
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
                Capturing Moments of Excellence
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* FILTERS */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <div className="gal-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`gal-filter-btn ${activeCategory === category ? "active" : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* GALLERY GRID */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <AnimatePresence>
              <motion.div variants={stagger} className="gal-grid">
                {filteredItems.map((item) => (
                  <motion.div key={item.id} variants={fadeUp} className="gal-card" layout>
                    <div className="gal-card-image" style={{ background: item.gradient }}>
                      <Image size={40} color="rgba(255,255,255,0.3)" />
                      <div className="gal-card-overlay" />
                    </div>
                    <div className="gal-card-content">
                      <h3 className="gal-card-title">{item.title}</h3>
                      <div className="gal-card-meta">
                        <span>{item.year}</span>
                        <span style={{ color: "#2B3490", fontWeight: 600 }}>{item.category}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
