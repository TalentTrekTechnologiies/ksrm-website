"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { grievance } from "@/data/campusLife/grievance"
import { AlertCircle, Phone, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function GrievanceTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .grv-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .grv-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .grv-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .grv-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .grv-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .grv-breadcrumb span {
          color: #FFE619;
        }
        .grv-policy {
          background: #2B3490;
          color: #fff;
          padding: 28px;
          border-left: 4px solid #FFE619;
          border-radius: 8px;
          margin-top: 40px;
          font-size: 15px;
          line-height: 1.8;
        }
        .grv-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .grv-type-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .grv-type-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .grv-type-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .grv-type-card p {
          font-size: 13px;
          color: #555;
          margin: 0;
          line-height: 1.6;
        }
        .grv-process {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }
        .grv-process-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .grv-step-num {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: #FFE619;
          color: #2B3490;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
        }
        .grv-step-content h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px;
        }
        .grv-step-content p {
          font-size: 13px;
          color: #555;
          margin: 0;
          line-height: 1.6;
        }
        .grv-timeline-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .grv-timeline-item {
          background: #f4f3ef;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border-top: 3px solid #2B3490;
        }
        .grv-timeline-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px;
        }
        .grv-timeline-item p {
          font-size: 20px;
          font-weight: 700;
          color: #2B3490;
          margin: 0;
          font-family: "Rajdhani", sans-serif;
        }
        .grv-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .grv-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .grv-contact-item p {
          font-size: 14px;
          margin: 8px 0 0;
        }
        .grv-contact-item a {
          color: #FFE619;
          text-decoration: none;
        }
        @media (max-width: 900px) {
          .grv-contact-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="grv-hero"
        style={{
          backgroundImage: `url('/images/campus/06.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="grv-eyebrow" style={{ marginBottom: 16 }}>
                Campus Life
              </motion.div>
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
                {grievance.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 300,
                  maxWidth: 700,
                }}
              >
                {grievance.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="grv-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{grievance.pageTitle}</span>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* INTRO */}
      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            style={{ maxWidth: 820 }}
          >
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              {grievance.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* POLICY */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="grv-policy"
          >
            <AlertCircle size={24} style={{ display: "inline", marginRight: 12 }} />
            {grievance.policyStatement}
          </motion.div>
        </Container>
      </section>

      {/* GRIEVANCE TYPES */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 40px",
              }}
            >
              Types of Grievances Addressed
            </motion.h2>

            <div className="grv-type-grid">
              {grievance.grievanceTypes.map((type, idx) => (
                <motion.div key={idx} variants={fadeUp} className="grv-type-card">
                  <h3>{type.type}</h3>
                  <p>{type.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* PROCESS */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 40px",
              }}
            >
              Grievance Resolution Process
            </motion.h2>

            <div className="grv-process">
              {grievance.process.map((step, idx) => (
                <motion.div key={idx} variants={fadeUp} className="grv-process-step">
                  <div className="grv-step-num">{idx + 1}</div>
                  <div className="grv-step-content">
                    <h4>{step.step}</h4>
                    <p>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* TIMELINES */}
            <motion.div variants={stagger} className="grv-timeline-bar">
              <motion.div variants={fadeUp} className="grv-timeline-item">
                <h4>Acknowledgement</h4>
                <p>{grievance.timelines.acknowledgement}</p>
              </motion.div>
              <motion.div variants={fadeUp} className="grv-timeline-item">
                <h4>Resolution</h4>
                <p>{grievance.timelines.resolution}</p>
              </motion.div>
              <motion.div variants={fadeUp} className="grv-timeline-item">
                <h4>Appeal</h4>
                <p>{grievance.timelines.appeal}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="grv-contact-card"
          >
            <div className="grv-contact-item">
              <h4>{grievance.contact.officer}</h4>
              <p>Available for grievance filing and consultation</p>
            </div>
            <div className="grv-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${grievance.contact.phone}`}>{grievance.contact.phone}</a>
              </p>
            </div>
            <div className="grv-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${grievance.contact.email}`}>{grievance.contact.email}</a>
              </p>
            </div>
            <div className="grv-contact-item">
              <h4>Office Hours</h4>
              <p>{grievance.contact.officeHours}</p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}

