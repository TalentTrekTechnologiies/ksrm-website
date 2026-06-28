"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"
import Container from "@/components/ui/Container"
import { Target, Eye, GraduationCap, FlaskConical, Users } from "lucide-react"
import { getImagesByCategory } from "@/data/gallery-images"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const missions = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    text: "High quality education with an enriched curriculum, blended with impactful teaching-learning practices.",
  },
  {
    icon: FlaskConical,
    title: "Research & Innovation",
    text: "Promoting research, entrepreneurship and innovation through strong industry collaborations.",
  },
  {
    icon: Users,
    title: "Professional Leaders",
    text: "Producing highly competent professional leaders contributing to the socio-economic development of the region and the nation.",
  },
]

const milestones = [
  { year: "1979", text: "Technical Training Institute founded at Vempalli under Sri Kandula Obul Reddy Charities." },
  { year: "1980", text: "KSRM College of Engineering established in memory of Sri Kandula Srinivasa Reddy. Inaugurated 14 Nov 1980 by the Chief Minister of Andhra Pradesh." },
  { year: "1980-81", text: "First academic year began with 160 students across Civil, EEE, ECE and Mechanical Engineering." },
  { year: "Today", text: "A UGC Autonomous institution affiliated to JNTUA, with NAAC A++ and NBA Tier-1 accreditation, serving over 10,000 students." },
]

