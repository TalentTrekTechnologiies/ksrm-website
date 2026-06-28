"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const btechPrograms = ["CSE", "AIML", "CSE (DS)", "ECE", "EEE", "CIVIL", "MECH"]

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
    { src: "/NBA.png",     label: "NBA",   memorial: false, sz: 110 },
    { src: "/naac.png",    label: "NAAC",  memorial: false, sz: 110 },
    { src: "/jntua.png",   label: "JNTUA", memorial: false, sz: 96  },
    { src: "/ksnr.png",    label: "KSNR",  memorial: true,  sz: 110 },
    { src: "/gnan.png",    label: "GNAN",  memorial: false, sz: 126 },
  ]

  const orbitPetals = [
    { emoji: "🌸", size: "15px", speed: 9, delay: 0      },
    { emoji: "🌺", size: "13px", speed: 9, delay: -1.125 },
    { emoji: "🌼", size: "16px", speed: 9, delay: -2.25  },
    { emoji: "🌸", size: "12px", speed: 9, delay: -3.375 },
    { emoji: "🌺", size: "15px", speed: 9, delay: -4.5   },
    { emoji: "🌼", size: "13px", speed: 9, delay: -5.625 },
    { emoji: "🌸", size: "14px", speed: 9, delay: -6.75  },
    { emoji: "🌺", size: "16px", speed: 9, delay: -7.875 },
  ]

  return (
    <div style={{ background: "#ffffff", borderBottom: "3px solid #2B3490" }}>
      <style>{`
        @keyframes ksrm-ticker {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes petal-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .header-inner {
          max-width: 1500px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: nowrap;
        }

        .header-logo-img {
          width: 132px;
          height: 132px;
        }

        .header-title-ksrm {
          font-size: 48px;
        }

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

        .header-badges {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-badge-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ── TABLET ── */
        @media (max-width: 1100px) {
          .header-programs { display: none; }
          .header-inner    { gap: 12px; }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .header-inner {
            flex-direction: column;
            align-items: center;
            padding: 14px 16px !important;
            flex-wrap: wrap;
            gap: 14px;
          }
          .header-logo-img   { width: 80px !important; height: 80px !important; }
          .header-title-ksrm { font-size: 34px !important; }
          .header-address    { font-size: 11px !important; }
          .header-programs   { display: none !important; }
          .header-badges {
            gap: 8px !important;
            width: 100%;
            justify-content: center !important;
          }
          .header-badge-box  { width: 60px !important; height: 60px !important; }
          .header-badge-label { font-size: 10px !important; }
        }
      `}</style>

      <div className="header-inner">

        {/* LEFT: Logo + College Name */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
            flexShrink: 0,
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

            {/* SCROLLING NOTIFICATIONS TICKER */}
            {tickerText && (
              <div
                style={{
                  marginTop: "5px",
                  overflow: "hidden",
                  width: "340px",
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "4px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    animation: "ksrm-ticker 30s linear infinite",
                    fontSize: "11px",
                    color: "#E8112D",
                    fontWeight: 600,
                  }}
                >
                  📢 {tickerText}
                </span>
              </div>
            )}
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
            B.Tech Programs
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
            {btechPrograms.map((prog) => (
              <Link
                key={prog}
                href="/admissions"
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
                {prog}
              </Link>
            ))}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#777",
              fontWeight: 600,
              textAlign: "center",
              paddingTop: "4px",
              borderTop: "1px solid #e5e7eb",
              width: "100%",
            }}
          >
            Also Offers: MBA (PG)
          </div>
        </div>

        {/* RIGHT: Accreditation Badges */}
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
                  width: `${badge.sz}px`,
                  height: `${badge.sz}px`,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "transparent",
                  margin: "0 auto",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={badge.src}
                  alt={badge.label}
                  className="header-badge-img"
                />
              </div>

              {/* MEMORIAL ORBIT — KSNR only */}
              {badge.memorial && orbitPetals.map((p, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: `${badge.sz / 2}px`,
                  left: "50%",
                  width: 0,
                  height: 0,
                  pointerEvents: "none",
                  zIndex: 10,
                  animation: `petal-orbit ${p.speed}s linear ${p.delay}s infinite`,
                }}>
                  <span style={{
                    position: "absolute",
                    left: `${badge.sz / 2 + 6}px`,
                    top: "-9px",
                    fontSize: p.size,
                    display: "block",
                    lineHeight: 1,
                  }}>{p.emoji}</span>
                </div>
              ))}

              <div
                className="header-badge-label"
                style={{
                  marginTop: "6px",
                  fontWeight: 600,
                  color: "#2B3490",
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                }}
              >
                {badge.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
