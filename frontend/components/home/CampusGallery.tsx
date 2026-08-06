"use client"

import Link from "next/link"
import { resolveFileUrl } from "@/lib/api-base";
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Container from "@/components/ui/Container"
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api"
import { useLiveData } from "@/lib/use-live-data"

const EASE = [0.22, 1, 0.36, 1] as const
const CATEGORY = "Campus Life"

// Shown immediately on first paint and kept if the API is unreachable, so
// the section never renders empty. Mirrors the real seeded gallery records.
const FALLBACK: { id: number; title: string; imageUrl: string }[] = [
  { id: -1, title: "Aerial Campus View", imageUrl: "/campus/aerial-campus.webp" },
  { id: -2, title: "Main Academic Building", imageUrl: "/campus/main-building.webp" },
  { id: -3, title: "Central Library", imageUrl: "/campus/central-library.webp" },
  { id: -4, title: "Robotics & 3D Printing Lab", imageUrl: "/campus/robotics-lab.webp" },
  { id: -5, title: "Seminar Hall", imageUrl: "/campus/seminar-hall.webp" },
  { id: -6, title: "Sports Ground", imageUrl: "/campus/sports-ground.webp" },
  { id: -7, title: "Cultural Fest", imageUrl: "/campus/cultural-fest.webp" },
  { id: -8, title: "Founder's Day", imageUrl: "/campus/founders-day.webp" },
]

async function fetchGallery() {
  const data = await getGalleryPublic(CATEGORY)
  if (!data.length) return FALLBACK
  return data.map((g: GalleryImage) => ({ id: g.id, title: g.title, imageUrl: resolveFileUrl(g.imageUrl) }))
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
const tileVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

export default function CampusGallery() {
  const images = useLiveData(fetchGallery, [], { initialValue: FALLBACK }) ?? FALLBACK
  // Uniform grid of 8 (2 rows of 4); the rest live on /gallery.
  const tiles = images.slice(0, 8)

  return (
    <section style={{ width: "100%", background: "#ffffff", padding: "44px 0", borderTop: "1px solid #f1f5f9" }}>
      <style>{`
        .cg-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 200px;
          gap: 16px;
          margin-top: 40px;
        }
        .cg-tile {
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid #eef0f3;
        }
        .cg-tile img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .cg-tile:hover img { transform: scale(1.06); }
        .cg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(14,21,51,0) 55%, rgba(14,21,51,0.78) 100%);
          display: flex; align-items: flex-end;
          padding: 14px;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .cg-tile:hover .cg-overlay { opacity: 1; }
        .cg-caption {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px; font-weight: 700; color: #fff;
          letter-spacing: 0.3px;
        }

        @media (max-width: 1024px) { .cg-grid { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 180px; } }
        @media (max-width: 640px)  { .cg-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 150px; gap: 12px; } }
      `}</style>

      <Container>
        {/* Centered header — consistent with the other homepage sections */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" }}>
            Life at K.S.R.M.
          </div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(20px, 5.4vw, 34px)", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}>
            Campus Gallery
          </h2>
          <p style={{ color: "#777", fontSize: "17px", margin: "8px auto 0", maxWidth: "560px" }}>
            A glimpse of our 25-acre campus — modern labs, a well-stocked library, vibrant events and sporting spirit.
          </p>
        </div>

        <motion.div
          className="cg-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {tiles.map((img) => (
            <motion.div key={img.id} className="cg-tile" variants={tileVariants}>
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL */}
              <img
                src={img.imageUrl}
                alt={img.title}
                loading="lazy"
                onError={(e) => {
                  ;(e.currentTarget.closest(".cg-tile") as HTMLElement | null)?.style.setProperty("display", "none")
                }}
              />
              <div className="cg-overlay">
                <span className="cg-caption">{img.title}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link
            href="/gallery"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "12px 26px", borderRadius: "8px",
              background: "#2B3490", color: "#ffffff",
              fontFamily: "'Rajdhani', sans-serif", fontSize: "17px", fontWeight: 700,
              textDecoration: "none",
            }}
          >
            View Full Gallery <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  )
}