export default function AboutPage() {
  const [year, setYear] = useState(46)
  useEffect(() => {
    setYear(new Date().getFullYear() - 1980)
  }, [])

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .about-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .about-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .about-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #2B3490;
        }
        .about-eyebrow::before { content: ""; width: 28px; height: 2px; background: #FFE619; }
        .about-eyebrow.light { color: #FFE619; }
        .about-eyebrow.light::before { background: #FFE619; }

        @media (max-width: 900px) {
          .about-story-grid { grid-template-columns: 1fr !important; }
          .about-mission-grid { grid-template-columns: 1fr !important; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="about-hero">
        <Container>
          <div style={{ padding: "84px 0 72px", position: "relative", zIndex: 1, maxWidth: 760 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="about-eyebrow light" style={{ marginBottom: 18 }}>
                About KSRM
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0,
                }}
              >
                Four Decades of Engineering Excellence in Rayalaseema
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)", fontSize: 17, lineHeight: 1.7,
                  margin: "20px 0 0", maxWidth: 620, fontWeight: 300,
                }}
              >
                Born from one family's vision to bring technical education to the region,
                KSRM College of Engineering has grown into a UGC Autonomous institution
                shaping engineers, innovators and leaders since 1980.
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* FOUNDING STORY */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 1fr",
              gap: 56, alignItems: "center",
            }}
            className="about-story-grid"
          >
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            >
              <motion.div variants={fadeUp} className="about-eyebrow" style={{ marginBottom: 16 }}>
                Our Legacy
              </motion.div>
              <motion.h2
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                  fontWeight: 700, color: "#1a1a2e", lineHeight: 1.15, margin: "0 0 20px",
                }}
              >
                A Memorial Built on a Dream
              </motion.h2>
              <motion.p variants={fadeUp} style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: "0 0 16px" }}>
                The college owes its existence to the keen interest of Late Sri Kandula Obul Reddy,
                who dreamed of developing technical education in the Rayalaseema region of Andhra Pradesh.
                In 1979, a Technical Training Institute was started at Vempalli, Kadapa District, under
                the aegis of Sri Kandula Obul Reddy Charities.
              </motion.p>
              <motion.p variants={fadeUp} style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: "0 0 16px" }}>
                That same year, his youngest son — Sri Kandula Srinivasa Reddy, a brilliant third-year
                Mechanical Engineering student at Delhi College of Engineering — met with an untimely death.
                In 1980, the college was established to perpetuate his memory, giving the institution its name:
                Kandula Srinivasa Reddy Memorial College of Engineering.
              </motion.p>
              <motion.p variants={fadeUp} style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0 }}>
                Formally inaugurated on 14 November 1980 by the Chief Minister of Andhra Pradesh, the college
                began with 160 students across four core branches. Today it stands among the region's most
                respected engineering institutions.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  width: "100%", height: 360, borderRadius: 16, overflow: "hidden",
                  background: "linear-gradient(135deg, #2B3490, #1e2570)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(43,52,144,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <Image
                  src="/gallery/campus/block.jpg"
                  alt="Main administrative block of KSRM College"
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  position: "absolute", bottom: -22, left: -22,
                  background: "#FFE619", color: "#1a1a2e",
                  padding: "18px 26px", borderRadius: 12,
                  boxShadow: "0 12px 32px rgba(43,52,144,0.22)",
                }}
              >
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 34, fontWeight: 700, lineHeight: 1 }}>
                  {year}+
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, letterSpacing: 0.5 }}>
                  YEARS OF TRUST
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* OUR CAMPUS GALLERY */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <motion.div variants={fadeUp} className="about-eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>
              Campus Infrastructure
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 700, color: "#1a1a2e", lineHeight: 1.15, margin: 0,
              }}
            >
              Explore Our World-Class Campus
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            <motion.div
              variants={fadeUp}
              style={{
                position: "relative",
                height: 280,
                borderRadius: 16,
                overflow: "hidden",
                background: "#f0f0f0",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(43,52,144,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <Image
                src="/gallery/campus/topview.jpg"
                alt="Aerial view of KSRM College campus"
                fill
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 20,
                }}
              >
                <p style={{ color: "white", margin: 0, fontSize: 16, fontWeight: 600 }}>Aerial Campus View</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                position: "relative",
                height: 280,
                borderRadius: 16,
                overflow: "hidden",
                background: "#f0f0f0",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(43,52,144,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <Image
                src="/gallery/campus/19.jpg"
                alt="Solar powered campus facilities"
                fill
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 20,
                }}
              >
                <p style={{ color: "white", margin: 0, fontSize: 16, fontWeight: 600 }}>Sustainable Solar Infrastructure</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              style={{
                position: "relative",
                height: 280,
                borderRadius: 16,
                overflow: "hidden",
                background: "#f0f0f0",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(43,52,144,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <Image
                src="/gallery/campus/blocktop.jpg"
                alt="Main block aerial view"
                fill
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 20,
                }}
              >
                <p style={{ color: "white", margin: 0, fontSize: 16, fontWeight: 600 }}>Main Academic Block</p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* VISION + MISSION */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          {/* Vision */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
            style={{ maxWidth: 820, margin: "0 auto 56px", textAlign: "center" }}
          >
            <motion.div variants={fadeUp} className="about-eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>
              <Eye size={15} /> Our Vision
            </motion.div>
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.3rem, 2.4vw, 1.9rem)",
                fontWeight: 600, color: "#2B3490", lineHeight: 1.4, margin: 0,
              }}
            >
              "To evolve as a centre of repute, providing quality academic programs amalgamated with
              creative learning and research excellence — producing graduates with leadership qualities,
              ethical and human values to serve the nation."
            </motion.p>
          </motion.div>

          {/* Mission cards */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="about-eyebrow" style={{ justifyContent: "center", marginBottom: 8 }}>
              <Target size={15} /> Our Mission
            </div>
          </div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}
            className="about-mission-grid"
          >
            {missions.map((m) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.title} variants={fadeUp}
                  style={{
                    background: "#fff", border: "1px solid #eef0f3", borderRadius: 16,
                    padding: "32px 26px", textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 12, background: "#eef1ff",
                      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
                    }}
                  >
                    <Icon size={24} color="#2B3490" />
                  </div>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                    {m.title}
                  </h3>
                  <p style={{ color: "#666", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{m.text}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* MILESTONES */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="about-eyebrow" style={{ justifyContent: "center", marginBottom: 10 }}>
              Our Journey
            </div>
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
              Milestones Through the Years
            </h2>
          </div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}
            style={{ maxWidth: 820, margin: "0 auto" }}
          >
            {milestones.map((m, i) => (
              <motion.div
                key={m.year} variants={fadeUp}
                style={{ display: "flex", gap: 24, paddingBottom: i === milestones.length - 1 ? 0 : 28 }}
              >
                <div style={{ flexShrink: 0, width: 92, textAlign: "right" }}>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#2B3490" }}>
                    {m.year}
                  </span>
                </div>
                <div style={{ position: "relative", paddingLeft: 24 }}>
                  <span style={{ position: "absolute", left: 0, top: 6, width: 11, height: 11, borderRadius: "50%", background: "#FFE619", border: "2px solid #2B3490" }} />
                  {i !== milestones.length - 1 && (
                    <span style={{ position: "absolute", left: 5, top: 18, bottom: -28, width: 1, background: "#e0e3ea" }} />
                  )}
                  <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{m.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* STATS BAND */}
      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)" }}>
        <Container>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}
            className="about-stats-grid"
          >
            {[
              { n: `${year}+`, l: "Years of Excellence" },
              { n: "10K+", l: "Students" },
              { n: "7", l: "Departments" },
              { n: "200+", l: "Recruiters" },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#FFE619", lineHeight: 1 }}>
                  {s.n}
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 6, letterSpacing: 0.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  )
}
