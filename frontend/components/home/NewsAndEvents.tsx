"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Clock } from "lucide-react"
import Container from "@/components/ui/Container"
import { getLatestNewsForHomepage, NewsArticle } from "@/lib/news-api"
import { getEventsPublic, EventItem } from "@/lib/events-api"
import { useLiveData } from "@/lib/use-live-data"

const EASE = [0.22, 1, 0.36, 1] as const

interface NewsAndEventsState {
  newsVisible: boolean
  news: NewsArticle[]
  events: EventItem[]
}

async function fetchNewsAndEvents(): Promise<NewsAndEventsState> {
  const [newsResult, eventsData] = await Promise.all([
    getLatestNewsForHomepage(4).catch(() => ({ visible: false, articles: [] as NewsArticle[] })),
    getEventsPublic().catch(() => [] as EventItem[]),
  ])
  const now = Date.now()
  const upcoming = eventsData
    .filter((e) => new Date(e.eventDate).getTime() >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
  const events = (upcoming.length ? upcoming : eventsData.slice().sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())).slice(0, 4)
  return { newsVisible: newsResult.visible, news: newsResult.articles, events }
}

function fmtNewsDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}
function fmtEvent(iso: string) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    mon: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    time: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  }
}

const listVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const rowVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }

function ColHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "22px", fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{title}</h3>
      <Link href={href} style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
        {cta} <ArrowRight size={15} />
      </Link>
    </div>
  )
}

export default function NewsAndEvents() {
  const state = useLiveData(fetchNewsAndEvents, [])

  if (!state) return null
  const showNews = state.newsVisible && state.news.length > 0
  const showEvents = state.events.length > 0
  if (!showNews && !showEvents) return null

  return (
    <section style={{ width: "100%", background: "#f7f8fa", padding: "44px 0", borderTop: "1px solid #eef0f3" }}>
      <style>{`
        .ne-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 40px; }
        .ne-news-row {
          display: flex; gap: 14px; align-items: center; text-decoration: none;
          padding: 12px; border-radius: 12px; transition: background 0.2s ease;
        }
        .ne-news-row:hover { background: #fff; box-shadow: 0 8px 22px rgba(43,52,144,0.07); }
        .ne-news-thumb { width: 84px; height: 64px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: #e9ebf2; }
        .ne-ev-row {
          display: flex; gap: 14px; align-items: center; text-decoration: none;
          padding: 12px; border-radius: 12px; transition: background 0.2s ease;
        }
        .ne-ev-row:hover { background: #fff; box-shadow: 0 8px 22px rgba(43,52,144,0.07); }
        .ne-ev-date {
          width: 58px; height: 58px; flex-shrink: 0; border-radius: 12px;
          background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #fff;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        @media (max-width: 860px) { .ne-grid { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>

      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" }}>
            Stay Updated
          </div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "34px", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}>
            News &amp; Events
          </h2>
        </div>

        <div className="ne-grid">
          {/* LATEST NEWS */}
          {showNews && (
            <div>
              <ColHeader title="Latest News" href="/news" cta="All News" />
              <motion.div variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                {state.news.map((n) => (
                  <motion.div key={n.id} variants={rowVariants}>
                    <Link href="/news" className="ne-news-row">
                      {n.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL
                        <img src={n.imageUrl} alt={n.title} loading="lazy" className="ne-news-thumb" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                      ) : (
                        <div className="ne-news-thumb" />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#2B3490", background: "#e8eaf6", padding: "2px 8px", borderRadius: "20px" }}>{n.category}</span>
                          <span style={{ fontSize: "11px", color: "#999" }}>{fmtNewsDate(n.date)}</span>
                        </div>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a2e", margin: 0, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.title}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* UPCOMING EVENTS */}
          {showEvents && (
            <div>
              <ColHeader title="Upcoming Events" href="/events" cta="All Events" />
              <motion.div variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
                {state.events.map((e) => {
                  const d = fmtEvent(e.eventDate)
                  return (
                    <motion.div key={e.id} variants={rowVariants}>
                      <Link href="/events" className="ne-ev-row">
                        <div className="ne-ev-date">
                          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "19px", fontWeight: 700, lineHeight: 1 }}>{d.day}</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#FFE619", letterSpacing: "0.5px" }}>{d.mon}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 6px", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.title}</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#777" }}><Clock size={12} /> {d.time}</span>
                            {e.location && <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#777" }}><MapPin size={12} /> {e.location}</span>}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
