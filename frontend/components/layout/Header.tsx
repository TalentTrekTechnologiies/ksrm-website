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
          color: #d6001c;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.1;
          font-family: 'Rajdhani', sans-serif;
          letter-spacing: 1px;
        }

        .header-center p {
          margin: 5px 0;
          font-size: 1.2rem;
          color: #444;
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
          .header-center p {
            font-size: 1.3rem;
          }
        }

        /* Mobile Adjustments (991px Breakpoint) */
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
            font-size: 1.8rem;
          }

          .header-center p {
            font-size: 1rem;
          }

          .header-right {
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-left: 0;
            flex: 1;
          }

          /* Balanced mobile dimensions */
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

        /* Small Screen Fine-Tuning */
        @media (max-width: 768px) {
          .top-header {
            padding: 12px 16px;
            gap: 12px;
          }
          .header-left {
            flex: 0 0 145px;
          }
          .header-left img {
            width: 125px;
          }
          .header-center h1 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .top-header {
            padding: 10px 12px;
            gap: 10px;
          }
          .header-left {
            flex: 0 0 120px;
          }
          .header-left img {
            width: 105px;
          }
          .header-center h1 {
            font-size: 1.2rem;
          }
        }
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
          <h1>KSRM COLLEGE OF ENGINEERING</h1>
          <p>(UGC - Autonomous) | Kadapa, Andhra Pradesh</p>
          <p>Approved by AICTE | Affiliated to JNTUA</p>
        </div>

        {/* Right - Proportional Ribbon Layout with Breathing Space */}
        <div className="header-right">
          <img src="/nba.png" alt="NBA Accreditation" className="logo-nba" />
          <img src="/naac.png" alt="NAAC Accreditation" className="logo-naac" />
          <img src="/jntua.png" alt="JNTUA Affiliation" className="logo-jntua" />
          <img src="/ksnr.png" alt="KSNR Memorial" className="logo-ksnr" />
          <img src="/gnan.png" alt="Gnan" className="logo-gnan" />
        </div>
      </header>

      {/* Bottom border */}
      <div style={{ width: "100%", height: "3px", background: "#2B3490" }} />
    </div>
  )
}