"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

interface Highlight {
  title: string
  desc: string
  image: string
  icon: ReactNode
}

// Image-backed feature cards - each pairs a real campus photo with the point
// it illustrates, so the section reads as a full, visual block rather than
// flat icon tiles.
const HIGHLIGHTS: Highlight[] = [
  {
    title: "UGC Autonomous",
    desc: "Affiliated to JNTUA with academic autonomy and a modern, industry-aligned curriculum.",
    image: "/campus/main-building.webp",
    icon: (<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>),
  },
  {
    title: "NAAC A+ Accredited",
    desc: "Among the region's top-graded institutions, with NBA Tier-1 accredited programs.",
    image: "/campus/aerial-campus.webp",
    icon: (<><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>),
  },
  {
    title: "1200+ Students Placed",
    desc: "200+ recruiting companies and a dedicated Training & Placement cell backing every student.",
    image: "/campus/seminar-hall.webp",
    icon: (<><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></>),
  },
  {
    title: "45+ Years of Legacy",
    desc: "Over four decades of engineering excellence and 15,000+ alumni across the globe.",
    image: "/campus/founders-day.webp",
    icon: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  },
  {
    title: "Modern Infrastructure",
    desc: "State-of-the-art laboratories, a central library, seminar halls and a 35-acre green campus.",
    image: "/campus/central-library.webp",
    icon: (<><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></>),
  },
  {
    title: "Research & Innovation",
    desc: "Active R&D, funded projects, patents and a thriving innovation and entrepreneurship cell.",
    image: "/campus/robotics-lab.webp",
    icon: (<><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15 2a7 7 0 0 0-4 12.7V17h2v-2.3A7 7 0 0 0 15 2Z" /></>),
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

export default function WhyChooseKSRM() {
  return (
    <section style={{ width: "100%", background: "#0e1533", padding: "56px 0", borderTop: "1px solid #eef0f3" }}>
      <style>{`
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 40px; }
        .why-card {
          position: relative; height: 300px; border-radius: 16px; overflow: hidden;
          display: flex; flex-direction: column; justify-content: flex-end;
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        .why-card-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .why-card:hover .why-card-img { transform: scale(1.07); }
        .why-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(14,21,51,0.15) 0%, rgba(14,21,51,0.55) 45%, rgba(14,21,51,0.92) 100%);
        }
        .why-card-body { position: relative; padding: 24px; }
        .why-icon {
          width: 46px; height: 46px; border-radius: 12px;
          background: #FFE619; color: #1a1d4d;
          display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
        }
        @media (max-width: 900px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .why-grid { grid-template-columns: 1fr; } .why-card { height: 260px; } }
      `}</style>

      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "2px", color: "#FFE619", textTransform: "uppercase" }}>
            Why K.S.R.M.
          </div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(20px, 5.4vw, 34px)", fontWeight: 700, color: "#ffffff", margin: "8px 0 0" }}>
            Why Choose K.S.R.M. College of Engineering
          </h2>
        </div>

        <motion.div
          className="why-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {HIGHLIGHTS.map((h) => (
            <motion.div key={h.title} className="why-card" variants={cardVariants}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static campus asset */}
              <img className="why-card-img" src={h.image} alt={h.title} loading="lazy" />
              <div className="why-card-overlay" />
              <div className="why-card-body">
                <div className="why-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {h.icon}
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "21px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
                  {h.title}
                </h3>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
