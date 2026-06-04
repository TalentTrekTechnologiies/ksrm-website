"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function Header() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
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

  return (
    <div style={{ width: "100%" }}>
      <style>{`
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

        /* ── SINGLE HEADER ROW ── */
        .header-tier-1 {
          width: 100%;
          background: #ffffff;
          padding: 10px 4%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(12px, 2vw, 40px);
        }

        .header-identity-group {
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          color: inherit;
          border: none;
          outline: none;
          min-width: 0;
          flex-shrink: 1;
        }

        .header-logo {
          width: clamp(48px, 6vw, 120px);
          height: clamp(48px, 6vw, 120px);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }

        .header-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: transparent;
          border: none;
        }

        .header-text-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: auto;
          min-width: 0;
        }

        .header-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.4rem, 2.2vw, 2.8rem);
          font-weight: 700;
          color: #E8112D;
          line-height: 1;
          letter-spacing: 1px;
          margin: 0;
          white-space: nowrap;
          overflow: visible;
          text-transform: uppercase;
        }

        .header-subtitle {
          font-size: 14px;
          color: #555;
          letter-spacing: 0;
          line-height: 1.4;
          margin: 0;
          white-space: normal;
          overflow: visible;
        }

        /* Mobile-only header versions */
        .header-mobile-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #E8112D;
          line-height: 1;
          letter-spacing: 0.5px;
          margin: 0;
          display: none;
        }

        .header-mobile-college {
          font-size: 11px;
          font-weight: 600;
          color: #333;
          letter-spacing: 0.3px;
          line-height: 1;
          margin: 0;
          display: none;
        }

        .header-mobile-subtitle {
          font-size: 8px;
          color: #888;
          letter-spacing: 0.3px;
          line-height: 1;
          margin: 0;
          display: none;
        }

        /* Show mobile versions on mobile, hide desktop versions */
        @media (max-width: 768px) {
          .header-title {
            display: none;
          }
          .header-subtitle {
            display: none;
          }
          .header-mobile-title {
            display: block;
          }
          .header-mobile-college {
            display: block;
          }
          .header-mobile-subtitle {
            display: block;
          }
        }

        .header-badges-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .header-badges-left {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-shrink: 0;
        }

        .header-badges-right {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-shrink: 0;
        }

        .header-badge-wrapper {
          position: relative;
          width: clamp(34px, 4.5vw, 90px);
          height: clamp(34px, 4.5vw, 90px);
          flex-shrink: 0;
        }

        .header-badge-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-badge-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .header-badge-wrapper[data-badge="GNAN"] .header-badge-img {
          transform: scale(2);
        }

        .header-badge-wrapper[data-badge="KSNR"] .header-badge-img {
          transform: scale(1.2);
        }

        /* ── BOTTOM BORDER ── */
        .header-bottom-border {
          width: 100%;
          height: 3px;
          background: #2B3490;
        }

        /* ── RESPONSIVE: ULTRA-WIDE / THEATRE SCREEN (>1920px) ── */
        @media (min-width: 1921px) {
          .header-tier-1 {
            padding: 12px 4%;
          }
          .header-identity-group {
            gap: 18px;
          }
          .header-badges-row {
            gap: 12px;
          }
        }

        /* ── RESPONSIVE: LARGE DESKTOP (1440px - 1920px) ── */
        @media (max-width: 1920px) and (min-width: 1441px) {
          .header-tier-1 {
            padding: 11px 4%;
          }
          .header-identity-group {
            gap: 16px;
          }
          .header-badges-row {
            gap: 11px;
          }
        }

        /* ── RESPONSIVE: STANDARD DESKTOP (1024px - 1440px) ── */
        @media (max-width: 1440px) and (min-width: 1025px) {
          .header-tier-1 {
            padding: 10px 4%;
          }
          .header-identity-group {
            gap: 16px;
          }
          .header-badges-row {
            gap: 10px;
          }
        }

        /* ── RESPONSIVE: TABLET LANDSCAPE (768px - 1024px) ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .header-tier-1 {
            padding: 10px 4%;
          }
          .header-identity-group {
            gap: 14px;
          }
          .header-badges-row {
            gap: 9px;
          }
        }

        /* ── RESPONSIVE: MOBILE COMPACT (≤768px) ── */
        @media (max-width: 768px) {
          .header-tier-1 {
            display: flex;
            padding: 6px 5%;
            gap: 8px;
            flex-wrap: nowrap;
            justify-content: space-between;
            align-items: center;
          }
          .header-logo {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }
          .header-identity-group {
            gap: 4px;
            flex-shrink: 1;
            min-width: 0;
          }
          .header-text-block {
            gap: 1px;
          }
          .header-mobile-title {
            font-size: 20px;
            line-height: 1.05;
          }
          .header-mobile-college {
            font-size: 10px;
            line-height: 1;
          }
          .header-mobile-subtitle {
            font-size: 8px;
            line-height: 1;
          }
          .header-badges-row {
            width: auto;
            gap: 6px;
            justify-content: flex-end;
            flex-shrink: 0;
          }
        }

        /* ── RESPONSIVE: SMALL PHONE (≤480px) ── */
        @media (max-width: 480px) {
          .header-tier-1 {
            display: flex;
            padding: 5px 5%;
            gap: 6px;
            flex-wrap: nowrap;
            justify-content: space-between;
          }
          .header-logo {
            width: 36px;
            height: 36px;
          }
          .header-identity-group {
            gap: 3px;
            flex-shrink: 1;
            min-width: 0;
          }
          .header-mobile-title {
            font-size: 18px;
            line-height: 1;
          }
          .header-mobile-college {
            font-size: 9px;
            line-height: 1;
          }
          .header-mobile-subtitle {
            font-size: 7.5px;
          }
          .header-badges-row {
            width: auto;
            gap: 4px;
            justify-content: flex-end;
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* SINGLE HEADER ROW - OPTION C: CLEAN ORIGINAL LAYOUT */}
      <div className="header-tier-1">
        {/* LEFT: Logo + Name (enlarged) */}
        <Link href="/" className="header-identity-group">
          {/* Logo with load animation */}
          <div
            className="header-logo"
            style={{
              transform: loaded ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(-8deg)",
              opacity: loaded ? 1 : 0,
              transition: "all 0.9s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <img
              src="/logo.png"
              alt="KSRM Logo"
              className="header-logo-img"
            />
          </div>

          {/* Text block with slide-in animation */}
          <div
            className="header-text-block"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateX(0)" : "translateX(-25px)",
              transition: "all 0.8s ease 0.2s",
            }}
          >
            {/* Desktop version - full name and address lines */}
            <h1 className="header-title">KSRM College of Engineering</h1>
            <p className="header-subtitle">
              (UGC – Autonomous) | Kadapa, Andhra Pradesh<br />
              Approved by AICTE | Affiliated to JNTUA
            </p>

            {/* Mobile version - short name, college type, and short address */}
            <h1 className="header-mobile-title">KSRM</h1>
            <p className="header-mobile-college">College of Engineering</p>
            <p className="header-mobile-subtitle">UGC Autonomous · Kadapa, AP</p>
          </div>
        </Link>

        {/* RIGHT: All 5 Accreditation Badges */}
        <div className="header-badges-row">
          {badges.map((badge) => (
            <div key={badge.label} className="header-badge-wrapper" data-badge={badge.label}>
              <div className="header-badge-circle">
                <img
                  src={badge.src}
                  alt={badge.label}
                  className="header-badge-img"
                />
              </div>

              {/* PETAL SHOWER — KSNR only */}
              {badge.memorial && showerPetals.map((p, i) => (
                <span key={i} style={{
                  position: "absolute",
                  left: p.left,
                  top: "-15px",
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
      </div>

      {/* Bottom border */}
      <div className="header-bottom-border" />
    </div>
  )
}
