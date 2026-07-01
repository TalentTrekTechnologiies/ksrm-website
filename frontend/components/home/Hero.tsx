"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from "react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE, delay },
  }),
}

const captions = [
  { label: "RESEARCH & INNOVATION", text: "State-of-the-art Laboratories" },
  { label: "CAMPUS LIFE",           text: "Vibrant Cultural Activities"   },
  { label: "EXCELLENCE",            text: "Sports & Achievements"         },
  { label: "ENVIRONMENT",           text: "Beautiful Green Campus"        },
  { label: "LEARNING",              text: "Modern Digital Library"        },
]

const newsItems = [
  { isNew: true,  date: "May 28", text: "Sem-End Exams May-June 2026 Preponed"    },
  { isNew: true,  date: "May 20", text: "M.Tech II Sem Supplementary Results Out" },
  { isNew: false, date: "May 15", text: "Graduation Day 2K26 Forms Open"          },
  { isNew: false, date: "May 10", text: "KGCET-2K26 Results Announced"            },
]

const heroSlides = [
  { type: "video", src: "/videos/main-block.mp4" },
]

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Caption rotation (every 3 seconds)
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % captions.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])



  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        width: "100%",
        height: "70vh",
        minHeight: "500px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400&display=swap');

        @keyframes pulse-dot {
          0%   { box-shadow: 0 0 0 0 rgba(232,17,45,0.7); }
          70%  { box-shadow: 0 0 0 6px rgba(232,17,45,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,17,45,0); }
        }
        @keyframes news-scroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }

        .pulse-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #E8112D;
          flex-shrink: 0;
          animation: pulse-dot 1.5s infinite;
        }

        .news-track {
          animation: news-scroll 12s linear infinite;
        }
        .hero-glass:hover .news-track {
          animation-play-state: paused;
        }

        .news-item {
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: background 0.2s ease;
          text-decoration: none;
          display: block;
        }
        .news-item:hover {
          background: rgba(255,255,255,0.08);
        }

        /* TABLET */
        @media (max-width: 1024px) {
          .hero-glass { width: 300px !important; height: 360px !important; }
        }
        /* MOBILE */
        @media (max-width: 768px) {
          .hero-section  { height: 90vh !important; height: 90svh !important; min-height: 460px !important; }
          .hero-layout   { align-items: flex-end !important; padding: 0 20px 36px !important; }
          .hero-glass    { display: none !important; }
          .hero-heading  { font-size: 28px !important; }
          .hero-subtitle { font-size: 14px !important; }
          .hero-buttons  { flex-direction: column !important; gap: 10px !important; }
          .hero-btn      { width: 100% !important; text-align: center !important; display: block !important; padding: 12px 20px !important; }
          .carousel-dots { display: none !important; }
          .carousel-arrow { display: none !important; }
        }
      `}</style>

      {/* BACKGROUND LAYER — VIDEOS */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src={heroSlides[0].src} type="video/mp4" />
        </video>
      </div>

      {/* DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)",
        }}
      />



      {/* MAIN LAYOUT OVERLAY */}
      <div
        className="hero-layout"
        style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 44px",
          gap: "32px",
        }}
      >

        {/* ── LEFT: existing content ── */}
        <div style={{ maxWidth: "540px" }}>

          {/* YELLOW ACCENT LINE */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            style={{ width: "48px", height: "3px", background: "#FFE619", marginBottom: "20px" }}
          />

          {/* ACCREDITATION LABEL */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            style={{ margin: "0 0 16px", fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif", textTransform: "uppercase", fontWeight: 400 }}
          >
            NAAC A++ · NBA Tier-1 · UGC Autonomous
          </motion.p>

          {/* MAIN HEADING */}
          <motion.h2
            className="hero-heading"
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            style={{ margin: "0 0 18px", fontFamily: "'Rajdhani', sans-serif", fontSize: "46px", fontWeight: 700, color: "#ffffff", lineHeight: 1.05 }}
          >
            Ignite Your Potential,<br />Engineer Your Future
          </motion.h2>

          {/* SUBTITLE */}
          <motion.p
            className="hero-subtitle"
            variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
            style={{ margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif", fontSize: "18px", fontWeight: 300, color: "rgba(255,255,255,0.8)", maxWidth: "480px", lineHeight: 1.65 }}
          >
            KSRM College of Engineering, Kadapa — 45 years of engineering excellence.
          </motion.p>

          {/* ROTATING CAPTION */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.35}
            style={{ height: "58px", overflow: "hidden" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "2px", color: "#FFE619", textTransform: "uppercase", marginBottom: "7px", fontFamily: "sans-serif" }}>
                  {captions[activeIndex].label}
                </div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "26px", fontWeight: 600, color: "#ffffff" }}>
                  {captions[activeIndex].text}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>


          {/* BUTTONS */}
          <motion.div
            className="hero-buttons"
            variants={fadeUp} initial="hidden" animate="visible" custom={0.4}
            style={{ display: "flex", gap: "14px", alignItems: "center" }}
          >
            <Link href="/admissions" className="hero-btn touch-target btn btn-primary">
              Apply Now
            </Link>
            <Link href="/about" className="hero-btn touch-target btn btn-secondary">
              Explore Campus
            </Link>
          </motion.div>
        </div>

        {/* ── RIGHT: GLASS NEWS PANEL ── */}
        <motion.div
          className="hero-glass"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
          style={{
            width: "380px",
            height: "430px",
            flexShrink: 0,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          }}
        >
          {/* PANEL HEADER */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div className="pulse-dot" />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
              Latest Updates
            </span>
          </div>

          {/* NEWS SCROLL VIEWPORT */}
          <div style={{ height: "375px", overflow: "hidden" }}>
            <div className="news-track">
              {/* Doubled for seamless loop */}
              {(Array.isArray(newsItems) ? [...newsItems, ...newsItems] : []).map((item, i) => (
                <Link key={i} href="/news" className="news-item">
                  {/* META ROW */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                    {item.isNew && (
                      <span style={{
                        background: "#FFE619", color: "#1a1a2e",
                        fontSize: "8px", fontWeight: 700,
                        padding: "1px 6px", borderRadius: "3px",
                        letterSpacing: "0.5px",
                        flexShrink: 0,
                      }}>
                        NEW
                      </span>
                    )}
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{item.date}</span>
                  </div>
                  {/* TEXT */}
                  <div style={{ fontSize: "15px", color: "#ffffff", lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
