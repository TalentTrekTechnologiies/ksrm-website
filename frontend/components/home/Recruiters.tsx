"use client"

import Container from "@/components/ui/Container"
import { recruitersData } from "@/data/home"

export default function Recruiters() {
  return (
    <section
      className="recruiters-section"
      style={{
        width: "100%",
        background: "#ffffff",
        borderTop: "1px solid #f1f5f9",
        padding: "48px 0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

        .recruiters-section { box-sizing: border-box; }

        .recruiters-header {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 14px;
          padding: 32px 40px;
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
        }

        .recruiters-header-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          flex: 1;
        }

        .recruiters-header-title span {
          color: #FFE619;
        }

        .recruiters-badge {
          background: #FFE619;
          color: #1a1a2e;
          padding: 20px 28px;
          border-radius: 10px;
          font-family: 'Rajdhani', sans-serif;
          text-align: center;
          white-space: nowrap;
        }

        .recruiters-badge-value {
          font-size: 32px;
          font-weight: 700;
          display: block;
          line-height: 1;
          margin-bottom: 4px;
        }

        .recruiters-badge-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .recruiter-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: marquee-scroll 25s linear infinite;
        }

        .recruiter-marquee:hover .recruiter-track {
          animation-play-state: paused;
        }

        .recruiter-item {
          width: 140px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          padding: 12px;
          flex-shrink: 0;
        }

        .recruiter-item img {
          width: 85%;
          height: 85%;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 1024px) {
          .recruiters-header {
            flex-direction: column;
            text-align: center;
            padding: 24px 32px;
          }
          .recruiters-header-title {
            font-size: 26px;
          }
          .recruiter-item { width: 130px; height: 75px; }
        }

        @media (max-width: 640px) {
          .recruiters-header {
            padding: 20px 16px;
            margin-bottom: 24px;
          }
          .recruiters-header-title {
            font-size: 20px;
          }
          .recruiter-item { width: 110px; height: 65px; }
          .recruiters-badge {
            padding: 16px 20px;
          }
          .recruiters-badge-value { font-size: 24px; }
        }
      `}</style>

      <Container>
        {/* HEADER WITH BADGE */}
        <div className="recruiters-header">
          <h2 className="recruiters-header-title">
            Recruited by <span>200+ Top Companies</span>
          </h2>
          <div className="recruiters-badge">
            <span className="recruiters-badge-value">90%</span>
            <span className="recruiters-badge-label">Placement Rate</span>
          </div>
        </div>

        {/* RECRUITER LOGOS MARQUEE */}
        <div className="recruiter-marquee" style={{ overflow: "hidden", width: "100%" }}>
          <div className="recruiter-track">
            {[...recruitersData.recruiters, ...recruitersData.recruiters].map((recruiter, i) => (
              <div key={i} className="recruiter-item">
                <img
                  src={recruiter.logo}
                  alt={recruiter.name}
                  title={recruiter.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0.3"
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
