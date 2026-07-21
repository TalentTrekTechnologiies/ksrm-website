"use client"

import Link from "next/link"
import Container from "@/components/ui/Container"
import { homeData } from "@/data/home"
import { getDepartmentsPublic } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

interface DisplayDept {
  key: string
  name: string
  link: string
  svg: string
}

const FALLBACK_DEPARTMENTS: DisplayDept[] = (Array.isArray(homeData?.departments) ? homeData.departments : []).map(
  (d) => ({ key: d.code, name: d.name, link: d.link, svg: d.svg }),
)

interface DepartmentsState {
  hidden: boolean
  departments: DisplayDept[]
}

async function fetchDepartments(): Promise<DepartmentsState> {
  const { visible, items } = await getDepartmentsPublic()
  if (!visible) return { hidden: true, departments: FALLBACK_DEPARTMENTS }
  if (items.length === 0) return { hidden: false, departments: FALLBACK_DEPARTMENTS }
  return {
    hidden: false,
    departments: items.map((d) => ({ key: String(d.id), name: d.title, link: d.linkUrl, svg: d.imageUrl })),
  }
}

export default function Departments() {
  const live = useLiveData(fetchDepartments, [])
  const hidden = live?.hidden ?? false
  const departments = live?.departments ?? FALLBACK_DEPARTMENTS

  if (hidden) return null

  return (
    <section style={{ width: "100%", background: "#ffffff", padding: "40px 0", borderTop: "1px solid #f1f5f9" }}>
      <style>{`
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
          overflow: hidden;
          text-align: center;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .dept-card:hover {
          border-color: #2B3490;
          box-shadow: 0 8px 24px rgba(43, 52, 144, 0.1);
          transform: translateY(-4px);
        }

        /* contain, not cover: these are posters/artwork whose whole frame
           matters. cover filled the 150px box by cropping, so each image lost
           a different amount depending on its aspect ratio - which is why they
           looked inconsistent and cut off. contain shows every image complete;
           the neutral background fills whatever space is left over so the
           cards still line up. */
        .dept-icon {
          width: 100%;
          height: 150px;
          padding: 0;
          margin: 0;
          overflow: hidden;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dept-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .dept-code {
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #FFE619;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .dept-content {
          padding: 16px 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .dept-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .dept-hod {
          font-size: 15px;
          color: #666;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .dept-link {
          color: #2B3490;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
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
          .dept-name { font-size: 16px; }
        }

        @media (max-width: 480px) {
          .depts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase", margin: 0 }}>
            ACADEMICS
          </p>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "36px", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 8px" }}>
            Our Departments
          </h2>
          <p style={{ fontSize: "16px", color: "#888", margin: 0 }}>
            Seven departments. Decades of academic excellence.
          </p>
        </div>

        {/* DEPARTMENTS GRID */}
        <div className="depts-grid">
          {departments.map((dept) => (
            <div key={dept.key}>
              <Link href={dept.link} style={{ textDecoration: "none" }}>
                <div className="dept-card">
                  <div className="dept-icon">
                    <img src={dept?.svg} alt={dept?.name} />
                  </div>
                  <div className="dept-content">
                    <div className="dept-name">{dept?.name}</div>
                    <div className="dept-link">Explore →</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
