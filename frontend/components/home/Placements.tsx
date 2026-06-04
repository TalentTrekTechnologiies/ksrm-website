"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

interface Stat {
  prefix: string
  value: number
  suffix: string
  label: string
}

const stats: Stat[] = [
  { prefix: "",  value: 95,   suffix: "%",    label: "Placement Rate"  },
  { prefix: "₹", value: 12,   suffix: " LPA", label: "Highest Package" },
  { prefix: "",  value: 200,  suffix: "+",    label: "Recruiters"      },
  { prefix: "",  value: 1500, suffix: "+",    label: "Offers (2025)"   },
]

const recruiters = [
  "TCS", "Infosys", "Wipro", "Cognizant",
  "Accenture", "Capgemini", "Tech Mahindra",
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

export default function Placements() {
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0))
  const sectionRef = useRef<HTMLElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return
        hasStarted.current = true
        observer.disconnect()

        const startTime = performance.now()
        const duration = 2000

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeOut(progress)
          setCounts(stats.map((s) => Math.floor(s.value * eased)))
          if (progress < 1) requestAnimationFrame(tick)
          else setCounts(stats.map((s) => s.value))
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="placements-section"
      style={{
        width: "100%",
        background: "#ffffff",
        borderTop: "1px solid #f1f5f9",
        padding: "56px 0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

        .placements-section { box-sizing: border-box; }

        .placements-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .p-stat-value {
          font-family: 'Rajdhani', sans-serif;
          font-size: 42px;
          font-weight: 700;
          color: #2B3490;
          line-height: 1;
        }

        .p-stat-label {
          font-size: 13px;
          color: #6B7280;
          margin-top: 6px;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .recruiter-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: marquee-scroll 18s linear infinite;
        }

        .recruiter-marquee:hover .recruiter-track {
          animation-play-state: paused;
        }

        .placements-heading { font-size: 34px; }

        @media (max-width: 768px) {
          .placements-section  { padding: 36px 0 !important; }
          .placements-stats    { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .p-stat-value        { font-size: 32px !important; }
          .placements-heading  { font-size: 26px !important; }
        }
        @media (max-width: 480px) {
          .placements-section { padding: 28px 0 !important; }
          .p-stat-value       { font-size: 26px !important; }
          .placements-heading { font-size: 22px !important; }
        }
      `}</style>

      <Container>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" as const }}
          >
            TRAINING & PLACEMENTS
          </motion.div>
          <motion.h2
            className="placements-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}
          >
            Where Talent Meets Opportunity
          </motion.h2>
        </div>

        {/* STATS ROW */}
        <motion.div
          className="placements-stats"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={itemVariants} style={{ textAlign: "center" }}>
              <div className="p-stat-value">
                {stat.prefix}{counts[i]}{stat.suffix}
              </div>
              <div className="p-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* RECRUITER MARQUEE */}
        <div>
          <div style={{
            textAlign: "center",
            fontSize: "12px", letterSpacing: "1px",
            color: "#888",
            textTransform: "uppercase" as const,
            marginBottom: "18px",
          }}>
            OUR TOP RECRUITERS
          </div>

          <div className="recruiter-marquee" style={{ overflow: "hidden" }}>
            <div className="recruiter-track">
              {/* Doubled for seamless infinite loop — translateX(-50%) moves exactly one full set */}
              {[...recruiters, ...recruiters].map((name, i) => (
                <div key={i} style={{
                  background: "#eef1ff",
                  borderRadius: "10px",
                  padding: "16px 28px",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "18px", fontWeight: 700,
                  color: "#2B3490",
                  minWidth: "130px",
                  textAlign: "center",
                  whiteSpace: "nowrap" as const,
                  flexShrink: 0,
                }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </Container>
    </section>
  )
}
