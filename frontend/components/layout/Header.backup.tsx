"use client"

import Link from "next/link"
import { useEffect, useState } from "react"


export default function Header() {
  const [loaded, setLoaded] = useState(false)
  const [tickerText, setTickerText] = useState("")

  useEffect(() => {
    setLoaded(true)
    fetch("http://localhost:4000/notifications")
      .then((r) => r.json())
      .then((data: { text: string }[]) => {
        if (data.length > 0)
          setTickerText(data.map((n) => n.text).join("   |   "))
      })
      .catch(() => {})
  }, [])

  const badges = [
    { src: "/nba.png",   label: "NBA",   memorial: false },
    { src: "/naac.png",  label: "NAAC",  memorial: false },
    { src: "/jntua.png", label: "JNTUA", memorial: false },
    { src: "/ksnr.png",  label: "KSNR",  memorial: true  },
    { src: "/gnan.png",  label: "GNAN",  memorial: false },
  ]

  const showerPetals = [
    { emoji: "🌸", size: "14px", duration: 2.8, delay: 0,    left: "8%",  anim: "petal-shower-a" },
    { emoji: "🌺", size: "12px", duration: 3.2, delay: 0.5,  left: "25%", anim: "petal-shower-b" },
    { emoji: "🌼", size: "15px", duration: 2.6, delay: 1.0,  left: "45%", anim: "petal-shower-c" },
    { emoji: "🌸", size: "11px", duration: 3.0, delay: 1.5,  left: "65%", anim: "petal-shower-d" },
    { emoji: "🌺", size: "13px", duration: 2.9, delay: 2.0,  left: "85%", anim: "petal-shower-a" },
    { emoji: "🌼", size: "14px", duration: 3.1, delay: 0.3,  left: "16%", anim: "petal-shower-b" },
    { emoji: "🌸", size: "12px", duration: 2.7, delay: 0.8,  left: "38%", anim: "petal-shower-c" },
    { emoji: "🌺", size: "13px", duration: 3.3, delay: 1.3,  left: "58%", anim: "petal-shower-d" },
    { emoji: "🌼", size: "11px", duration: 2.5, delay: 1.8,  left: "78%", anim: "petal-shower-a" },
    { emoji: "🌸", size: "15px", duration: 3.0, delay: 0.6,  left: "33%", anim: "petal-shower-b" },
  ]

  const defaultTicker =
    "Sem-End Exams May-June 2026 Preponed   |   M.Tech Supplementary Results Out   |   Graduation Day 2K26 Forms Open   |   KGCET-2K26 Results Announced"

  return (
    <div style={{ background: "#ffffff", borderBottom: "3px solid #2B3490", width: "100%" }}>
      <style>{`
        @keyframes ksrm-ticker {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes petal-shower-a {
          0%   { transform: translateY(-25px) rotate(-10deg); opacity: 0.9; }
          60%  { opacity: 0.7; }
          100% { transform: translateY(128px) translateX(12px) rotate(200deg); opacity: 0; }
        }
        @keyframes petal-shower-b {
          0%   { transform: translateY(-25px) rotate(20deg); opacity: 0.9; }
          60%  { opacity: 0.6; }
          100% { transform: translateY(122px) translateX(-15px) rotate(-170deg); opacity: 0; }
        }
        @keyframes petal-shower-c {
          0%   { transform: translateY(-25px) rotate(5deg); opacity: 0.9; }
          40%  { transform: translateY(50px) translateX(16px) rotate(80deg); opacity: 0.8; }
          100% { transform: translateY(125px) translateX(20px) rotate(180deg); opacity: 0; }
        }
        @keyframes petal-shower-d {
          0%   { transform: translateY(-25px) rotate(-25deg); opacity: 0.9; }
          50%  { transform: translateY(55px) translateX(-12px) rotate(-80deg); opacity: 0.7; }
          100% { transform: translateY(120px) translateX(-20px) rotate(-200deg); opacity: 0; }
        }

        .header-inner {
          width: 100%;
          margin: 0 auto;
          padding: 16px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: nowrap;
        }

        .header-logo-img   { width: 132px; height: 132px; }
        .header-title-ksrm { font-size: 48px; }

        .header-address {
          font-size: 13px;
          line-height: 1.5;
          font-weight: 500;
          color: #444;
        }

        .header-programs {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .header-badges {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 100%;
        }

        .header-badge-box  { width: clamp(2.25rem, 6.5vw, 6.25rem); height: clamp(2.25rem, 6.5vw, 6.25rem); }
        .header-badge-img  { width: 100%; height: 100%; object-fit: cover; }

        .header-ticker {
          overflow: hidden;
          border-top: 1px solid #e5e7eb;
          padding-top: 5px;
          width: 100%;
        }

        /* ── LARGE LAPTOP ≤1500px (covers 1366px, 1440px screens) ── */
        @media (max-width: 1500px) {
          .header-inner     { gap: 12px; padding: 12px 5% !important; }
          .header-logo-img  { width: 96px !important; height: 96px !important; }
          .header-title-ksrm{ font-size: 38px !important; }
          .header-address   { font-size: 11px !important; }
          .header-badges    { gap: 8px !important; }
          .header-badge-box { width: 76px !important; height: 76px !important; }
          .header-right     { gap: 8px !important; }
        }

        /* ── hide programs on narrower laptops ── */
        @media (max-width: 1250px) {
          .header-programs  { display: none !important; }
        }

        /* ── TABLET / SMALL LAPTOP ≤1100px ── */
        @media (max-width: 1100px) {
          .header-programs  { display: none !important; }
          .header-inner     { gap: 10px; padding: 10px 5% !important; }
          .header-logo-img  { width: 76px !important; height: 76px !important; }
          .header-title-ksrm{ font-size: 32px !important; }
          .header-address   { font-size: 10.5px !important; }
          .header-badges    { gap: 8px !important; }
          .header-badge-box { width: 62px !important; height: 62px !important; }
          .header-right     { gap: 6px !important; }
        }

        /* ── MOBILE ≤768px ── */
        @media (max-width: 768px) {
          .header-inner {
            flex-direction: row !important;
            align-items: center;
            padding: 7px 4% !important;
            flex-wrap: nowrap !important;
            gap: 6px;
            overflow-x: hidden;
          }
          .header-left-link  { gap: 8px !important; flex-shrink: 1 !important; min-width: 0; }
          .header-logo-img   { width: 40px !important; height: 40px !important; flex-shrink: 0; }
          .header-title-ksrm { font-size: 15px !important; letter-spacing: 0.5px !important; }
          .header-coe        { font-size: 8.5px !important; letter-spacing: 0 !important; text-decoration: none !important; }
          .header-address    { font-size: 7px !important; line-height: 1.35 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .header-left-text  { gap: 1px !important; min-width: 0; overflow: hidden; }
          .header-programs   { display: none !important; }
          .header-badges     { gap: 4px !important; flex-wrap: nowrap !important; }
          .header-badge-box  { width: 34px !important; height: 34px !important; }
          .header-right      { gap: 4px !important; flex-shrink: 0; }
          .header-ticker     { display: none !important; }
        }

        /* ── SMALL PHONE ≤480px ── */
        @media (max-width: 480px) {
          .header-inner      { gap: 4px !important; padding: 6px 3% !important; }
          .header-logo-img   { width: 36px !important; height: 36px !important; }
          .header-title-ksrm { font-size: 14px !important; }
          .header-coe        { font-size: 7.5px !important; text-decoration: none !important; letter-spacing: 0 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .header-address    { font-size: 6.5px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .header-badges     { gap: 2px !important; }
          .header-badge-box  { width: 28px !important; height: 28px !important; }
        }
      `}</style>

      <div className="header-inner">

        {/* LEFT: Logo + College Name */}
        <Link
          href="/"
          className="header-left-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
            flexShrink: 0,
            border: "none",
            outline: "none",
          }}
        >
          {/* COLLEGE LOGO */}
          <div
            style={{
              transform: loaded ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(-8deg)",
              opacity: loaded ? 1 : 0,
              transition: "all 0.9s cubic-bezier(0.34,1.56,0.64,1)",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="KSRM Logo"
              className="header-logo-img"
              style={{
                objectFit: "contain",
                background: "transparent",
                border: "none",
                boxShadow: "none",
                borderRadius: 0,
              }}
            />
          </div>

          {/* COLLEGE TEXT */}
          <div
            className="header-left-text"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateX(0)" : "translateX(-25px)",
              transition: "all 0.8s ease 0.2s",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <h1
              className="header-title-ksrm"
              style={{
                margin: 0,
                color: "#E8112D",
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "2px",
              }}
            >
              KSRM
            </h1>

            <div
              className="header-coe"
              style={{
                color: "#111",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              COLLEGE OF ENGINEERING
            </div>

            <div className="header-address">
              (UGC – Autonomous) | Kadapa, Andhra Pradesh – 516 005
              <br />
              Approved by AICTE | Affiliated to JNTUA, Ananthapuramu
            </div>
          </div>
        </Link>

        {/* CENTER: B.Tech Programs */}
        <div className="header-programs">
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "2.5px",
              color: "#2B3490",
              textTransform: "uppercase",
              textAlign: "center",
              borderBottom: "2px solid #FFE619",
              paddingBottom: "6px",
              width: "100%",
            }}
          >
            Also Offering
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "7px",
              justifyContent: "center",
              maxWidth: "240px",
            }}
          >
            {[
              { label: "PG Programs (MBA / M.Tech)", href: "/admissions" },
              { label: "POLYCET / Diploma",          href: "/admissions" },
              { label: "Ph.D Programs",              href: "/admissions" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  background: "#eef1ff",
                  color: "#2B3490",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "5px 11px",
                  borderRadius: "4px",
                  letterSpacing: "0.4px",
                  textDecoration: "none",
                  border: "1px solid #d4d9ff",
                  transition: "background 0.2s, color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = "#2B3490"
                  ;(e.currentTarget as HTMLAnchorElement).style.color = "#fff"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = "#eef1ff"
                  ;(e.currentTarget as HTMLAnchorElement).style.color = "#2B3490"
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: Badges + Scrolling ticker */}
        <div className="header-right">

          <div className="header-badges">
            {badges.map((badge, index) => (
              <div
                key={badge.label}
                style={{
                  textAlign: "center",
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "translateY(0)" : "translateY(30px)",
                  transition: `all 0.8s ease ${0.3 + index * 0.1}s`,
                  position: "relative",
                }}
              >
                <div
                  className="header-badge-box"
                  style={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "transparent",
                    margin: "0 auto",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <img src={badge.src} alt={badge.label} className="header-badge-img" />
                </div>

                {/* PETAL SHOWER — KSNR only */}
                {badge.memorial && showerPetals.map((p, i) => (
                  <span key={i} style={{
                    position: "absolute",
                    left: p.left,
                    top: "-20px",
                    fontSize: p.size,
                    lineHeight: 1,
                    pointerEvents: "none",
                    zIndex: 10,
                    animation: `${p.anim} ${p.duration}s ease-in ${p.delay}s infinite`,
                  }}>
                    {p.emoji}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* SCROLLING TICKER */}
          <div className="header-ticker">
            <span
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                animation: "ksrm-ticker 32s linear infinite",
                fontSize: "12px",
                color: "#E8112D",
                fontWeight: 600,
              }}
            >
              📢&nbsp;{tickerText || defaultTicker}
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}
