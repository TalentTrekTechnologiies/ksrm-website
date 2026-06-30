"use client"

import Link from "next/link"
import Container from "@/components/ui/Container"
import { homeData } from "@/data/home"

export default function Departments() {
  return (
    <section style={{ width: "100%", background: "#ffffff", padding: "60px 0", borderTop: "1px solid #f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');

        .depts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 40px 0 0;
        }

        .dept-card {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .dept-card:hover {
          border-color: #2B3490;
          box-shadow: 0 8px 24px rgba(43, 52, 144, 0.1);
        }

        .dept-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: #f5f7fb;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dept-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .dept-code {
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #FFE619;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .dept-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .dept-hod {
          font-size: 13px;
          color: #666;
          margin-bottom: 16px;
        }

        .dept-link {
          color: #2B3490;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.2s;
        }

        .dept-link:hover {
          color: #FFE619;
        }

        @media (max-width: 1024px) {
          .depts-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        @media (max-width: 640px) {
          .depts-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .dept-card { padding: 16px; }
          .dept-name { font-size: 14px; }
        }

        @media (max-width: 480px) {
          .depts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase", margin: 0 }}>
            ACADEMICS
          </p>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "36px", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 8px" }}>
            Our Departments
          </h2>
          <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
            Seven departments. Decades of academic excellence.
          </p>
        </div>

        {/* DEPARTMENTS GRID */}
        <div className="depts-grid">
          {(Array.isArray(homeData?.departments) ? homeData.departments : []).map((dept) => (
            <div key={dept.code}>
              <Link href={dept.link} style={{ textDecoration: "none" }}>
                <div className="dept-card">
                  <div className="dept-icon">
                    <img src={dept.svg} alt={dept.code} />
                  </div>
                  <div className="dept-code">{dept.code}</div>
                  <div className="dept-name">{dept.name}</div>
                  <div className="dept-hod">{dept.hod}</div>
                  <div className="dept-link">Explore →</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
