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

function DateChip({ iso }: { iso: string }) {
  const c = dayMon(iso)
  return (
    <span className="ne-chip">
      <span className="ne-chip-day">{c.day}</span>
      <span className="ne-chip-mon">{c.mon}</span>
    </span>
  )
}

export default function NewsAndEvents() {
  const state = useLiveData(fetchNewsAndEvents, [])

  if (!state) return null
  const showNews = state.newsVisible && state.news.length > 0
  const showEvents = state.events.length > 0
  if (!showNews && !showEvents) return null

  // Auto-scroll the news list only when there are enough items to overflow the
  // fixed-height viewport; otherwise show them statically.
  const newsScrolls = state.news.length >= 5
  const newsItems = newsScrolls ? [...state.news, ...state.news] : state.news
  const newsDuration = Math.max(18, state.news.length * 4)

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
        .ne-viewport { height: 320px; overflow: hidden; position: relative; }
        .ne-viewport.scrollable { overflow-y: auto; }
        .ne-track { display: flex; flex-direction: column; }
        .ne-track.anim { animation: neScroll var(--dur, 30s) linear infinite; }
        .ne-viewport:hover .ne-track.anim { animation-play-state: paused; }
        @keyframes neScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        .ne-item {
          display: flex; gap: 14px; align-items: flex-start; padding: 13px 20px;
          border-bottom: 1px solid #eef0f6; text-decoration: none; transition: background 0.15s;
        }
        .ne-item:hover { background: #f6f7fd; }
        .ne-chip {
          flex-shrink: 0; width: 54px; text-align: center;
          background: #eef0fb; border-radius: 8px; padding: 7px 0; line-height: 1;
        }
        .ne-chip-day { display: block; font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; }
        .ne-chip-mon { display: block; font-size: 10px; font-weight: 700; color: #6b70a8; letter-spacing: 0.5px; margin-top: 3px; }
        .ne-item-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B3490; }
        .ne-item-title {
          font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 2px 0 0; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
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
                  {newsItems.map((n, i) => (
                    <Link key={`${n.id}-${i}`} href="/news" className="ne-item">
                      <DateChip iso={n.date} />
                      <span style={{ minWidth: 0 }}>
                        <span className="ne-item-cat">{n.category}</span>
                        <p className="ne-item-title">{n.title}</p>
                      </span>
                    </Link>
                  ))}
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
              <div className="ne-viewport scrollable">
                {state.events.map((e) => (
                  <Link key={e.id} href="/events" className="ne-item">
                    <DateChip iso={e.eventDate} />
                    <span style={{ minWidth: 0 }}>
                      <p className="ne-item-title">{e.title}</p>
                      <div className="ne-meta">
                        <span><Clock size={12} /> {eventTime(e.eventDate)}</span>
                        {e.location && <span><MapPin size={12} /> {e.location}</span>}
                      </div>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
