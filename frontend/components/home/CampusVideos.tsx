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
  // Extract video ID from YouTube embed URL
  const getVideoId = (url: string) => {
    try {
      return url.split('/embed/')[1]?.split('?')[0] || ''
    } catch {
      return ''
    }
  }

  const videoBadges = ["Campus Tour", "Official", "College Tour"]

  return (
    <section style={{
      width: "100%",
      background: "linear-gradient(135deg, #1a2558 0%, #2B3490 100%)",
      padding: "80px 0",
      borderTop: "none"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
        .videos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin: 56px 0;
        }
        .video-card {
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .video-card:hover {
          transform: translateY(-8px);
        }
        .video-thumbnail {
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          margin-bottom: 16px;
        }
        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .video-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #FFE619;
          color: #1a1a2e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .video-title {
          color: #ffffff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
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
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <div style={{
            fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            color: "#FFE619", textTransform: "uppercase", marginBottom: "12px",
          }}>
            ▶ KSRMCE OFFICIAL
          </div>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "48px", fontWeight: 700, color: "#ffffff", margin: "0 0 12px",
          }}>
            Campus Life in Action
          </h2>
          <p style={{
            fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 24px",
          }}>
            Watch our official videos and campus tours
          </p>
        </motion.div>

        {/* VIDEOS GRID */}
        <motion.div
          className="videos-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {(Array.isArray(campusVideosData) ? campusVideosData : []).map((video, i) => {
            const videoId = getVideoId(video?.url ?? '')
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''

            return (
              <motion.div key={i} variants={cardVariants}>
                <div className="video-card">
                  <a
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="video-thumbnail">
                      <img src={thumbnailUrl} alt={video?.title} />
                      <div className="video-badge">{videoBadges[i] || 'Video'}</div>
                    </div>
                    <div className="video-title">{video?.title}</div>
                  </a>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* SUBSCRIBE BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          style={{ textAlign: "center", marginTop: "56px" }}
        >
          <a
            href="https://www.youtube.com/@ksrmceofficialmedia"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              background: "#d6001c",
              color: "#ffffff",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "16px", fontWeight: 600,
              borderRadius: "8px",
              textDecoration: "none",
              transition: "background 0.2s, transform 0.2s",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#b8001a"
              (e.target as HTMLElement).style.transform = "scale(1.05)"
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "#d6001c"
              (e.target as HTMLElement).style.transform = "scale(1)"
            }}
          >
            ▶ Subscribe on YouTube
          </a>
        </motion.div>
      </Container>
    </section>
  )
}
