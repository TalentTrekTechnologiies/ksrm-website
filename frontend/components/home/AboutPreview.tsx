"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { getSectionPublic, AboutContent } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

async function fetchAbout(): Promise<AboutContent | null> {
  const section = await getSectionPublic("about")
  return section?.content ?? null
}

const EASE = [0.22, 1, 0.36, 1] as const

const FALLBACK_ABOUT: AboutContent = {
  eyebrow: "OUR LEGACY",
  title: "Four Decades of Engineering Excellence",
  subtitle: null,
  paragraphs: [
    "Established in 1980 in memory of Late Sri Srinivasa Reddy, KSRM College of Engineering was born from the vision of Late Sri Kandula Obul Reddy to bring quality technical education to the Rayalaseema region of Andhra Pradesh.",
    "Today, as a UGC Autonomous institution affiliated to JNTUA, we continue that legacy — shaping engineers, innovators, and leaders who carry our values into the world.",
  ],
  highlights: [],
  statistics: [
    { num: "1980", label: "Established" },
    { num: "7+", label: "Departments" },
    { num: "UGC", label: "Autonomous" },
  ],
  foundingYear: 1980,
  image: { url: "/topview (1).jpg", alt: "KSRM Campus", caption: "Aerial View of KSRM College Campus" },
  badgeLabel: "YEARS OF TRUST",
  cta: { text: "Read Our Story →", href: "/about" },
}

export default function AboutPreview({ previewData }: { previewData?: AboutContent }) {
  const liveAbout = useLiveData(fetchAbout, [], { skip: !!previewData })
  const about = previewData ?? liveAbout ?? FALLBACK_ABOUT

  const years = new Date().getFullYear() - about.foundingYear

  return (
    <section className="about-section" style={{ width: "100%", background: "#ffffff", padding: "38px 0" }}>
      <style>{`
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
          {about.eyebrow && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "2px", background: "#FFE619", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" as const }}>
                {about.eyebrow}
              </span>
            </div>
          )}

          {/* HEADING */}
          <h2 className="about-heading" style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700, lineHeight: 1.1,
            color: "#1a1a2e",
            margin: about.subtitle ? "0 0 8px" : "0 0 24px",
          }}>
            {about.title}
          </h2>
          {about.subtitle && (
            <p style={{ color: "#2B3490", fontSize: "18px", fontWeight: 600, margin: "0 0 20px" }}>
              {about.subtitle}
            </p>
          )}

          {/* PARAGRAPHS */}
          {about.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              style={{
                color: "#555",
                fontSize: "17px",
                lineHeight: 1.7,
                margin: i === about.paragraphs.length - 1 ? "0 0 28px" : "0 0 16px",
              }}
            >
              {paragraph}
            </p>
          ))}

          {/* HIGHLIGHTS */}
          {about.highlights && about.highlights.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {about.highlights.map((h, i) => (
                <div key={i}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>{h.title}</p>
                  {h.description && (
                    <p style={{ margin: 0, fontSize: "15px", color: "#777" }}>{h.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* LEGACY STATS */}
          <div style={{ display: "flex", gap: "28px", marginBottom: "32px" }}>
            {about.statistics.map((s) => (
              <div key={s.label}>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "30px", fontWeight: 700,
                  color: "#2B3490", lineHeight: 1,
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: "14px", color: "#888", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA BUTTON */}
          <Link href={about.cta.href} style={{
            display: "inline-block",
            padding: "12px 26px",
            background: "#2B3490",
            color: "#ffffff",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "17px", fontWeight: 600,
            borderRadius: "6px",
            textDecoration: "none",
            transition: "background 0.2s ease",
          }}>
            {about.cta.text}
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
              src={about.image.url}
              alt={about.image.alt}
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
                {about.badgeLabel ?? "YEARS OF TRUST"}
              </div>
            </div>
          </div>

          {/* IMAGE CAPTION */}
          {about.image.caption && (
            <p style={{
              marginTop: "12px",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: 600,
              color: "#2B3490",
              letterSpacing: "0.4px",
            }}>
              {about.image.caption}
            </p>
          )}
        </motion.div>

      </div>
      </Container>
    </section>
  )
}
