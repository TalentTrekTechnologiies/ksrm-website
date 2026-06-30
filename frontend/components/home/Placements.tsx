"use client"

import Container from "@/components/ui/Container"
import { homeData } from "@/data/home"

export default function Placements() {
  return (
    <section style={{ width: "100%", background: "#f8f9fa", padding: "80px 0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

        .placements-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 60px;
        }

        .stat-box {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          padding: 40px 24px;
          border-radius: 12px;
          text-align: center;
          border: none;
        }

        .stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
        }

        .photo-carousel {
          margin-bottom: 60px;
          overflow: hidden;
        }

        .carousel-title {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #2B3490;
          margin-bottom: 32px;
          font-family: 'Rajdhani', sans-serif;
        }

        .photo-track {
          display: flex;
          gap: 16px;
          animation: scroll 30s linear infinite;
        }

        .photo-item {
          flex-shrink: 0;
          width: 280px;
          height: 200px;
          border-radius: 10px;
          overflow: hidden;
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .photo-carousel:hover .photo-track {
          animation-play-state: paused;
        }

        .recruiter-section {
          background: white;
          padding: 48px 0;
          border-radius: 12px;
        }

        .recruiter-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          padding: 32px 40px;
          border-radius: 12px;
        }

        .recruiter-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: white;
          flex: 1;
        }

        .recruiter-badge {
          background: #FFE619;
          color: #1a1a2e;
          padding: 20px 28px;
          border-radius: 10px;
          text-align: center;
          font-family: 'Rajdhani', sans-serif;
        }

        .badge-value {
          font-size: 28px;
          font-weight: 700;
          display: block;
        }

        .badge-label {
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
        }

        .recruiter-track {
          display: flex;
          gap: 20px;
          animation: scroll 25s linear infinite;
        }

        .recruiter-logo {
          flex-shrink: 0;
          width: 160px;
          height: 100px;
          background: white;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .recruiter-logo img {
          width: 90%;
          height: 90%;
          object-fit: contain;
          filter: brightness(1.15) contrast(1.05);
        }

        .recruiter-carousel:hover .recruiter-track {
          animation-play-state: paused;
        }

        @media (max-width: 1024px) {
          .placements-stats { grid-template-columns: repeat(2, 1fr); }
          .photo-item { width: 220px; height: 160px; }
          .recruiter-logo { width: 140px; height: 90px; }
        }

        @media (max-width: 640px) {
          .placements-stats { grid-template-columns: 1fr; }
          .photo-item { width: 100%; height: 200px; }
          .recruiter-header { flex-direction: column; }
        }
      `}</style>

      <Container>
        {/* HEADING */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", letterSpacing: "3px", color: "#2B3490", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
            TRAINING & PLACEMENTS
          </p>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "40px", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 8px" }}>
            Where Talent Meets Opportunity
          </h2>
          <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
            Join 1200+ graduates placed at India's top companies
          </p>
        </div>

        {/* STATS */}
        <div className="placements-stats">
          {(Array.isArray(homeData?.placements?.stats) ? homeData.placements.stats : []).map((stat) => (
            <div key={stat.label} className="stat-box">
              <div className="stat-number">
                {stat.number}{stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* PHOTO CAROUSEL */}
        <div className="photo-carousel">
          <div className="carousel-title">2025 Placements</div>
          <div style={{ overflow: "hidden" }}>
            <div className="photo-track">
              {(Array.isArray(homeData?.placements?.posters) ? [...homeData.placements.posters, ...homeData.placements.posters] : []).map((poster, i) => (
                <div key={i} className="photo-item">
                  <img src={poster} alt={`Placement ${i}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECRUITER SECTION */}
        <div className="recruiter-section">
          <div className="recruiter-header">
            <div className="recruiter-title">Recruited by <span style={{ color: "#FFE619" }}>200+ Top Companies</span></div>
            <div className="recruiter-badge">
              <span className="badge-value">90%</span>
              <span className="badge-label">Placement Rate</span>
            </div>
          </div>

          <div className="recruiter-carousel" style={{ overflow: "hidden" }}>
            <div className="recruiter-track">
              {(Array.isArray(homeData?.recruiters) ? [...homeData.recruiters, ...homeData.recruiters] : []).map((recruiter, i) => {
                const logo = recruiter?.logo ?? recruiter ?? '';
                const filename = logo.split('/').pop() || '';
                const encodedPath = `/recruiters/${encodeURIComponent(filename)}`;
                return (
                  <div key={i} className="recruiter-logo">
                    <img
                      src={encodedPath}
                      alt={recruiter?.name ?? ''}
                      title={recruiter?.name ?? ''}
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
