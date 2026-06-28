"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { aboutData } from "@/data/about-content"
import { FileText, Download, ExternalLink, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { leaders } from "@/data/leadership"

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

export default function AboutPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .section-separator { padding-top: 80px; padding-bottom: 80px; border-top: 1px solid #e8e8e8; }
        .section-first { border-top: none; }
        .section-bg-white { background: #ffffff; }
        .section-bg-cream { background: #f4f3ef; }
        .heading-main { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 32px; }
        .hero-gradient { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); }
        .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #FFE619; margin-bottom: 16px; }
        .hero-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0 0 16px; line-height: 1.08; }
        .hero-subtitle { color: #FFE619; font-size: 18px; margin: 0 0 24px; font-weight: 600; }
        .hero-text { color: rgba(255,255,255,0.9); font-size: 16px; line-height: 1.8; max-width: 700px; }
        .stat-box { text-align: center; }
        .stat-number { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; color: #2B3490; margin-bottom: 8px; }
        .stat-label { font-size: 13px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-about { background: #ffffff; border-left: 4px solid #FFE619; border-radius: 8px; padding: 28px; margin-bottom: 24px; font-size: 16px; line-height: 1.9; color: #555; }
        .card-about h3 { font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 16px; font-family: 'Rajdhani', sans-serif; }
        .vision-mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .vision-box { background: #f9f9f9; border: 2px solid #FFE619; border-radius: 8px; padding: 28px; }
        .vision-box p { margin: 0; font-size: 16px; line-height: 1.8; color: #555; }
        .mission-card { background: #f4f3ef; border-radius: 8px; padding: 20px; }
        .mission-code { background: #2B3490; color: #FFE619; font-weight: 700; padding: 4px 12px; border-radius: 4px; display: inline-block; margin-bottom: 8px; font-size: 11px; }
        .mission-text { margin: 0; font-size: 15px; color: #555; line-height: 1.7; }
        .leadership-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .leadership-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; text-align: center; }
        .avatar { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white; font-weight: 700; }
        .leader-name { font-weight: 700; color: #2B3490; font-size: 17px; margin-bottom: 6px; }
        .leader-title { font-size: 13px; color: white; background: #2B3490; padding: 3px 10px; border-radius: 4px; display: inline-block; margin-bottom: 12px; font-weight: 600; }
        .leader-desc { font-size: 14px; color: #555; line-height: 1.7; text-align: left; margin: 0; }
        .leader-email { font-size: 12px; color: #2B3490; text-decoration: none; margin-top: 12px; display: block; }
        .btn-primary { background: #2B3490; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; transition: all 0.2s; }
        .btn-primary:hover { background: #1a1d4d; transform: translateY(-2px); }
        .doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .doc-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: all 0.2s; text-decoration: none; color: #2B3490; }
        .doc-card:hover { border-color: #FFE619; box-shadow: 0 8px 16px rgba(43, 52, 144, 0.1); }
        .doc-icon { background: #eef1ff; border-radius: 6px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .doc-info { flex: 1; }
        .doc-name { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
        .doc-link { font-size: 12px; color: #999; }
        .meeting-btn { background: #f4f3ef; border: 1px solid #ddd; border-radius: 6px; padding: 12px 16px; display: flex; align-items: center; gap: 8px; text-decoration: none; color: #2B3490; transition: all 0.2s; }
        .meeting-btn:hover { background: #fff; border-color: #FFE619; }
        .contact-section { background: #2B3490; color: white; padding: 80px 0; border-top: 1px solid #e8e8e8; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 48px; }
        .contact-item h4 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; color: #FFE619; }
        .contact-item p { margin: 8px 0; font-size: 14px; line-height: 1.6; }
        .contact-link { color: #FFE619; text-decoration: none; font-size: 14px; }
        .social-icons { display: flex; gap: 16px; margin-top: 12px; }
        .social-icon { width: 40px; height: 40px; background: rgba(255, 230, 25, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFE619; text-decoration: none; font-size: 16px; transition: all 0.2s; }
        .social-icon:hover { background: #FFE619; color: #2B3490; }
        @media (max-width: 768px) {
          .vision-mission-grid { grid-template-columns: 1fr; }
          .leadership-grid { grid-template-columns: 1fr; }
          .doc-grid { grid-template-columns: 1fr; }
          .contact-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>

      {/* SECTION 1: HERO */}
      <section style={{
        position: "relative",
        backgroundImage: "url('/banners/about-banner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#2B3490",
        minHeight: "320px",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
        paddingTop: 80,
        paddingBottom: 80,
      }}>
        {/* Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="eyebrow">🏛️ About Us</motion.div>
            <motion.h1 variants={fadeUp} className="hero-title">{aboutData.title}</motion.h1>
            <motion.p variants={fadeUp} className="hero-subtitle">{aboutData.tagline}</motion.p>
          </motion.div>
        </Container>
        </div>
      </section>

      {/* SECTION 2: STATS BAR */}
      <section className="section-bg-white" style={{ padding: "40px 0", borderBottom: "3px solid #FFE619" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 24 }}>
            {aboutData.stats.map((stat, idx) => (
              <motion.div key={idx} variants={fadeUp} className="stat-box">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* SECTION 3: VISION & MISSION */}
      <section className="section-bg-white section-separator" id="vision">
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="heading-main">Vision & Mission</h2>
            <div className="vision-mission-grid">
              <motion.div variants={fadeUp}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16, fontFamily: "'Rajdhani', sans-serif" }}>Our Vision</h3>
                <div className="vision-box">{aboutData.vision}</div>
              </motion.div>
              <motion.div variants={fadeUp}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16, fontFamily: "'Rajdhani', sans-serif" }}>Our Mission</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {aboutData.missions.map((mission, idx) => (
                    <div key={idx} className="mission-card">
                      <div className="mission-code">{mission.code}</div>
                      <p className="mission-text">{mission.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 4: LEADERSHIP */}
      <section className="section-bg-cream section-separator" id="leadership">
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="heading-main">Leadership</h2>
            <div className="leadership-grid">
              {leaders.map((leader) => (
                <motion.div key={leader.slug} variants={fadeUp} className="leadership-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <img
                    src={leader.photo}
                    alt={leader.name}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      objectFit: "cover",
                      objectPosition: "top",
                      border: "4px solid #FFE619",
                      margin: "0 auto 16px",
                      display: "block"
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="leader-name">{leader.name}</div>
                  <div className="leader-title">{leader.title}</div>
                  <p className="leader-desc" style={{ flex: 1 }}>{leader.description}</p>
                  {leader.email && <a href={`mailto:${leader.email}`} className="leader-email">📧 {leader.email}</a>}
                  <Link
                    href={`/about/${leader.slug}`}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "10px 16px",
                      background: "#2B3490",
                      color: "#FFE619",
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "13px",
                      textDecoration: "none",
                      marginTop: "12px",
                    }}
                  >
                    View Profile →
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 6: JOINT BOARD OF STUDIES */}
      <section className="section-bg-white section-separator" id="jbos">
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="heading-main">Joint Board of Studies</h2>
            <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
              <a href={aboutData.jbos.membersDoc} className="btn-primary" download>
                <Download size={18} />
                📥 Board of Studies Members 2020-21
              </a>
            </motion.div>
            <motion.div variants={fadeUp}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 24, fontFamily: "'Rajdhani', sans-serif" }}>Minutes of Meeting</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {aboutData.jbos.minutesOfMeeting.map((meeting, idx) => (
                  <a key={idx} href={meeting.file} target="_blank" rel="noopener noreferrer" className="meeting-btn">
                    <span>📄</span>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{meeting.date}</div>
                      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Download →</div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 7: STRATEGIC PLAN & DOCUMENTS */}
      <section className="section-bg-cream section-separator" id="strategic">
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="heading-main">Strategic Plan & Deployment Documents</h2>
            <div className="doc-grid">
              {aboutData.strategicPlan.map((doc, idx) => (
                <motion.a key={idx} variants={fadeUp} href={doc.file} target="_blank" rel="noopener noreferrer" className="doc-card">
                  <div className="doc-icon"><FileText size={22} color="#2B3490" /></div>
                  <div className="doc-info">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-link">Download PDF →</div>
                  </div>
                  <ExternalLink size={16} color="#FFE619" style={{ flexShrink: 0 }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 8: POLICY DOCUMENTS */}
      <section className="section-bg-white section-separator" id="policies">
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="heading-main">Institutional Policy Documents</h2>
            <div className="doc-grid">
              {aboutData.policyDocs.map((doc, idx) => (
                <motion.a key={idx} variants={fadeUp} href={doc.file} target="_blank" rel="noopener noreferrer" className="doc-card">
                  <div className="doc-icon" style={{ fontSize: 22 }}>{doc.icon}</div>
                  <div className="doc-info">
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-link">Download PDF →</div>
                  </div>
                  <ExternalLink size={16} color="#FFE619" style={{ flexShrink: 0 }} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 9: GET IN TOUCH */}
      <section style={{ background: "#ffffff", padding: "80px 0", borderTop: "1px solid #e8e8e8" }} id="contact">
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="heading-main" style={{ textAlign: "center", marginBottom: 8 }}>Get In Touch</h2>
            <p style={{ fontSize: 14, color: "#666", textAlign: "center", marginBottom: 48 }}>
              EAPCET Code: KSRM | Affiliated to JNTUA | UGC Autonomous
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {/* COLUMN 1: LOCATION CARD */}
              <motion.div
                variants={fadeUp}
                style={{
                  background: "linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)",
                  borderRadius: 12,
                  padding: 32,
                  color: "white"
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>📍</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#FFE619", marginBottom: 12, margin: 0 }}>Find Us</h3>
                <p style={{ fontSize: 15, lineHeight: 1.9, color: "#e0e0e0", margin: "12px 0" }}>K.S.R.M. College of Engineering</p>
                <p style={{ fontSize: 15, lineHeight: 1.9, color: "#e0e0e0", margin: 0 }}>Kadapa – 516003</p>
                <p style={{ fontSize: 15, lineHeight: 1.9, color: "#e0e0e0", margin: 0 }}>Andhra Pradesh, India</p>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: 12, margin: "12px 0 0 0" }}>7 KM from Kadapa town on</p>
                <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>Kadapa–Pulivendula Highway</p>
              </motion.div>

              {/* COLUMN 2: CONTACT CARD */}
              <motion.div
                variants={fadeUp}
                style={{
                  background: "#f9f9f9",
                  border: "2px solid #FFE619",
                  borderRadius: 12,
                  padding: 32
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>📞</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 16, margin: 0 }}>Contact Us</h3>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span>📞</span>
                  <a href={`tel:${aboutData.contact.phone}`} style={{ color: "#444", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>
                    {aboutData.contact.phone}
                  </a>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span>📞</span>
                  <a href={`tel:${aboutData.contact.altPhone}`} style={{ color: "#444", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>
                    {aboutData.contact.altPhone}
                  </a>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span>☎️</span>
                  <a href={`tel:${aboutData.contact.officePhone}`} style={{ color: "#444", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>
                    {aboutData.contact.officePhone}
                  </a>
                </div>

                <div style={{ borderTop: "1px solid #eee", margin: "16px 0" }}></div>

                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span>✉️</span>
                  <a href={`mailto:${aboutData.contact.email}`} style={{ color: "#2B3490", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                    {aboutData.contact.email}
                  </a>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <span>✉️</span>
                  <a href={`mailto:${aboutData.contact.email2}`} style={{ color: "#2B3490", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                    {aboutData.contact.email2}
                  </a>
                </div>
              </motion.div>

              {/* COLUMN 3: CONNECT CARD */}
              <motion.div
                variants={fadeUp}
                style={{
                  background: "#f9f9f9",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 32
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>🌐</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 16, margin: 0 }}>Connect With Us</h3>

                <a href={`https://${aboutData.contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2B3490", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "block", marginBottom: 20 }}>
                  {aboutData.contact.website}
                </a>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <a
                    href={aboutData.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#1877F2",
                      color: "white",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    f Facebook
                  </a>

                  <a
                    href={aboutData.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#000",
                      color: "white",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    𝕏 X
                  </a>

                  <a
                    href={aboutData.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#E4405F",
                      color: "white",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    📷 Instagram
                  </a>

                  <a
                    href={aboutData.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#FF0000",
                      color: "white",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    ▶️ YouTube
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
