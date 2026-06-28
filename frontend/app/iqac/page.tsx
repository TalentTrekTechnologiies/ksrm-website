"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"
import Container from "@/components/ui/Container"
import { campusFacilities } from "@/data/campusLife/campusFacilities"
import { getImagesByCategory } from "@/data/gallery-images"
import {
  School,
  Monitor,
  FlaskConical,
  BookOpen,
  Presentation,
  BedDouble,
  UtensilsCrossed,
  HeartPulse,
  CreditCard,
  Trophy,
  Mic,
  Bus,
  Wifi,
  Shield,
  Zap,
} from "lucide-react"
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

const iconMap: { [key: string]: React.ReactNode } = {
  School: <School size={28} />,
  Monitor: <Monitor size={28} />,
  FlaskConical: <FlaskConical size={28} />,
  BookOpen: <BookOpen size={28} />,
  Presentation: <Presentation size={28} />,
  BedDouble: <BedDouble size={28} />,
  UtensilsCrossed: <UtensilsCrossed size={28} />,
  HeartPulse: <HeartPulse size={28} />,
  CreditCard: <CreditCard size={28} />,
  Trophy: <Trophy size={28} />,
  Mic: <Mic size={28} />,
  Bus: <Bus size={28} />,
  Wifi: <Wifi size={28} />,
  Shield: <Shield size={28} />,
  Zap: <Zap size={28} />,
}

