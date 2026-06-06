"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { antiRagging } from "@/data/campusLife/antiRagging"
import { AlertTriangle, Phone, Download } from "lucide-react"
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

export default function AntiRaggingTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .arr-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .arr-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .arr-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .arr-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .arr-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .arr-breadcrumb a:hover {
          opacity: 0.8;
        }
        .arr-breadcrumb span {
          color: #FFE619;
        }
        .arr-policy-box {
          background: #e74c3c;
          border: 2px solid #c0392b;
          border-radius: 8px;
          padding: 28px;
          color: #fff;
          margin-top: 40px;
          font-size: 15px;
          line-height: 1.8;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .arr-policy-icon {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .arr-helpline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .arr-helpline-card {
          background: #e74c3c;
          color: #fff;
          border-radius: 12px;
          padding: 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .arr-helpline-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(231, 76, 60, 0.3);
        }
        .arr-helpline-label {
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
        }
        .arr-helpline-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        .arr-section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .arr-section {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
        }
        .arr-section h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #2B3490;
        }
        .arr-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .arr-section li {
          color: #555;
          font-size: 13px;
          line-height: 1.6;
          padding-left: 20px;
          position: relative;
        }
        .arr-section li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #e74c3c;
          font-weight: bold;
          font-size: 16px;
        }
        .arr-committee-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 40px;
          font-size: 14px;
        }
        .arr-committee-table thead th {
          background: #2B3490;
          color: #fff;
          padding: 14px;
          text-align: left;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
        }
        .arr-committee-table tbody td {
          padding: 12px 14px;
          border-bottom: 1px solid #eef0f3;
          color: #555;
        }
        .arr-committee-table tbody tr:nth-child(odd) {
          background: #f4f3ef;
        }
        .arr-affidavit-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .arr-affidavit-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 12px;
          padding: 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .arr-affidavit-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }
        .arr-affidavit-card p {
          font-size: 13px;
          margin: 0;
          line-height: 1.6;
        }
        .arr-affidavit-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFE619;
          color: #2B3490;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
          margin: 0 auto;
        }
        .arr-affidavit-btn:hover {
          background: #ffd700;
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .arr-section-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="arr-hero"
        style={{
          backgroundImage: `url('/images/campus/02.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="arr-eyebrow" style={{ marginBottom: 16 }}>
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
                {antiRagging.pageTitle}
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
                {antiRagging.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="arr-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{antiRagging.pageTitle}</span>
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
              {antiRagging.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* POLICY STATEMENT */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="arr-policy-box"
          >
            <div className="arr-policy-icon">
              <AlertTriangle size={28} />
            </div>
            <div>{antiRagging.policyStatement}</div>
          </motion.div>
        </Container>
      </section>

      {/* HELPLINE NUMBERS */}
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
              Helpline Numbers
            </motion.h2>

            <div className="arr-helpline-grid">
              {antiRagging.helplineNumbers.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp} className="arr-helpline-card">
                  <Phone size={32} style={{ margin: "0 auto" }} />
                  <div className="arr-helpline-label">{item.label}</div>
                  <div className="arr-helpline-number">{item.number}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* WHAT & PUNISHMENTS */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <div className="arr-section-grid">
              <motion.div variants={fadeUp} className="arr-section">
                <h3>What Constitutes Ragging</h3>
                <ul>
                  {antiRagging.whatIsRagging.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="arr-section">
                <h3>Punishments</h3>
                <ul>
                  {antiRagging.punishments.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* COMMITTEE */}
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
              Anti-Ragging Committee Members
            </motion.h2>

            <motion.div variants={fadeUp} style={{ overflowX: "auto" }}>
              <table className="arr-committee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {antiRagging.committeeMembers.map((member, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{member.name}</td>
                      <td>{member.designation}</td>
                      <td style={{ color: "#2B3490", fontWeight: 700 }}>{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* HOW TO REPORT */}
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
              How to Report Ragging
            </motion.h2>

            <motion.div variants={fadeUp}>
              <ol style={{ listStyleType: "decimal", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {antiRagging.howToReport.map((item, idx) => (
                  <li key={idx} style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>
                    {item}
                  </li>
                ))}
              </ol>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* AFFIDAVITS */}
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
                margin: "0 0 24px",
              }}
            >
              Anti-Ragging Affidavits
            </motion.h2>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 15, color: "#555", lineHeight: 1.7, maxWidth: 820, marginBottom: 40 }}
            >
              {antiRagging.affidavit.description}
            </motion.p>

            <div className="arr-affidavit-cards">
              <motion.div variants={fadeUp} className="arr-affidavit-card">
                <h3>Student Affidavit</h3>
                <p>Declaration by students confirming no ragging has occurred or will occur</p>
                <a href={antiRagging.affidavit.studentLink} className="arr-affidavit-btn" target="_blank" rel="noopener noreferrer">
                  <Download size={16} />
                  Download PDF
                </a>
              </motion.div>
              <motion.div variants={fadeUp} className="arr-affidavit-card">
                <h3>Parent/Guardian Affidavit</h3>
                <p>Declaration by parents confirming their child will not engage in ragging</p>
                <a href={antiRagging.affidavit.parentLink} className="arr-affidavit-btn" target="_blank" rel="noopener noreferrer">
                  <Download size={16} />
                  Download PDF
                </a>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


