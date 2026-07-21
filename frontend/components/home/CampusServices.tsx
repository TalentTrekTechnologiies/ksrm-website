"use client"

import Link from "next/link"
import Container from "@/components/ui/Container"
import { getQuickLinksPublic, QuickLink } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const FALLBACK_SERVICES = [
  { id: -1, poster: "/posters/admissions.jpg", title: "Admissions", desc: "Apply & eligibility", link: "/admissions" },
  { id: -2, poster: "/posters/examinations.jpg", title: "Examinations", desc: "Results & timetables", link: "/examinations" },
  { id: -3, poster: "/posters/placements.jpg", title: "Placements", desc: "Careers & recruiters", link: "/placements" },
  { id: -4, poster: "/posters/library.jpg", title: "Library", desc: "E-resources & OPAC", link: "/campus-life/library" },
  { id: -5, poster: "/posters/syllabus.jpg", title: "Syllabus", desc: "Download by semester", link: "/academics" },
  { id: -6, poster: "/posters/student-portal.jpg", title: "Student Portal", desc: "Login portal", link: "/contact" },
  { id: -7, poster: "/posters/alumni.jpg", title: "Alumni", desc: "Network & events", link: "/alumni" },
  { id: -8, poster: "/posters/research.jpg", title: "Research", desc: "Publications & R&D", link: "/research" },
]

const FALLBACK_BY_TITLE = new Map(
  FALLBACK_SERVICES.map((service) => [service.title.toLowerCase(), service]),
)

function normalizeService(service: QuickLink) {
  const fallback = FALLBACK_BY_TITLE.get(service.title.trim().toLowerCase())

  return {
    id: service.id,
    poster: service.imageUrl?.trim() || fallback?.poster || "/posters/admissions.jpg",
    title: service.title.trim() || fallback?.title || "Campus Service",
    desc: service.description?.trim() || fallback?.desc || "",
    link: service.linkUrl?.trim() || fallback?.link || "/",
  }
}

async function fetchServices() {
  const data = await getQuickLinksPublic("homepage_quick_links")
  if (data.length === 0) return FALLBACK_SERVICES
  return data.map(normalizeService)
}

export default function CampusServices() {
  const services = useLiveData(fetchServices, [], { initialValue: FALLBACK_SERVICES }) ?? FALLBACK_SERVICES

  return (
    <section
      className="services-section"
      style={{ width: "100%", background: "#ffffff", padding: "38px 0", borderTop: "1px solid #f1f5f9" }}
    >
      <style>{`
        .services-section { box-sizing: border-box; }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 32px 0 0;
        }

        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .services-section { padding: 32px 0 !important; }
          .services-grid    { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        @media (max-width: 380px) {
          .services-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
      {/* SECTION HEADER */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "14px", fontWeight: 700, letterSpacing: "2px",
          color: "#2B3490", textTransform: "uppercase",
        }}>
          QUICK ACCESS
        </div>
        <h2 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "32px", fontWeight: 700,
          color: "#1a1a2e", margin: "8px 0 0",
        }}>
          Digital Campus Services
        </h2>
      </div>

      {/* CARDS GRID */}
      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id}>
            <Link href={service.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
              <div style={{
                background: "#ffffff",
                border: "1px solid #eef0f3",
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                height: "100%",
                boxSizing: "border-box",
              }}>
                {/* Poster fills the card edge-to-edge (cover), matching the
                    department cards. */}
                <div style={{
                  padding: 0,
                  height: "150px",
                  overflow: "hidden",
                  background: "#f1f5f9",
                }}>
                  <img
                    src={service.poster}
                    alt={service.title ?? "Service"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>

                {/* Label strip - tinted with a gold rule, matching the
                    department cards, so it isn't a blank white block. */}
                <div style={{
                  padding: "14px 16px 16px",
                  textAlign: "center",
                  flex: 1,
                  background: "linear-gradient(180deg, #ffffff 0%, #f4f6fb 100%)",
                  borderTop: "3px solid #FFE619",
                }}>
                  <div style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "#2B3490",
                    marginBottom: "6px",
                    letterSpacing: "0.3px",
                  }}>
                    {service.title}
                  </div>
                  <div style={{
                    fontSize: "15px",
                    color: "#888",
                  }}>
                    {service.desc}
                  </div>
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