export default function CampusFacilitiesTemplate() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered =
    activeCategory === "All"
      ? campusFacilities.facilities
      : campusFacilities.facilities.filter((f) => f.category === activeCategory)

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .cf-hero {
          position: relative;
          background-image: url('/banners/hostel banner.jpg');
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }
        .cf-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
          pointer-events: none;
        }
        .cf-hero > * {
          position: relative;
          z-index: 2;
        }
        .cf-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
          text-shadow: '0 2px 8px rgba(0,0,0,0.6)';
        }
        .cf-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
          text-shadow: '0 2px 8px rgba(0,0,0,0.6)';
        }
        .cf-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .cf-breadcrumb a:hover {
          opacity: 0.8;
        }
        .cf-breadcrumb span {
          color: #FFE619;
        }
        .cf-stats-bar {
          background: #2B3490;
          padding: 32px 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .cf-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .cf-stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 230, 25, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFE619;
        }
        .cf-stat-number {
          font-family: "Rajdhani", sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #FFE619;
        }
        .cf-stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .cf-filters {
          display: flex;
          gap: 12px;
          margin-top: 40px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        .cf-filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          font-size: 13px;
          font-weight: 600;
          font-family: "Rajdhani", sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cf-filter-btn.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .cf-filter-btn:hover {
          border-color: #2B3490;
        }
        .cf-facility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .cf-facility-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .cf-facility-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43, 52, 144, 0.12);
        }
        .cf-facility-icon {
          width: 48px;
          height: 48px;
          background: #eef1ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2B3490;
        }
        .cf-facility-card h3 {
          font-family: "Rajdhani", sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
        }
        .cf-facility-card p {
          font-size: 13px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
        .cf-category-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
          margin-top: 8px;
        }
        .cf-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .cf-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .cf-contact-item p {
          font-size: 14px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .cf-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .cf-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .cf-contact-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      {/* HERO */}
      <section className="cf-hero" style={{ backgroundImage: `url('/banners/campus.jpg')` }}>
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="cf-eyebrow" style={{ marginBottom: 16 }}>
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
                textShadow: '0 2px 12px rgba(0,0,0,0.7)',
              }}
            >
              {campusFacilities.pageTitle}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 18,
                lineHeight: 1.6,
                margin: "16px 0 0",
                fontWeight: 300,
                maxWidth: '100%',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {campusFacilities.subtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="cf-breadcrumb" style={{ marginBottom: 16 }}>
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/campus-life">Campus Life</Link>
              <span>/</span>
              <span>{campusFacilities.pageTitle}</span>
            </motion.div>
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
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              {campusFacilities.intro}
            </p>
          </motion.div>
        </Container>
      </section>

      {/* INFRASTRUCTURE VIDEOS */}
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
                color: "#2B3490",
                margin: "0 0 40px",
              }}
            >
              Campus Infrastructure Tours
            </motion.h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              marginTop: 40,
            }}>
              <motion.div variants={fadeUp} style={{ borderRadius: "8px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
                  <source src="/videos/Main Block.mp4" type="video/mp4" />
                </video>
              </motion.div>
              <motion.div variants={fadeUp} style={{ borderRadius: "8px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
                  <source src="/videos/Civil Block.mp4" type="video/mp4" />
                </video>
              </motion.div>
              <motion.div variants={fadeUp} style={{ borderRadius: "8px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
                  <source src="/videos/Mechanical Block.mp4" type="video/mp4" />
                </video>
              </motion.div>
              <motion.div variants={fadeUp} style={{ borderRadius: "8px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
                  <source src="/videos/Block E.mp4" type="video/mp4" />
                </video>
              </motion.div>
              <motion.div variants={fadeUp} style={{ borderRadius: "8px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
                  <source src="/videos/Sliver Jubilee Block.mp4" type="video/mp4" />
                </video>
              </motion.div>
              <motion.div variants={fadeUp} style={{ borderRadius: "8px", overflow: "hidden" }}>
                <video autoPlay loop muted playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
                  <source src="/videos/KOR Auditorium.mp4" type="video/mp4" />
                </video>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* STATS */}
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
              Campus Overview
            </motion.h2>

            <motion.div variants={stagger} className="cf-stats-bar">
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">📏</div>
                <div className="cf-stat-number">{campusFacilities.stats.campusArea}</div>
                <div className="cf-stat-label">Campus Area</div>
              </motion.div>
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">🏢</div>
                <div className="cf-stat-number">{campusFacilities.stats.buildings}</div>
                <div className="cf-stat-label">Buildings</div>
              </motion.div>
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">🔬</div>
                <div className="cf-stat-number">{campusFacilities.stats.labs}</div>
                <div className="cf-stat-label">Labs</div>
              </motion.div>
              <motion.div variants={fadeUp} className="cf-stat-item">
                <div className="cf-stat-icon">🏫</div>
                <div className="cf-stat-number">{campusFacilities.stats.classrooms}</div>
                <div className="cf-stat-label">Classrooms</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* FACILITIES WITH FILTER */}
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
              Campus Facilities
            </motion.h2>

            <motion.div variants={fadeUp} className="cf-filters">
              {campusFacilities.categories.map((cat) => (
                <button
                  key={cat}
                  className={`cf-filter-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            <div className="cf-facility-grid">
              {filtered.map((facility, idx) => (
                <motion.div key={idx} variants={fadeUp} className="cf-facility-card">
                  <div className="cf-facility-icon">{iconMap[facility.icon]}</div>
                  <h3>{facility.name}</h3>
                  <p>{facility.description}</p>
                  <div className="cf-category-badge">{facility.category}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* FACILITIES GALLERY */}
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
              Explore Our Facilities
            </motion.h2>

            {/* LABS GALLERY */}
            <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#2B3490",
                margin: "0 0 20px",
              }}>
                🔬 Laboratories
              </h3>
              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {getImagesByCategory("Labs").slice(0, 3).map((img, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    style={{
                      position: "relative",
                      height: 200,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(43,52,144,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* LIBRARY GALLERY */}
            <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#2B3490",
                margin: "0 0 20px",
              }}>
                📚 Library
              </h3>
              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {getImagesByCategory("Library").map((img, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    style={{
                      position: "relative",
                      height: 200,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(43,52,144,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* SPORTS GALLERY */}
            <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#2B3490",
                margin: "0 0 20px",
              }}>
                🏆 Sports & Grounds
              </h3>
              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {getImagesByCategory("Sports").map((img, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    style={{
                      position: "relative",
                      height: 200,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(43,52,144,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* EVENTS GALLERY */}
            <motion.div variants={fadeUp} style={{ marginBottom: 56 }}>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#2B3490",
                margin: "0 0 20px",
              }}>
                🎉 Events & Activities
              </h3>
              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {getImagesByCategory("Events").slice(0, 3).map((img, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    style={{
                      position: "relative",
                      height: 200,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(43,52,144,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* TRANSPORT */}
            <motion.div variants={fadeUp}>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#2B3490",
                margin: "0 0 20px",
              }}>
                🚌 Transportation
              </h3>
              <motion.div
                variants={stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {getImagesByCategory("Transport").map((img, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    style={{
                      position: "relative",
                      height: 200,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(43,52,144,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
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
            className="cf-contact-card"
          >
            <div className="cf-contact-item">
              <h4>{campusFacilities.contact.office}</h4>
              <p>For questions about campus facilities and infrastructure</p>
            </div>
            <div className="cf-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${campusFacilities.contact.phone}`}>{campusFacilities.contact.phone}</a>
              </p>
            </div>
            <div className="cf-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${campusFacilities.contact.email}`}>{campusFacilities.contact.email}</a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
