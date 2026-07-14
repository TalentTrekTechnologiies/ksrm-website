"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Container from "@/components/ui/Container"
import { contact } from "@/data/contact"
import { MapPin, Phone, Mail, Share2, Heart, Globe, Music } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function ContactTemplate() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .contact-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .contact-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .contact-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
        .contact-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
        }
        .contact-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin: 56px 0;
          align-items: start;
        }
        .contact-info-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .contact-info-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2B3490;
        }
        .contact-info-content h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px;
        }
        .contact-info-content p {
          color: #666;
          font-size: 15px;
          margin: 0;
          line-height: 1.6;
        }
        .contact-info-content a {
          color: #2B3490;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .contact-info-content a:hover {
          color: #FFE619;
        }
        .contact-map {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(43,52,144,0.1);
          height: 400px;
        }
        .contact-map iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .contact-departments-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin: 56px 0;
        }
        .contact-dept-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 28px;
        }
        .contact-dept-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 16px;
        }
        .contact-dept-card p {
          color: #666;
          font-size: 15px;
          margin: 0 0 12px;
        }
        .contact-dept-card a {
          color: #2B3490;
          text-decoration: none;
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
          transition: color 0.2s;
        }
        .contact-dept-card a:hover {
          color: #FFE619;
        }
        .contact-hours-banner {
          background: #FFE619;
          color: #1a1a2e;
          padding: 32px;
          border-radius: 12px;
          text-align: center;
          margin: 56px 0;
        }
        .contact-hours-banner h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }
        .contact-social {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin: 48px 0;
        }
        .contact-social-link {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #f7f8fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2B3490;
          transition: all 0.2s;
          text-decoration: none;
        }
        .contact-social-link:hover {
          background: #2B3490;
          color: #fff;
          transform: translateY(-4px);
        }
        @media (max-width: 1024px) {
          .contact-main-grid {
            grid-template-columns: 1fr;
          }
          .contact-departments-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .contact-main-grid {
            gap: 32px;
          }
          .contact-map {
            height: 300px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="contact-hero">
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <div className="contact-breadcrumb">
                <a href="/">Home</a>
                <span>/</span>
                <span>{(contact as any).pageTitle}</span>
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
                {(contact as any).pageTitle}
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
                {(contact as any).subtitle}
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CONTACT INFO & MAP */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="contact-main-grid">
            <motion.div variants={fadeUp}>
              {/* Address */}
              <div className="contact-info-card">
                <div className="contact-info-icon">
                  <MapPin size={24} />
                </div>
                <div className="contact-info-content">
                  <h3>Address</h3>
                  <p>{contact.address}</p>
                </div>
              </div>

              {/* Phones */}
              {Array.isArray((contact as any).phones)
                ? (contact as any).phones.map((phone: string, idx: number) => (
                    <div key={idx} className="contact-info-card">
                      <div className="contact-info-icon">
                        <Phone size={24} />
                      </div>
                      <div className="contact-info-content">
                        <h3>{idx === 0 ? "Phone" : "Alternate"}</h3>
                        <a href={`tel:${phone}`}>{phone}</a>
                      </div>
                    </div>
                  ))
                : (
                  <div className="contact-info-card">
                    <div className="contact-info-icon">
                      <Phone size={24} />
                    </div>
                    <div className="contact-info-content">
                      <h3>Phone</h3>
                      <a href={`tel:${(contact as any).phone}`}>{(contact as any).phone}</a>
                    </div>
                  </div>
                )}

              {/* Emails */}
              {Array.isArray((contact as any).emails)
                ? (contact as any).emails.map((email: string, idx: number) => (
                    <div key={idx} className="contact-info-card">
                      <div className="contact-info-icon">
                        <Mail size={24} />
                      </div>
                      <div className="contact-info-content">
                        <h3>{idx === 0 ? "Email" : "Alternate"}</h3>
                        <a href={`mailto:${email}`}>{email}</a>
                      </div>
                    </div>
                  ))
                : (
                  <div className="contact-info-card">
                    <div className="contact-info-icon">
                      <Mail size={24} />
                    </div>
                    <div className="contact-info-content">
                      <h3>Email</h3>
                      <a href={`mailto:${(contact as any).email}`}>{(contact as any).email}</a>
                    </div>
                  </div>
                )}
            </motion.div>

            {/* MAP */}
            <motion.div variants={fadeUp} className="contact-map">
              <iframe src={(contact as any).mapEmbedUrl}></iframe>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* DEPARTMENTS */}
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
              Department Contacts
            </motion.h2>
            <motion.div variants={stagger} className="contact-departments-grid">
              {(contact as any).departments?.map((dept: any, idx: number) => (
                <motion.div key={idx} variants={fadeUp} className="contact-dept-card">
                  <h3>{dept.name}</h3>
                  <p>Phone:</p>
                  <a href={`tel:${dept.phone}`}>{dept.phone}</a>
                  <p>Email:</p>
                  <a href={`mailto:${dept.email}`}>{dept.email}</a>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* WORKING HOURS */}
      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="contact-hours-banner">
            <h3>📅 Working Hours</h3>
            <p style={{ margin: "12px 0 0", fontSize: 16 }}>{(contact as any).workingHours}</p>
          </motion.div>
        </Container>
      </section>

      {/* SOCIAL LINKS */}
      <section style={{ padding: "48px 0", background: "#f7f8fa", textAlign: "center" }}>
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
              Follow Us
            </h3>
            <div className="contact-social">
              <a href={(contact as any).socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Facebook">
                <Share2 size={20} />
              </a>
              <a href={(contact as any).socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Twitter">
                <Heart size={20} />
              </a>
              <a href={(contact as any).socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="contact-social-link" title="Instagram">
                <Globe size={20} />
              </a>
              <a href={(contact as any).socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="contact-social-link" title="YouTube">
                <Music size={20} />
              </a>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
