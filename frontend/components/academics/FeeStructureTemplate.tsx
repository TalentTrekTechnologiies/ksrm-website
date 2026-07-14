"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { feeStructure } from "@/data/academics/feeStructure"
import { AlertCircle, Phone, Mail, Award } from "lucide-react"
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

export default function FeeStructureTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .fee-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .fee-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .fee-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .fee-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .fee-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .fee-breadcrumb a:hover {
          opacity: 0.8;
        }
        .fee-breadcrumb span {
          color: #FFE619;
        }
        .fee-notice {
          background: #FFE619;
          border-left: 4px solid #2B3490;
          padding: 20px 24px;
          border-radius: 8px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .fee-notice-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fee-notice-content {
          flex: 1;
        }
        .fee-notice-content p {
          color: #2B3490;
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
          font-weight: 500;
        }
        .fee-table-wrapper {
          overflow-x: auto;
          margin-top: 24px;
        }
        .fee-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 16px;
        }
        .fee-table thead th {
          background: #2B3490;
          color: #fff;
          padding: 16px;
          text-align: left;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .fee-table tbody td {
          padding: 14px 16px;
          border-bottom: 1px solid #eef0f3;
        }
        .fee-table tbody tr:nth-child(odd) {
          background: #f4f3ef;
        }
        .fee-table tbody tr:nth-child(even) {
          background: #ffffff;
        }
        .fee-table tbody tr:hover {
          background: #fffaed;
          transition: background 0.2s;
        }
        .fee-table tbody tr:hover td {
          color: #2B3490;
          font-weight: 600;
        }
        .fee-programme-title {
          font-family: "Rajdhani", sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 40px 0 20px;
        }
        .fee-programme-title:first-of-type {
          margin-top: 0;
        }
        .fee-scholarship-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }
        .fee-scholarship-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .fee-scholarship-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
          border-color: #FFE619;
        }
        .fee-scholarship-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fee-scholarship-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .fee-scholarship-card p {
          color: #555;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }
        .fee-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          text-align: center;
        }
        .fee-contact-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 24px;
        }
        .fee-contact-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
          margin-bottom: 24px;
        }
        .fee-contact-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .fee-contact-item-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fee-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
          font-weight: 700;
        }
        .fee-contact-item p {
          font-size: 16px;
          margin: 0;
          line-height: 1.6;
        }
        .fee-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .fee-contact-item a:hover {
          opacity: 0.8;
        }
        .fee-contact-note {
          font-size: 15px;
          line-height: 1.6;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 230, 25, 0.3);
        }
        @media (max-width: 900px) {
          .fee-contact-items {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="fee-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="fee-eyebrow" style={{ marginBottom: 16 }}>
                Academics
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
                {feeStructure.pageTitle}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 400,
                  maxWidth: 700,
                }}
              >
                {feeStructure.subtitle}
              </motion.p>

              {/* BREADCRUMB */}
              <motion.div variants={fadeUp} className="fee-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span>{feeStructure.pageTitle}</span>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* NOTICE BANNER */}
      <section style={{ padding: "56px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="fee-notice"
          >
            <div className="fee-notice-icon">
              <AlertCircle size={24} color="#2B3490" />
            </div>
            <div className="fee-notice-content">
              <p>{feeStructure.notice}</p>
            </div>
          </motion.div>
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
            <p
              style={{
                color: "#555",
                fontSize: 16,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {feeStructure.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* FEE TABLES */}
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
              Fee Structure by Programme
            </motion.h2>

            {feeStructure.categories.map((category, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <h3 className="fee-programme-title">{category.programme}</h3>
                <div className="fee-table-wrapper">
                  <table className="fee-table">
                    <thead>
                      <tr>
                        <th>Branch / Specialization</th>
                        <th>Annual Fee</th>
                        <th>Admission Fee</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          <td style={{ fontWeight: 600 }}>{row.branch}</td>
                          <td>{row.annualFee}</td>
                          <td>{row.admissionFee}</td>
                          <td style={{ fontSize: 13, color: "#666" }}>{row.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* SCHOLARSHIPS */}
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
              {feeStructure.scholarships.title}
            </motion.h2>

            <div className="fee-scholarship-grid">
              {feeStructure.scholarships.items.map((scholarship, idx) => (
                <motion.div key={idx} variants={fadeUp} className="fee-scholarship-card">
                  <div className="fee-scholarship-icon">
                    <Award size={24} color="#2B3490" />
                  </div>
                  <h3>{scholarship.name}</h3>
                  <p>{scholarship.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="fee-contact-card"
          >
            <h3>{feeStructure.contactInfo.office}</h3>
            <div className="fee-contact-items">
              <div className="fee-contact-item">
                <div className="fee-contact-item-icon">
                  <Phone size={24} />
                </div>
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${feeStructure.contactInfo.phone}`}>{feeStructure.contactInfo.phone}</a>
                </p>
              </div>
              <div className="fee-contact-item">
                <div className="fee-contact-item-icon">
                  <Mail size={24} />
                </div>
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${feeStructure.contactInfo.email}`}>{feeStructure.contactInfo.email}</a>
                </p>
              </div>
            </div>
            <div className="fee-contact-note">{feeStructure.contactInfo.note}</div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
