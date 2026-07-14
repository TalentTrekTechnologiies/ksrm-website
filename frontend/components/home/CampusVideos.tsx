"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { campusVideosData } from "@/data/home"
import { getCampusVideosPublic } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const EASE = [0.22, 1, 0.36, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

interface DisplayVideo {
  title: string
  url: string
  badge: string
}

const FALLBACK_BADGES = ["Campus Tour", "Official", "College Tour"]

// Extract video ID from a YouTube embed URL.
function getVideoId(url: string) {
  if (!url) return ''
  const match = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : ''
}

const FALLBACK_VIDEOS: DisplayVideo[] = (Array.isArray(campusVideosData) ? campusVideosData : []).map((v, i) => ({
  title: v.title,
  url: v.url,
  badge: FALLBACK_BADGES[i] || 'Video',
}))

interface CampusVideosState {
  hidden: boolean
  videos: DisplayVideo[]
}

async function fetchCampusVideos(): Promise<CampusVideosState> {
  const { visible, items } = await getCampusVideosPublic()
  if (!visible) return { hidden: true, videos: FALLBACK_VIDEOS }
  if (items.length === 0) return { hidden: false, videos: FALLBACK_VIDEOS }
  return {
    hidden: false,
    videos: items.map((v) => ({
      title: v.title,
      url: v.youtubeUrl,
      badge: v.badgeLabel || 'Campus Video',
    })),
  }
}

export default function CampusVideos() {
  const live = useLiveData(fetchCampusVideos, [])
  const hidden = live?.hidden ?? false
  const videos = live?.videos ?? FALLBACK_VIDEOS

  if (hidden) return null

  return (
    <section style={{
      width: "100%",
      background: "linear-gradient(135deg, #1a2558 0%, #2B3490 100%)",
      padding: "48px 0",
      borderTop: "none"
    }}>
      <style>{`
        .videos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 32px 0;
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
          font-size: 14px;
          font-weight: 700;
          line-height: 1.3;
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
          style={{ textAlign: "center", marginBottom: "24px" }}
        >
          <div style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
            color: "#FFE619", textTransform: "uppercase", marginBottom: "8px",
          }}>
            ▶ KSRMCE OFFICIAL
          </div>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "36px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px",
          }}>
            Campus Life in Action
          </h2>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: 0,
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
          {videos.map((video, i) => {
            const videoId = getVideoId(video?.url ?? '')
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''

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
                      <img
                        src={thumbnailUrl}
                        alt={video?.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/default.jpg`
                        }}
                      />
                      <div className="video-badge">{video.badge}</div>
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
          style={{ textAlign: "center", marginTop: "32px" }}
        >
          <a
            href="https://www.youtube.com/@ksrmceofficialmedia"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#d6001c",
              color: "#ffffff",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "14px", fontWeight: 600,
              borderRadius: "8px",
              textDecoration: "none",
              transition: "background 0.2s, transform 0.2s",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const target = e.currentTarget;
              target.style.background = "#b8001a";
              target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              const target = e.currentTarget;
              target.style.background = "#d6001c";
              target.style.transform = "scale(1)";
            }}
          >
            ▶ Subscribe on YouTube
          </a>
        </motion.div>
      </Container>
    </section>
  )
}
