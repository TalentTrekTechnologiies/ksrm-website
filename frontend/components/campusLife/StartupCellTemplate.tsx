"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { startupCell } from "@/data/campusLife/startupCell"
import { Rocket, TrendingUp, Users, Award, CheckCircle, Phone, Mail } from "lucide-react"
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

export default function StartupCellTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .suc-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .suc-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .suc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .suc-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .suc-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .suc-breadcrumb a:hover {
          opacity: 0.8;
        }
        .suc-breadcrumb span {
          color: #FFE619;
        }
        .suc-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .suc-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .suc-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .suc-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFE619;
        }
        .suc-stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .suc-service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .suc-service-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .suc-service-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .suc-service-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .suc-service-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .suc-service-card p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .suc-story-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .suc-story-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 12px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .suc-story-card h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 19px;
          font-weight: 700;
          margin: 0;
        }
        .suc-story-card p {
          font-size: 14px;
          margin: 0;
          line-height: 1.6;
        }
        .suc-story-meta {
          border-top: 1px solid rgba(255, 230, 25, 0.3);
          padding-top: 12px;
          margin-top: 12px;
          font-size: 13px;
        }
        .suc-process {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 40px;
          position: relative;
        }
        .suc-process-step {
          background: #fff;
          border: 2px solid #2B3490;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          position: relative;
          z-index: 2;
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          font-family: "Rajdhani", sans-serif;
        }
        .suc-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          text-align: center;
        }
        .suc-contact-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        .suc-contact-card p {
          font-size: 14px;
          margin: 0 0 24px;
          opacity: 0.9;
        }
        .suc-contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
          margin-top: 24px;
        }
        .suc-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .suc-contact-item p {
          font-size: 15px;
          margin: 8px 0 0;
        }
        .suc-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .suc-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .suc-contact-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="suc-hero"
        style={{
          backgroundImage: `url('/images/campus/13.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="suc-eyebrow" style={{ marginBottom: 16 }}>
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
                {startupCell.pageTitle}
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
                {startupCell.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="suc-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{startupCell.pageTitle}</span>
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
              {startupCell.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* ABOUT */}
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
                margin: "0 0 24px",
              }}
            >
              About Startup Cell
            </motion.h2>

            <motion.div
              variants={fadeUp}
              style={{
                background: "#f4f3ef",
                padding: "24px",
                borderRadius: "12px",
                fontSize: 15,
                color: "#555",
                lineHeight: 1.8,
              }}
            >
              {startupCell.about}
            </motion.div>

            {/* STATS */}
            <motion.div variants={stagger} className="suc-stats-bar">
              <motion.div variants={fadeUp} className="suc-stat-item">
                <div className="suc-stat-icon">
                  <Rocket size={24} color="#FFE619" />
                </div>
                <div className="suc-stat-number">{startupCell.stats.startupsSupported}</div>
                <div className="suc-stat-label">Startups Supported</div>
              </motion.div>
              <motion.div variants={fadeUp} className="suc-stat-item">
                <div className="suc-stat-icon">
                  <TrendingUp size={24} color="#FFE619" />
                </div>
                <div className="suc-stat-number">{startupCell.stats.fundingRaised}</div>
                <div className="suc-stat-label">Funding Raised</div>
              </motion.div>
              <motion.div variants={fadeUp} className="suc-stat-item">
                <div className="suc-stat-icon">
                  <Users size={24} color="#FFE619" />
                </div>
                <div className="suc-stat-number">{startupCell.stats.mentors}</div>
                <div className="suc-stat-label">Mentors</div>
              </motion.div>
              <motion.div variants={fadeUp} className="suc-stat-item">
                <div className="suc-stat-icon">
                  <Award size={24} color="#FFE619" />
                </div>
                <div className="suc-stat-number">{startupCell.stats.patents}</div>
                <div className="suc-stat-label">Patents Filed</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* SERVICES */}
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
              Our Services
            </motion.h2>

            <div className="suc-service-grid">
              {startupCell.services.map((service, idx) => (
                <motion.div key={idx} variants={fadeUp} className="suc-service-card">
                  <div className="suc-service-icon">
                    <Rocket size={24} color="#2B3490" />
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SUCCESS STORIES */}
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
              Success Stories
            </motion.h2>

            <div className="suc-story-grid">
              {startupCell.successStories.map((story, idx) => (
                <motion.div key={idx} variants={fadeUp} className="suc-story-card">
                  <h4>{story.name}</h4>
                  <p>{story.description}</p>
                  <div className="suc-story-meta">
                    <p>
                      <strong>Founder:</strong> {story.founder}
                    </p>
                    <p>
                      <strong>Domain:</strong> {story.domain}
                    </p>
                    {story.funding && (
                      <p>
                        <strong>Funding:</strong> {story.funding}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* APPLICATION PROCESS */}
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
              How to Apply
            </motion.h2>

            <div className="suc-process">
              {startupCell.applicationProcess.map((item, idx) => (
                <motion.div key={idx} variants={fadeUp} className="suc-process-step">
                  <div style={{ marginBottom: 8 }}>
                    <CheckCircle size={20} color="#2B3490" style={{ margin: "0 auto" }} />
                  </div>
                  Step {idx + 1}: {item.step}
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
            className="suc-contact-card"
          >
            <h3>{startupCell.contact.coordinator}</h3>
            <p>Startup Cell Coordinator</p>
            <div className="suc-contact-info">
              <div className="suc-contact-item">
                <h4>Phone</h4>
                <p>
                  <a href={`tel:${startupCell.contact.phone}`}>{startupCell.contact.phone}</a>
                </p>
              </div>
              <div className="suc-contact-item">
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${startupCell.contact.email}`}>{startupCell.contact.email}</a>
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


