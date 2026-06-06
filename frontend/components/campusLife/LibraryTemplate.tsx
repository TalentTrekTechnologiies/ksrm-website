"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { library } from "@/data/campusLife/library"
import { Book, BookOpen, Monitor, Bookmark, Phone, Mail, Clock } from "lucide-react"
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

const sectionIcons = [Book, BookOpen, Monitor, Bookmark]

export default function LibraryTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .lib-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .lib-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .lib-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .lib-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .lib-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .lib-breadcrumb a:hover {
          opacity: 0.8;
        }
        .lib-breadcrumb span {
          color: #FFE619;
        }
        .lib-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
        }
        .lib-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .lib-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lib-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFE619;
        }
        .lib-stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .lib-section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .lib-section-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.2s;
        }
        .lib-section-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
          border-color: #FFE619;
        }
        .lib-section-icon {
          width: 48px;
          height: 48px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lib-section-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .lib-section-card p {
          color: #555;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        .lib-eresources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .lib-eresource-card {
          background: #f4f3ef;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lib-eresource-card h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #2B3490;
          margin: 0;
        }
        .lib-eresource-card p {
          color: #555;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }
        .lib-eresource-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2B3490;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
          width: fit-content;
        }
        .lib-eresource-link:hover {
          color: #FFE619;
        }
        .lib-rules {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lib-rule {
          background: #fff;
          border-left: 4px solid #2B3490;
          padding: 16px 20px;
          border-radius: 4px;
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }
        .lib-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .lib-contact-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .lib-contact-item-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
        }
        .lib-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .lib-contact-item p {
          font-size: 15px;
          margin: 0;
          line-height: 1.6;
        }
        .lib-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .lib-contact-item a:hover {
          opacity: 0.8;
        }
        .lib-contact-librarian {
          border-right: 1px solid rgba(255, 230, 25, 0.2);
        }
        @media (max-width: 900px) {
          .lib-contact-card {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .lib-contact-librarian {
            border-right: none;
            border-bottom: 1px solid rgba(255, 230, 25, 0.2);
            padding-bottom: 32px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="lib-hero"
        style={{
          backgroundImage: `url('/images/campus/12.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="lib-eyebrow" style={{ marginBottom: 16 }}>
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
                {library.pageTitle}
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
                {library.subtitle}
              </motion.p>

              {/* BREADCRUMB */}
              <motion.div variants={fadeUp} className="lib-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{library.pageTitle}</span>
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
            <p
              style={{
                color: "#555",
                fontSize: 16,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {library.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* STATS */}
      <section style={{ padding: "40px 0", background: "#2B3490" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="lib-stats-bar"
          >
            <motion.div variants={fadeUp} className="lib-stat-item">
              <div className="lib-stat-icon">
                <Book size={24} color="#FFE619" />
              </div>
              <div className="lib-stat-number">{library.stats.totalBooks}</div>
              <div className="lib-stat-label">Books</div>
            </motion.div>
            <motion.div variants={fadeUp} className="lib-stat-item">
              <div className="lib-stat-icon">
                <BookOpen size={24} color="#FFE619" />
              </div>
              <div className="lib-stat-number">{library.stats.journals}</div>
              <div className="lib-stat-label">Journals</div>
            </motion.div>
            <motion.div variants={fadeUp} className="lib-stat-item">
              <div className="lib-stat-icon">
                <Monitor size={24} color="#FFE619" />
              </div>
              <div className="lib-stat-number">{library.stats.eResources}</div>
              <div className="lib-stat-label">E-Resources</div>
            </motion.div>
            <motion.div variants={fadeUp} className="lib-stat-item">
              <div className="lib-stat-icon">
                <Bookmark size={24} color="#FFE619" />
              </div>
              <div className="lib-stat-number">{library.stats.seatingCapacity}</div>
              <div className="lib-stat-label">Seating</div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* SECTIONS */}
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
              Library Sections
            </motion.h2>

            <div className="lib-section-grid">
              {library.sections.map((section, idx) => {
                const IconComponent = sectionIcons[idx]
                return (
                  <motion.div key={idx} variants={fadeUp} className="lib-section-card">
                    <div className="lib-section-icon">
                      <IconComponent size={24} color="#2B3490" />
                    </div>
                    <h3>{section.name}</h3>
                    <p>{section.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* E-RESOURCES */}
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
              Digital Resources & E-Resources
            </motion.h2>

            <div className="lib-eresources-grid">
              {library.eResources.map((resource, idx) => (
                <motion.div key={idx} variants={fadeUp} className="lib-eresource-card">
                  <h4>{resource.name}</h4>
                  <p>{resource.description}</p>
                  <a href={resource.accessLink} className="lib-eresource-link" target="_blank" rel="noopener noreferrer">
                    Access Resource →
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* RULES */}
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
              Library Rules & Regulations
            </motion.h2>

            <div className="lib-rules">
              {library.rules.map((rule, idx) => (
                <motion.div key={idx} variants={fadeUp} className="lib-rule">
                  <strong>{idx + 1}.</strong> {rule}
                </motion.div>
              ))}
            </div>
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
            className="lib-contact-card"
          >
            <div className="lib-contact-librarian">
              <div className="lib-contact-item">
                <div className="lib-contact-item-icon">
                  <BookOpen size={24} />
                </div>
                <h4>{library.contact.librarian}</h4>
                <p style={{ fontSize: 15, marginTop: 8 }}>Head of the Central Library with 20+ years of experience in library management and digital resource curation.</p>
              </div>
            </div>
            <div>
              <div className="lib-contact-item">
                <div className="lib-contact-item-icon">
                  <Phone size={24} />
                </div>
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${library.contact.phone}`}>{library.contact.phone}</a>
                </p>
              </div>
              <div className="lib-contact-item" style={{ marginTop: 24 }}>
                <div className="lib-contact-item-icon">
                  <Mail size={24} />
                </div>
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${library.contact.email}`}>{library.contact.email}</a>
                </p>
              </div>
              <div className="lib-contact-item" style={{ marginTop: 24 }}>
                <div className="lib-contact-item-icon">
                  <Clock size={24} />
                </div>
                <h4>Timings</h4>
                <p>{library.contact.timings}</p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


