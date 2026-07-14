"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Clock } from "lucide-react"
import Container from "@/components/ui/Container"
import { getLatestNewsForHomepage, NewsArticle } from "@/lib/news-api"
import { getEventsPublic, EventItem } from "@/lib/events-api"
import { useLiveData } from "@/lib/use-live-data"

interface NewsAndEventsState {
  newsVisible: boolean
  news: NewsArticle[]
  events: EventItem[]
}

async function fetchNewsAndEvents(): Promise<NewsAndEventsState> {
  const [newsResult, eventsData] = await Promise.all([
    getLatestNewsForHomepage(8).catch(() => ({ visible: false, articles: [] as NewsArticle[] })),
    getEventsPublic().catch(() => [] as EventItem[]),
  ])
  const now = Date.now()
  const upcoming = eventsData
    .filter((e) => new Date(e.eventDate).getTime() >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
  const events = (upcoming.length ? upcoming : eventsData.slice().sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())).slice(0, 6)
  return { newsVisible: newsResult.visible, news: newsResult.articles, events }
}

// Compact date chip parts (e.g. 12 / JUL) shown at the left of each row.
function dayMon(iso: string) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    mon: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
  }
}
function eventTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}
function fmtNewsDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}
// Strip any HTML/markdown from the article body for a plain-text preview snippet.
function snippet(content: string | null | undefined) {
  if (!content) return ""
  return content.replace(/<[^>]+>/g, " ").replace(/[#*_>`]/g, "").replace(/\s+/g, " ").trim()
}

export default function NewsAndEvents() {
  const state = useLiveData(fetchNewsAndEvents, [])

  if (!state) return null
  const showNews = state.newsVisible && state.news.length > 0
  const showEvents = state.events.length > 0
  if (!showNews && !showEvents) return null

  // Auto-scroll the news list only when there are enough items to overflow the
  // fixed-height viewport; otherwise show them statically.
  const newsScrolls = state.news.length >= 4
  const newsItems = newsScrolls ? [...state.news, ...state.news] : state.news
  const newsDuration = Math.max(24, state.news.length * 6)

  const eventsScroll = state.events.length >= 4
  const eventItems = eventsScroll ? [...state.events, ...state.events] : state.events
  const eventsDuration = Math.max(24, state.events.length * 6)

  return (
    <section style={{ width: "100%", background: "#f7f8fa", padding: "44px 0", borderTop: "1px solid #eef0f3" }}>
      <style>{`
        .ne-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
        .ne-box {
          background: #fff; border: 1px solid #e6e8f0; border-radius: 14px;
          overflow: hidden; box-shadow: 0 6px 24px rgba(43,52,144,0.06);
          display: flex; flex-direction: column;
        }
        .ne-box-head {
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); padding: 14px 20px;
        }
        .ne-box-title {
          font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #fff;
          margin: 0; display: flex; align-items: center; gap: 10px;
        }
        .ne-box-title::before { content: ''; width: 4px; height: 20px; background: #FFE619; border-radius: 2px; }
        .ne-box-link {
          color: #FFE619; font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700;
          text-decoration: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
        }
        .ne-box-link:hover { color: #fff; }
        .ne-viewport { height: 430px; overflow: hidden; position: relative; }
        .ne-viewport.scrollable { overflow-y: auto; }
        .ne-track { display: flex; flex-direction: column; }
        .ne-track.anim { animation: neScroll var(--dur, 30s) linear infinite; }
        .ne-viewport:hover .ne-track.anim { animation-play-state: paused; }
        @keyframes neScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        .ne-item {
          display: flex; gap: 16px; align-items: flex-start; padding: 16px 20px;
          border-bottom: 1px solid #eef0f6; text-decoration: none; transition: background 0.15s;
        }
        .ne-item:hover { background: #f6f7fd; }
        .ne-thumb {
          width: 128px; height: 90px; border-radius: 9px; object-fit: cover;
          flex-shrink: 0; background: #e9ebf2; display: block;
        }
        .ne-thumb-date {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%);
        }
        .ne-thumb-date .ne-chip-day { color: #fff; font-size: 30px; }
        .ne-thumb-date .ne-chip-mon { color: #FFE619; font-size: 13px; margin-top: 5px; }
        .ne-item-body { min-width: 0; display: flex; flex-direction: column; }
        .ne-item-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
        .ne-item-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B3490; background: #e8eaf6; padding: 2px 8px; border-radius: 20px; }
        .ne-item-date { font-size: 12px; color: #999; }
        .ne-item-title {
          font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 3px 0 0; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .ne-item-desc {
          font-size: 13px; color: #6b7280; line-height: 1.55; margin: 4px 0 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .ne-read { font-size: 12px; font-weight: 700; color: #2B3490; margin-top: 6px; }
        .ne-item:hover .ne-read { text-decoration: underline; }
        .ne-chip {
          flex-shrink: 0; width: 54px; text-align: center;
          background: #eef0fb; border-radius: 8px; padding: 7px 0; line-height: 1;
        }
        .ne-chip-day { display: block; font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; }
        .ne-chip-mon { display: block; font-size: 10px; font-weight: 700; color: #6b70a8; letter-spacing: 0.5px; margin-top: 3px; }
        .ne-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 5px; }
        .ne-meta span { display: inline-flex; align-items: center; gap: 5px; font-size: 14px; color: #777; }
        @media (max-width: 860px) { .ne-grid { grid-template-columns: 1fr; gap: 24px; } }
      `}</style>

      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "2px", color: "#2B3490", textTransform: "uppercase" }}>
            Stay Updated
          </div>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "34px", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}>
            News &amp; Events
          </h2>
        </div>

        <div className="ne-grid">
          {/* LATEST NEWS — MITS-style auto-scrolling box */}
          {showNews && (
            <div className="ne-box">
              <div className="ne-box-head">
                <h3 className="ne-box-title">Latest News</h3>
                <Link href="/news" className="ne-box-link">View All News <ArrowRight size={14} /></Link>
              </div>
              <div className="ne-viewport">
                <div
                  className={`ne-track ${newsScrolls ? "anim" : ""}`}
                  style={{ ["--dur" as string]: `${newsDuration}s` } as React.CSSProperties}
                >
                  {newsItems.map((n, i) => {
                    const desc = snippet(n.content)
                    return (
                      <Link key={`${n.id}-${i}`} href="/news" className="ne-item">
                        {n.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL
                          <img src={n.imageUrl} alt="" loading="lazy" className="ne-thumb" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
                        ) : (
                          <span className="ne-thumb" aria-hidden />
                        )}
                        <span className="ne-item-body">
                          <span className="ne-item-meta">
                            <span className="ne-item-cat">{n.category}</span>
                            <span className="ne-item-date">{fmtNewsDate(n.date)}</span>
                          </span>
                          <p className="ne-item-title">{n.title}</p>
                          {desc && <p className="ne-item-desc">{desc}</p>}
                          <span className="ne-read">Read More →</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* UPCOMING EVENTS — matching panel */}
          {showEvents && (
            <div className="ne-box">
              <div className="ne-box-head">
                <h3 className="ne-box-title">Upcoming Events</h3>
                <Link href="/events" className="ne-box-link">View All Events <ArrowRight size={14} /></Link>
              </div>
              <div className="ne-viewport">
                <div
                  className={`ne-track ${eventsScroll ? "anim" : ""}`}
                  style={{ ["--dur" as string]: `${eventsDuration}s` } as React.CSSProperties}
                >
                  {eventItems.map((e, i) => {
                    const desc = snippet(e.description)
                    const c = dayMon(e.eventDate)
                    return (
                      <Link key={`${e.id}-${i}`} href="/events" className="ne-item">
                        {e.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL
                          <img src={e.imageUrl} alt="" loading="lazy" className="ne-thumb" onError={(ev) => (ev.currentTarget.style.visibility = "hidden")} />
                        ) : (
                          <span className="ne-thumb ne-thumb-date" aria-hidden>
                            <span className="ne-chip-day">{c.day}</span>
                            <span className="ne-chip-mon">{c.mon}</span>
                          </span>
                        )}
                        <span className="ne-item-body">
                          <span className="ne-item-meta">
                            <span className="ne-item-cat">{e.category || "EVENT"}</span>
                            <span className="ne-item-date">{fmtNewsDate(e.eventDate)}</span>
                          </span>
                          <p className="ne-item-title">{e.title}</p>
                          {desc && <p className="ne-item-desc">{desc}</p>}
                          <div className="ne-meta">
                            <span><Clock size={12} /> {eventTime(e.eventDate)}</span>
                            {e.location && <span><MapPin size={12} /> {e.location}</span>}
                          </div>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
