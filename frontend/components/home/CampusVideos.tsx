"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { campusVideosData } from "@/data/home"

const EASE = [0.22, 1, 0.36, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function CampusVideos() {
  return (
    <section style={{ width: "100%", background: "#ffffff", padding: "56px 0", borderTop: "1px solid #f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
        .videos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin: 40px 0;
        }
        .video-frame {
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .video-frame iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        @media (max-width: 1024px) {
          .videos-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .videos-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <div style={{
            fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            color: "#2B3490", textTransform: "uppercase", marginBottom: "12px",
          }}>
            MEDIA
          </div>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "36px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px",
          }}>
            Campus Life in Action
          </h2>
          <p style={{ fontSize: "16px", color: "#666", margin: "0 0 12px" }}>
            Explore our vibrant campus through video
          </p>
          <a
            href="https://www.youtube.com/@ksrmceofficialmedia"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "#d6001c",
              color: "#ffffff",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "14px", fontWeight: 600,
              borderRadius: "6px",
              textDecoration: "none",
              transition: "background 0.2s",
              marginTop: "8px",
            }}
          >
            Subscribe on YouTube
          </a>
        </motion.div>

        {/* VIDEOS GRID */}
        <motion.div
          className="videos-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {campusVideosData.map((video, i) => (
            <motion.div key={i} variants={cardVariants}>
              <div>
                <div className="video-frame">
                  <iframe
                    src={video.url}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "16px", fontWeight: 700, color: "#1a1a2e",
                  marginTop: "16px", marginBottom: 0,
                }}>
                  {video.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
