"use client"

import Image from "next/image"

export default function Header() {
  return (
    <div style={{ width: "100%" }}>
      <style>{`
        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 30px;
          background: #fff;
          gap: 15px;
          min-height: 120px;
        }

        .header-left {
          flex: 0 0 190px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-left img {
          width: 170px;
          height: auto;
          display: block;
        }

        /* Structured flex footprint for balanced spacing distribution */
        .header-center {
          flex: 0.9;
          padding-left: 10px;
        }

        .header-center h1 {
          margin: 0;
          color: #C8102E;
          font-size: clamp(1.5rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1;
          font-family: var(--font-arimo), Arial, Helvetica, sans-serif;
          letter-spacing: 0px;
        }

        .header-center p {
          margin: 4px 0 0 0;
          font-size: clamp(0.75rem, 1.5vw, 0.875rem);
          color: #4b5563;
          font-weight: 400;
          line-height: 1.4;
        }

        /* 12px gap + flex layout space to let the ribbon breathe */
        .header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-left: 40px;
          flex: 0.7;
          flex-shrink: 0;
        }

        .header-right img {
          width: auto;
          object-fit: contain;
        }

        /* Refined Optical Balancing Sizes */
        .logo-nba,
        .logo-naac,
        .logo-jntua {
          height: 100px;
        }

        .logo-ksnr {
          height: 115px;
        }

        .logo-gnan {
          height: 125px;
        }

        /* Large Screen Optimization */
        @media (min-width: 1400px) {
          .header-center h1 {
            font-size: 3rem;
          }
          .header-center p {
            font-size: 0.875rem;
          }
        }

        /* Tablet Adjustments (991px Breakpoint) */
        @media (max-width: 991px) {
          .top-header {
            flex-direction: column;
            text-align: center;
            padding: 15px;
          }

          .header-center {
            padding-left: 0;
            flex: 1;
          }

          .header-center h1 {
            font-size: 2.2rem;
            font-weight: 700;
            font-family: var(--font-arimo), Arial, Helvetica, sans-serif;
            color: #C8102E;
            line-height: 1;
          }

          .header-center p {
            font-size: 0.875rem;
            font-weight: 400;
            color: #4b5563;
          }

          .header-right {
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-left: 0;
            flex: 1;
          }

          /* Balanced dimensions */
          .logo-nba,
          .logo-naac,
          .logo-jntua {
            height: 65px;
          }

          .logo-ksnr {
            height: 75px;
          }

          .logo-gnan {
            height: 82px;
          }
        }

        /* MOBILE COMPACT HEADER (max-width: 768px) */
        @media (max-width: 768px) {
          .top-header {
            /* Logo + name in compact horizontal row */
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            padding: 10px 14px;
            gap: 10px;
            min-height: auto;
          }

          .header-left {
            flex: 0 0 auto;
            justify-content: flex-start;
          }

          .header-left img {
            width: 48px;
            height: 48px;
          }

          .header-center {
            padding-left: 0;
            flex: 1;
            min-width: 0;
          }

          .header-center h1 {
            font-size: 1.5rem;
            font-weight: 700;
            font-family: var(--font-arimo), Arial, Helvetica, sans-serif;
            line-height: 1;
            margin: 0;
            word-break: break-word;
            letter-spacing: 0px;
            color: #C8102E;
          }

          .header-center p {
            font-size: 0.75rem;
            margin: 3px 0 0 0;
            line-height: 1.3;
            color: #4b5563;
            font-weight: 400;
            display: none;
          }

          /* Show first line of tagline on larger phones */
          .header-center p:first-of-type {
            display: block;
            margin: 3px 0 0 0;
          }

          /* HIDE ACCREDITATION BADGES ON MOBILE - saves crucial vertical space */
          .header-right {
            display: none !important;
          }
        }

        /* Extra Small Screens (max-width: 480px) */
        @media (max-width: 480px) {
          .top-header {
            padding: 8px 12px;
            gap: 8px;
          }
          .header-left img {
            width: 44px;
            height: 44px;
          }
          .header-center h1 {
            font-size: 1.25rem;
            font-weight: 700;
            font-family: var(--font-arimo), Arial, Helvetica, sans-serif;
            color: #C8102E;
          }
          .header-center p:first-of-type {
            font-size: 0.7rem;
            font-weight: 400;
            color: #4b5563;
          }
        }

        /* KSNR Founder Logo - Special Tribute */
        .ksnr-tribute {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          padding: 4px;
        }
        .ksnr-tribute .ksnr-logo {
          transform: scale(1.08);
          filter: drop-shadow(0 0 10px rgba(255,179,71,.75));
          border-radius: 8px;
          position: relative;
          z-index: 1;
        }
        .ksnr-petal {
          position: absolute;
          top: -16px;
          font-size: 14px;
          line-height: 1;
          pointer-events: none;
          opacity: 0;
          z-index: 2;
          animation: ksnrFall linear infinite;
        }
        @keyframes ksnrFall {
          0%   { transform: translateY(-16px) translateX(0) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translateY(78px) translateX(12px) rotate(360deg); opacity: 0; }
        }
        .p1{left:6%;  animation-duration:3.2s; animation-delay:0s}
        .p2{left:20%; animation-duration:3.9s; animation-delay:.7s}
        .p3{left:34%; animation-duration:3.0s; animation-delay:1.3s}
        .p4{left:48%; animation-duration:4.1s; animation-delay:.4s}
        .p5{left:60%; animation-duration:3.5s; animation-delay:1.7s}
        .p6{left:74%; animation-duration:3.8s; animation-delay:1.0s}
        .p7{left:88%; animation-duration:3.1s; animation-delay:2.1s}
        .p8{left:42%; animation-duration:3.6s; animation-delay:2.5s}
        @media (prefers-reduced-motion: reduce){ .ksnr-petal{ display:none } }
      `}</style>

      {/* PREMIUM CLEAN 3-COLUMN HEADER */}
      <header className="top-header">
        {/* Left - College Logo */}
        <div className="header-left">
          <Image
            src="/logo.png"
            alt="KSRM Logo"
            width={170}
            height={170}
            priority
          />
        </div>

        {/* Center - College Name & Info */}
        <div className="header-center">
          <h1>K.S.R.M COLLEGE OF ENGINEERING</h1>
          <p>(UGC - Autonomous) | Kadapa, Andhra Pradesh</p>
          <p>Approved by AICTE | Affiliated to JNTUA</p>
        </div>

        {/* Right - Proportional Ribbon Layout with Breathing Space */}
        <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "10px", maxHeight: "170px", overflow: "hidden", marginLeft: "-40px" }}>
          <img src="/nba.png" alt="NBA Accreditation" style={{ height: "110px", width: "auto", objectFit: "contain" }} />
          <img src="/naac.png" alt="NAAC Accreditation" style={{ height: "110px", width: "auto", objectFit: "contain" }} />
          <img src="/jntua.png" alt="JNTUA Affiliation" style={{ height: "110px", width: "auto", objectFit: "contain" }} />
          <img src="/gnan.png" alt="Gnan" style={{ height: "110px", width: "auto", objectFit: "contain" }} />

          {/* KSNR Founder Logo - Special Tribute with Falling Petals */}
          <div className="ksnr-tribute">
            <span className="ksnr-petal p1">🌸</span>
            <span className="ksnr-petal p2">🌼</span>
            <span className="ksnr-petal p3">🌸</span>
            <span className="ksnr-petal p4">🏵️</span>
            <span className="ksnr-petal p5">🌸</span>
            <span className="ksnr-petal p6">🌼</span>
            <span className="ksnr-petal p7">🌸</span>
            <span className="ksnr-petal p8">🏵️</span>
            <img src="/ksnr.png" alt="KSNR Memorial" style={{ height: "150px", width: "auto", objectFit: "contain" }} className="ksnr-logo" />
          </div>
        </div>
      </header>

      {/* Bottom border */}
      <div style={{ width: "100%", height: "3px", background: "#2B3490" }} />
    </div>
  )
}