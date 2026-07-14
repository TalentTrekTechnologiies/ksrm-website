"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { admissions } from "@/data/academics/admissions"
import { CheckCircle2, ExternalLink, FileText } from "lucide-react"
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

export default function AdmissionsTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .adm-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .adm-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .adm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .adm-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .adm-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .adm-breadcrumb a:hover {
          opacity: 0.8;
        }
        .adm-breadcrumb span {
          color: #FFE619;
        }
        .adm-eapcet-callout {
          background: #FFE619;
          color: #2B3490;
          padding: 24px;
          border-radius: 12px;
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
        }
        .adm-eapcet-code {
          font-size: 32px;
        }
        .adm-eapcet-text {
          font-size: 15px;
        }
        .adm-route-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .adm-route-card {
          background: #fff;
          border: 2px solid #2B3490;
          border-radius: 12px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .adm-route-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0;
        }
        .adm-route-detail {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .adm-route-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #666;
          letter-spacing: 0.5px;
        }
        .adm-route-value {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }
        .adm-quota-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .adm-quota-list li {
          font-size: 13px;
          color: #555;
          padding-left: 18px;
          position: relative;
        }
        .adm-quota-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #FFE619;
          font-weight: bold;
        }
        .adm-process-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }
        .adm-process-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .adm-step-number {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: #2B3490;
          color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
        }
        .adm-step-content h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px;
        }
        .adm-step-content p {
          font-size: 14px;
          color: #555;
          margin: 0;
          line-height: 1.6;
        }
        .adm-documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }
        .adm-doc-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          background: #f4f3ef;
          border-radius: 8px;
        }
        .adm-doc-icon {
          flex-shrink: 0;
          color: #2B3490;
          margin-top: 2px;
        }
        .adm-doc-text {
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }
        .adm-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .adm-link-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 24px;
          border-radius: 12px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }
        .adm-link-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(43, 52, 144, 0.3);
        }
        .adm-link-text {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
        }
        .adm-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .adm-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .adm-contact-item p {
          font-size: 15px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .adm-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .adm-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .adm-route-grid {
            grid-template-columns: 1fr;
          }
          .adm-eapcet-callout {
            flex-direction: column;
            text-align: center;
          }
          .adm-process-step {
            flex-direction: column;
            gap: 12px;
          }
          .adm-documents-grid {
            grid-template-columns: 1fr;
          }
          .adm-links-grid {
            grid-template-columns: 1fr;
          }
          .adm-contact-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="adm-hero"
        style={{
          backgroundImage: `url('/images/campus/03.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="adm-eyebrow" style={{ marginBottom: 16 }}>
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
                {admissions.pageTitle}
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
                {admissions.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="adm-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span>{admissions.pageTitle}</span>
              </motion.div>

              <motion.div variants={fadeUp} className="adm-eapcet-callout">
                <div className="adm-eapcet-code">{admissions.eapcetCode}</div>
                <div className="adm-eapcet-text">
                  Use this code when applying during EAPCET / ICET / PGECET web counselling
                </div>
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
              {admissions.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ADMISSION ROUTES */}
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
              Admission Routes by Programme
            </motion.h2>

            <div className="adm-route-grid">
              {admissions.admissionRoutes.map((route, idx) => (
                <motion.div key={idx} variants={fadeUp} className="adm-route-card">
                  <h3>{route.programme}</h3>

                  <div className="adm-route-detail">
                    <div className="adm-route-label">Entrance Exam</div>
                    <div className="adm-route-value">{route.route}</div>
                  </div>

                  <div className="adm-route-detail">
                    <div className="adm-route-label">Conducting Authority</div>
                    <div className="adm-route-value">{route.authority}</div>
                  </div>

                  <div className="adm-route-detail">
                    <div className="adm-route-label">Admission Quota</div>
                    <ul className="adm-quota-list">
                      {route.quota.map((q, qIdx) => (
                        <li key={qIdx}>
                          {q.name}: {q.seats}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="adm-route-detail">
                    <div className="adm-route-label">Eligibility Criteria</div>
                    <div className="adm-route-value">{route.eligibility}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ADMISSION PROCESS */}
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
              Admission Process
            </motion.h2>

            <div className="adm-process-container">
              {admissions.admissionProcess.map((step, idx) => (
                <motion.div key={idx} variants={fadeUp} className="adm-process-step">
                  <div className="adm-step-number">{step.step}</div>
                  <div className="adm-step-content">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* DOCUMENTS REQUIRED */}
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
              Documents Required at Admission
            </motion.h2>

            <div className="adm-documents-grid">
              {admissions.documentsRequired.map((doc, idx) => (
                <motion.div key={idx} variants={fadeUp} className="adm-doc-item">
                  <div className="adm-doc-icon">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="adm-doc-text">{doc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* IMPORTANT LINKS */}
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
              Important Links
            </motion.h2>

            <div className="adm-links-grid">
              {admissions.importantLinks.map((link, idx) => (
                <motion.a
                  key={idx}
                  variants={fadeUp}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-link-card"
                >
                  <div className="adm-link-text">{link.label}</div>
                  <ExternalLink size={18} />
                </motion.a>
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
            className="adm-contact-card"
          >
            <div className="adm-contact-item">
              <h4>{admissions.contact.office}</h4>
              <p>Kadapa – 516003, Andhra Pradesh, India</p>
            </div>
            <div className="adm-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${admissions.contact.phone.split("/")[0].trim()}`}>
                  {admissions.contact.phone}
                </a>
              </p>
            </div>
            <div className="adm-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${admissions.contact.email.split("/")[0].trim()}`}>
                  {admissions.contact.email.split("/")[0].trim()}
                </a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
