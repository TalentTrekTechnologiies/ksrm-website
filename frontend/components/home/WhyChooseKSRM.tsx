"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

interface Highlight {
  title: string
  desc: string
  icon: ReactNode
}

const HIGHLIGHTS: Highlight[] = [
  {
    title: "UGC Autonomous",
    desc: "Affiliated to JNTUA with academic autonomy and a modern, industry-aligned curriculum.",
    icon: (<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>),
  },
  {
    title: "NAAC A++ Accredited",
    desc: "Among the region's top-graded institutions, with NBA Tier-1 accredited programs.",
    icon: (<><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>),
  },
  {
    title: "90% Placement Rate",
    desc: "200+ recruiting companies and a dedicated Training & Placement cell backing every student.",
    icon: (<><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></>),
  },
  {
    title: "45+ Years of Legacy",
    desc: "Over four decades of engineering excellence and 15,000+ alumni across the globe.",
    icon: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  },
  {
    title: "Modern Infrastructure",
    desc: "State-of-the-art laboratories, a central library, seminar halls and a 25-acre green campus.",
    icon: (<><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></>),
  },
  {
    title: "Research & Innovation",
    desc: "Active R&D, funded projects, patents and a thriving innovation and entrepreneurship cell.",
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
    <section style={{ width: "100%", background: "#f7f8fa", padding: "64px 0", borderTop: "1px solid #eef0f3" }}>
      <style>{`
        .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
        .why-card {
          background: #fff; border: 1px solid #eef0f3; border-radius: 14px;
          padding: 26px 24px; transition: all 0.3s ease; height: 100%; box-sizing: border-box;
        }
        .why-card:hover { transform: translateY(-5px); box-shadow: 0 16px 36px rgba(43,52,144,0.10); border-color: #D4A500; }
        .why-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%);
          display: flex; align-items: center; justify-content: center; color: #FFE619; margin-bottom: 16px;
        }
        @media (max-width: 900px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .why-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" }}>
            Why KSRM
          </div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "34px", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}>
            Why Choose KSRM College of Engineering
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
              <div className="why-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {h.icon}
                </svg>
              </div>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "19px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                {h.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.65, margin: 0 }}>{h.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
