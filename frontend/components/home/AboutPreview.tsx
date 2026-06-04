"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

const years = new Date().getFullYear() - 1980

const legacyStats = [
  { num: "1980", label: "Established"  },
  { num: "7+",   label: "Departments"  },
  { num: "UGC",  label: "Autonomous"   },
]

export default function AboutPreview() {
  return (
    <section className="about-section" style={{ width: "100%", background: "#ffffff", padding: "52px 0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=DM+Sans:opsz,wght@9..40,400&display=swap');

        .about-section { box-sizing: border-box; }

        .about-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        .about-heading { font-size: 36px; }

        @media (max-width: 1024px) {
          .about-section { padding: 40px 0 !important; }
          .about-grid    { gap: 36px !important; }
        }
        @media (max-width: 768px) {
          .about-section { padding: 36px 0 !important; }
          .about-grid    { grid-template-columns: 1fr !important; gap: 28px !important; }
          .about-heading { font-size: 26px !important; }
          .about-img-col { order: -1; }
        }
        @media (max-width: 480px) {
          .about-section { padding: 28px 0 !important; }
          .about-heading { font-size: 22px !important; }
        }
      `}</style>

      <Container>
      <div className="about-grid">

        {/* LEFT — story */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          {/* EYEBROW */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "2px", background: "#FFE619", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" as const }}>
              OUR LEGACY
            </span>
          </div>

          {/* HEADING */}
          <h2 className="about-heading" style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700, lineHeight: 1.1,
            margin: "0 0 24px",
          }}>
            <span style={{ color: "#1a1a2e" }}>Four Decades of </span>
            <span style={{ color: "#2B3490" }}>Engineering Excellence</span>
          </h2>

          {/* PARAGRAPHS */}
          <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, margin: "0 0 16px" }}>
            Established in 1980 in memory of Late Sri Srinivasa Reddy, KSRM College of Engineering was born
            from the vision of Late Sri Kandula Obul Reddy to bring quality technical education to the
            Rayalaseema region of Andhra Pradesh.
          </p>
          <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.7, margin: "0 0 28px" }}>
            Today, as a UGC Autonomous institution affiliated to JNTUA, we continue that legacy — shaping
            engineers, innovators, and leaders who carry our values into the world.
          </p>

          {/* LEGACY STATS */}
          <div style={{ display: "flex", gap: "28px", marginBottom: "32px" }}>
            {legacyStats.map((s) => (
              <div key={s.label}>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "30px", fontWeight: 700,
                  color: "#2B3490", lineHeight: 1,
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA BUTTON */}
          <Link href="/about" style={{
            display: "inline-block",
            padding: "12px 26px",
            background: "#2B3490",
            color: "#ffffff",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "15px", fontWeight: 600,
            borderRadius: "6px",
            textDecoration: "none",
            transition: "background 0.2s ease",
          }}>
            Read Our Story →
          </Link>
        </motion.div>

        {/* RIGHT — image + badge */}
        <motion.div
          className="about-img-col"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
          style={{ position: "relative" }}
        >
          <div style={{ position: "relative" }}>
            <img
              src="/campus.webp"
              alt="KSRM Campus"
              style={{
                width: "100%", height: "340px",
                objectFit: "cover",
                borderRadius: "12px",
                display: "block",
              }}
            />

            {/* FLOATING BADGE */}
            <div style={{
              position: "absolute",
              bottom: "20px", left: "20px",
              background: "#FFE619",
              color: "#1a1a2e",
              padding: "18px 24px",
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(43,52,144,0.2)",
            }}>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "32px", fontWeight: 700, lineHeight: 1,
              }}>
                {years}+
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, marginTop: "5px", letterSpacing: "0.5px" }}>
                YEARS OF TRUST
              </div>
            </div>
          </div>

          {/* IMAGE CAPTION */}
          <p style={{
            marginTop: "12px",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 600,
            color: "#2B3490",
            letterSpacing: "0.4px",
          }}>
            Smt. K. Rajeswari Garu
          </p>
        </motion.div>

      </div>
      </Container>
    </section>
  )
}
