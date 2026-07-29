"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function AccreditationTemplate() {
  const nbaPrograms = [
    "Computer Science & Engineering (B.Tech) - Valid until 2026",
    "Electronics & Communication Engineering (B.Tech) - Valid until 2025",
    "Electrical & Electronics Engineering (B.Tech) - Valid until 2026",
    "Civil Engineering (B.Tech) - Valid until 2025",
    "Mechanical Engineering (B.Tech) - Valid until 2026",
  ]

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .acc-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .acc-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .acc-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .acc-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: color 0.2s;
        }
        .acc-breadcrumb a:hover {
          color: #fff;
        }
        .acc-section-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          margin: 32px 0;
        }
        .acc-section-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 16px;
        }
        .acc-programs-list {
          list-style: none;
          padding: 0;
          margin: 16px 0;
        }
        .acc-programs-list li {
          padding: 12px 0;
          color: #666;
          border-bottom: 1px solid #eef0f3;
          display: flex;
          align-items: center;
        }
        .acc-programs-list li:before {
          content: "✓";
          display: inline-block;
          color: #FFE619;
          font-weight: 700;
          margin-right: 12px;
          font-size: 19px;
        }
        .acc-programs-list li:last-child {
          border-bottom: none;
        }
        @media (max-width: 768px) {
          .acc-section-card { padding: 20px; }
        }
      `}</style>

      {/* HERO */}
      <section className="acc-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="acc-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>Accreditations</span>
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
                Accreditations & Rankings
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 400,
                  maxWidth: 600,
                }}
              >
                Recognition of Excellence
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* NBA ACCREDITATION */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 24px",
              }}
            >
              NBA Accreditation
            </motion.h2>
            <motion.div variants={fadeUp} className="acc-section-card">
              <h3>Accredited Programs</h3>
              <p style={{ color: "#666" }}>All B.Tech engineering programs are accredited by the National Board of Accreditation (NBA), recognizing excellence in engineering education.</p>
              <ul className="acc-programs-list">
                {nbaPrograms.map((program, idx) => (
                  <li key={idx}>{program}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* NAAC ACCREDITATION */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 24px",
              }}
            >
              NAAC A+ Accreditation
            </motion.h2>
            <motion.div variants={fadeUp} className="acc-section-card">
              <h3>Highest Grade Recognition</h3>
              <p style={{ color: "#666", marginBottom: 16 }}>
                K.S.R.M. College has been accredited with A+ grade by the National Assessment and Accreditation Council (NAAC), the highest rating in the framework. This recognition reflects our commitment to academic excellence, research, infrastructure development, and institutional governance.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <p style={{ color: "#2B3490", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Accreditation Grade</p>
                  <p style={{ color: "#666", fontSize: 13, margin: 0 }}>A+ (Highest)</p>
                </div>
                <div>
                  <p style={{ color: "#2B3490", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Valid Until</p>
                  <p style={{ color: "#666", fontSize: 13, margin: 0 }}>2027</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* NIRF RANKING */}
      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 24px",
              }}
            >
              NIRF Rankings
            </motion.h2>
            <motion.div variants={fadeUp} className="acc-section-card">
              <h3>National Institutional Ranking Framework</h3>
              <p style={{ color: "#666", marginBottom: 20 }}>
                K.S.R.M. College is consistently ranked in the NIRF by the Ministry of Education, demonstrating our commitment to academic excellence and institutional development.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { category: "Engineering", ranking: "Top 200", year: "2024" },
                  { category: "Overall", ranking: "Top 500", year: "2024" },
                  { category: "Innovation", ranking: "Top 300", year: "2024" },
                ].map((rank, idx) => (
                  <div key={idx} style={{ background: "#ffffff", padding: 16, borderRadius: 8, textAlign: "center" }}>
                    <p style={{ color: "#2B3490", fontWeight: 600, fontSize: 13, margin: "0 0 8px" }}>{rank.category}</p>
                    <p style={{ color: "#FFE619", fontWeight: 700, fontSize: 20, margin: "0 0 4px" }}>{rank.ranking}</p>
                    <p style={{ color: "#999", fontSize: 12, margin: 0 }}>{rank.year}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* AFFILIATIONS */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 24px",
              }}
            >
              Affiliations & Recognition
            </motion.h2>
            <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                {
                  title: "JNTUA Affiliation",
                  desc: "Affiliated to Jawaharlal Nehru Technological University Anantapur, enabling collaboration while maintaining academic autonomy.",
                },
                {
                  title: "UGC Autonomous Status",
                  desc: "Granted autonomous status by University Grants Commission in 2016, recognizing institutional excellence and academic autonomy.",
                },
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeUp} className="acc-section-card">
                  <h3>{item.title}</h3>
                  <p style={{ color: "#666" }}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>
              Quality Assurance & Excellence
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "0 0 24px", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
              Our accreditations and rankings reflect our commitment to providing world-class engineering education
            </p>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
