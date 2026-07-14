"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { hostels } from "@/data/campusLife/hostels"
import { Users, Utensils, Wifi, Shield, Dumbbell, Droplet, CheckCircle, Phone, Mail } from "lucide-react"
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

const facilityIcons = [Utensils, Wifi, Shield, Dumbbell, Users, Droplet]

export default function HostelsTemplate() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .hos-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .hos-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .hos-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .hos-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .hos-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .hos-breadcrumb a:hover {
          opacity: 0.8;
        }
        .hos-breadcrumb span {
          color: #FFE619;
        }
        .hos-hostel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .hos-hostel-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .hos-hostel-card:hover {
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
          transform: translateY(-4px);
          transition: all 0.2s;
        }
        .hos-hostel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 2px solid #FFE619;
        }
        .hos-hostel-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hos-hostel-name {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .hos-info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eef0f3;
          font-size: 15px;
        }
        .hos-info-row:last-of-type {
          border-bottom: none;
        }
        .hos-info-label {
          color: #666;
          font-weight: 600;
        }
        .hos-info-value {
          color: #2B3490;
          font-weight: 700;
        }
        .hos-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .hos-amenity {
          background: #f4f3ef;
          color: #2B3490;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
        }
        .hos-warden {
          background: #f4f3ef;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        .hos-warden-name {
          font-weight: 700;
          color: #2B3490;
          display: block;
          margin-bottom: 4px;
        }
        .hos-facility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .hos-facility-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .hos-facility-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .hos-facility-icon {
          width: 44px;
          height: 44px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hos-facility-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .hos-facility-card p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .hos-process {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
          position: relative;
        }
        .hos-process-step {
          background: #fff;
          border: 2px solid #2B3490;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        .hos-process-step h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .hos-process-step p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .hos-rules {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 40px;
        }
        .hos-rule {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 14px 16px;
          border-radius: 4px;
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }
        .hos-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .hos-contact-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hos-contact-item-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
        }
        .hos-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .hos-contact-item p {
          font-size: 15px;
          margin: 0;
          line-height: 1.6;
        }
        .hos-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .hos-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .hos-hostel-grid {
            grid-template-columns: 1fr;
          }
          .hos-contact-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="hos-hero"
        style={{
          backgroundImage: `url('/images/campus/07.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="hos-eyebrow" style={{ marginBottom: 16 }}>
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
                {hostels.pageTitle}
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
                {hostels.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="hos-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/campus-life">Campus Life</Link>
                <span>/</span>
                <span>{hostels.pageTitle}</span>
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
              {hostels.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* HOSTELS */}
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
              Our Hostels
            </motion.h2>

            <div className="hos-hostel-grid">
              {hostels.hostels.map((hostel, idx) => (
                <motion.div key={idx} variants={fadeUp} className="hos-hostel-card">
                  <div className="hos-hostel-header">
                    <div className="hos-hostel-icon">
                      <Users size={24} color="#2B3490" />
                    </div>
                    <h3 className="hos-hostel-name">{hostel.name}</h3>
                  </div>

                  <div>
                    <div className="hos-info-row">
                      <span className="hos-info-label">Type:</span>
                      <span className="hos-info-value">{hostel.type === "boys" ? "For Boys" : "For Girls"}</span>
                    </div>
                    <div className="hos-info-row">
                      <span className="hos-info-label">Capacity:</span>
                      <span className="hos-info-value">{hostel.capacity}</span>
                    </div>
                    <div className="hos-info-row">
                      <span className="hos-info-label">Rooms:</span>
                      <span className="hos-info-value">{hostel.rooms}</span>
                    </div>
                    <div className="hos-info-row">
                      <span className="hos-info-label">Fee/Year:</span>
                      <span className="hos-info-value">{hostel.feePerYear}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2B3490", marginBottom: 8 }}>
                      AMENITIES
                    </div>
                    <div className="hos-amenities">
                      {hostel.amenities.map((amenity, aidx) => (
                        <span key={aidx} className="hos-amenity">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="hos-warden">
                    <span className="hos-warden-name">Warden: {hostel.warden.name}</span>
                    <a href={`tel:${hostel.warden.phone}`} style={{ color: "#2B3490", textDecoration: "none", fontSize: 12 }}>
                      {hostel.warden.phone}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* FACILITIES */}
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
              Hostel Facilities
            </motion.h2>

            <div className="hos-facility-grid">
              {hostels.facilities.map((facility, idx) => {
                const IconComponent = facilityIcons[idx]
                return (
                  <motion.div key={idx} variants={fadeUp} className="hos-facility-card">
                    <div className="hos-facility-icon">
                      <IconComponent size={24} color="#2B3490" />
                    </div>
                    <h3>{facility.name}</h3>
                    <p>{facility.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ADMISSION PROCESS */}
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
              Hostel Admission Process
            </motion.h2>

            <div className="hos-process">
              {hostels.admissionProcess.map((step, idx) => (
                <motion.div key={idx} variants={fadeUp} className="hos-process-step">
                  <h4>{step.step}</h4>
                  <p>{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* RULES */}
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
              Hostel Rules & Regulations
            </motion.h2>

            <div className="hos-rules">
              {hostels.rules.map((rule, idx) => (
                <motion.div key={idx} variants={fadeUp} className="hos-rule">
                  {rule}
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
            className="hos-contact-card"
          >
            <div className="hos-contact-item">
              <div className="hos-contact-item-icon">
                <Users size={24} />
              </div>
              <h4>{hostels.contact.office}</h4>
              <p>For all hostel-related inquiries and admissions</p>
            </div>
            <div className="hos-contact-item">
              <div className="hos-contact-item-icon">
                <Phone size={24} />
              </div>
              <h4>Phone</h4>
              <p>
                <a href={`tel:${hostels.contact.phone}`}>{hostels.contact.phone}</a>
              </p>
            </div>
            <div className="hos-contact-item">
              <div className="hos-contact-item-icon">
                <Mail size={24} />
              </div>
              <h4>Email</h4>
              <p>
                <a href={`mailto:${hostels.contact.email}`}>{hostels.contact.email}</a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}


