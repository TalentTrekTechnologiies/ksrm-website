"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { degreeVerification } from "@/data/degreeVerification"
import { CheckCircle } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function DegreeVerificationTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .dv-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .dv-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .dv-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .dv-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .dv-about {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 40px;
          margin: 56px 0;
          max-width: 820px;
          margin-left: auto;
          margin-right: auto;
        }
        .dv-about p {
          color: #555;
          font-size: 15.5;
          line-height: 1.8;
          margin: 0;
          text-align: center;
        }
        .dv-cta-button {
          display: inline-block;
          background: #FFE619;
          color: #1a1a2e;
          padding: 20px 48px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          cursor: pointer;
          border: none;
          margin: 32px 0;
        }
        .dv-cta-button:hover {
          background: #2B3490;
          color: #FFE619;
          transform: translateY(-2px);
        }
        .dv-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin: 56px 0;
        }
        .dv-step-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 40px 28px;
          text-align: center;
          position: relative;
        }
        .dv-step-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 20px;
        }
        .dv-step-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .dv-step-card p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        .dv-arrow {
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 28px;
          color: #FFE619;
        }
        .dv-step-card:last-child .dv-arrow {
          display: none;
        }
        .dv-contact-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          margin: 56px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .dv-contact-card h2 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 20px;
        }
        .dv-contact-card p {
          color: #666;
          font-size: 14px;
          margin: 0 0 12px;
        }
        .dv-contact-card a {
          color: #2B3490;
          font-weight: 600;
          text-decoration: none;
          display: block;
          margin-bottom: 8px;
          transition: color 0.2s;
        }
        .dv-contact-card a:hover {
          color: #FFE619;
        }
        @media (max-width: 1024px) {
          .dv-steps-grid {
            grid-template-columns: 1fr;
          }
          .dv-step-card .dv-arrow {
            display: none;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="dv-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="dv-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{degreeVerification.pageTitle}</span>
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
                {degreeVerification.pageTitle}
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
                {degreeVerification.subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="dv-about">
            <p>{degreeVerification.about}</p>
          </motion.div>
        </Container>
      </section>

      {/* CTA */}
      <section style={{ padding: "0", background: "#ffffff", textAlign: "center" }}>
        <Container>
          <motion.a
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            href={degreeVerification.verificationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="dv-cta-button"
          >
            🔗 Verify Degree Online
          </motion.a>
        </Container>
      </section>

      {/* STEPS */}
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
                textAlign: "center",
              }}
            >
              How to Verify Your Degree
            </motion.h2>
            <motion.div variants={stagger} className="dv-steps-grid">
              {degreeVerification.steps.map((step, idx) => (
                <motion.div key={idx} variants={fadeUp} className="dv-step-card">
                  <div className="dv-step-number">{step.step}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {idx < degreeVerification.steps.length - 1 && <span className="dv-arrow">→</span>}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <motion.div variants={fadeUp} className="dv-contact-card">
              <h2>{degreeVerification.contact.office}</h2>
              <p>
                <strong>Phone:</strong>
              </p>
              <a href={`tel:${degreeVerification.contact.phone}`}>{degreeVerification.contact.phone}</a>
              <p style={{ marginTop: 12 }}>
                <strong>Email:</strong>
              </p>
              <a href={`mailto:${degreeVerification.contact.email}`}>{degreeVerification.contact.email}</a>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
