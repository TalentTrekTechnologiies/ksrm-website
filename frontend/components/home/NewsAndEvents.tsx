"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { resolveFileUrl } from "@/lib/api-base";
import { ArrowRight, MapPin, Clock } from "lucide-react"
import Container from "@/components/ui/Container"
import { getLatestNewsForHomepage, NewsArticle } from "@/lib/news-api"
import { getEventsPublic, EventItem } from "@/lib/events-api"
import { useLiveData } from "@/lib/use-live-data"

interface NewsAndEventsState {
  newsVisible: boolean
  news: NewsArticle[]
  events: EventItem[]
  /** Drives the panel heading, so it never says "Upcoming" over a past event. */
  eventsAllUpcoming: boolean
}

async function fetchNewsAndEvents(): Promise<NewsAndEventsState> {
  const [newsResult, eventsData] = await Promise.all([
    getLatestNewsForHomepage(8).catch(() => ({ visible: false, articles: [] as NewsArticle[] })),
    getEventsPublic().catch(() => [] as EventItem[]),
  ])
  const now = Date.now()
  const at = (e: EventItem) => new Date(e.eventDate).getTime()

  const upcoming = eventsData.filter((e) => at(e) >= now).sort((a, b) => at(a) - at(b))
  const past = eventsData.filter((e) => at(e) < now).sort((a, b) => at(b) - at(a))

  // Soonest first, then the most recent that have been and gone.
  //
  // Showing only future events starved this box: the college had five events,
  // two already past, so it rendered three in a well sized for six - short
  // enough that there was nothing to scroll, while News beside it scrolled
  // through seven. A college's events page is mostly a record of what it has
  // held, and a visitor looking at it wants to see that too.
  const events = [...upcoming, ...past].slice(0, 8)

  // Only claim "Upcoming" when that is all it is showing.
  const eventsAllUpcoming = events.length > 0 && events.every((e) => at(e) >= now)

  return { newsVisible: newsResult.visible, news: newsResult.articles, events, eventsAllUpcoming }
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

/**
 * Does this list actually overflow its viewport?
 *
 * The two lists used to animate only at four items or more - a guess at when
 * the content would exceed the 430px box. It was wrong in both directions, and
 * wrong in a way nobody could see: the Upcoming Events box holds only the
 * events still ahead, which was three, so it silently never scrolled while
 * News beside it did. That is the whole of the "events are not scrolling"
 * report.
 *
 * Measured instead of counted, so it is right for any number of items, any
 * item height and any screen width. Once the clones are in, the content is
 * twice its natural height, so the natural height is what gets compared.
 */
function useOverflows(itemCount: number) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)

  // itemCount is a dependency, not decoration. The list is fetched after
  // mount, so on the first run there is no viewport to measure yet; without
  // this the effect bailed once and never looked again, and nothing ever
  // animated.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const check = () => {
      const natural = el.scrollHeight / (el.dataset.cloned === "true" ? 2 : 1)
      // A few pixels of slack: a list one pixel too tall is not worth animating.
      setOverflows(natural > el.clientHeight + 8)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [itemCount])

  return { viewportRef, overflows }
}

export default function NewsAndEvents() {
  const state = useLiveData(fetchNewsAndEvents, [])
  // Called before the early return below, so the hook order never changes
  // between renders - the lists are simply zero-length until the fetch lands.
  const news = useOverflows(state?.news.length ?? 0)
  const events = useOverflows(state?.events.length ?? 0)

  if (!state) return null
  const showNews = state.newsVisible && state.news.length > 0
  const showEvents = state.events.length > 0
  if (!showNews && !showEvents) return null

  // Auto-scroll a list only when it really does overflow its viewport - see
  // useOverflows. Both lists travel at the same speed whatever they hold, so a
  // three-item list does not crawl next to a ten-item one.
  const newsScrolls = news.overflows
  const newsItems = newsScrolls ? [...state.news, ...state.news] : state.news
  const newsDuration = Math.max(20, state.news.length * 5)

  const eventsScroll = events.overflows
  const eventItems = eventsScroll ? [...state.events, ...state.events] : state.events
  const eventsDuration = Math.max(20, state.events.length * 5)

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
        /* max-height, not height: a short list sits at its own height instead
           of leaving empty space under it, which is what the Upcoming Events
           box did with three events in a 430px well. */
        .ne-viewport { max-height: 430px; overflow: hidden; position: relative; }
        .ne-track { display: flex; flex-direction: column; }
        .ne-track.anim { animation: neScroll var(--dur, 30s) linear infinite; will-change: transform; }

        /* Pause on hover only where there is a real pointer to hover with.
           On a touchscreen :hover sticks after a tap, so tapping a headline
           froze the list permanently - and since the viewport is overflow
           hidden there was no way to scroll it by hand either. That is the
           "events are not scrolling" report: it scrolls until you touch it. */
        @media (hover: hover) and (pointer: fine) {
          .ne-viewport:hover .ne-track.anim { animation-play-state: paused; }
        }

        /* On a touchscreen the list does not auto-scroll at all: it becomes an
           ordinary one you swipe.

           Gating the hover-pause was not enough. The viewport is overflow
           hidden, so the ONLY thing moving the list was the animation - and a
           phone stops CSS animations whenever it feels like it: iOS Low Power
           Mode, Android battery saver, a backgrounded tab. When that happened
           the list froze with no way to scroll it by hand, which is the
           "events are not scrolling" report. It was never about how many items
           there were; it was that the reader had no control.

           A marquee is the wrong thing on a phone regardless - you cannot read
           a list that moves under your thumb.

           Same rule for anyone who has asked for less motion. The duplicated
           half is hidden in both cases, since it exists only to make the loop
           seamless. */
        @media (prefers-reduced-motion: reduce), (hover: none) {
          .ne-track.anim { animation: none; }
          .ne-track.anim .ne-clone { display: none; }
          .ne-viewport { overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
        }
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
        .ne-thumb-date .ne-chip-day { color: #fff; font-size: clamp(17px, 4.8vw, 30px); }
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
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(20px, 5.4vw, 34px)", fontWeight: 700, color: "#1a1a2e", margin: "8px 0 0" }}>
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
              <div className="ne-viewport" ref={news.viewportRef} data-cloned={newsScrolls}>
                <div
                  className={`ne-track ${newsScrolls ? "anim" : ""}`}
                  style={{ ["--dur" as string]: `${newsDuration}s` } as React.CSSProperties}
                >
                  {newsItems.map((n, i) => {
                    const desc = snippet(n.content)
                    // The second copy exists only so the loop can wrap without
                    // a visible jump; it is hidden when the animation is off.
                    const clone = newsScrolls && i >= state.news.length
                    return (
                      <Link key={`${n.id}-${i}`} href="/news" className={`ne-item${clone ? " ne-clone" : ""}`}>
                        {n.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL
                          <img src={resolveFileUrl(n.imageUrl)} alt="" loading="lazy" decoding="async" className="ne-thumb" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
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
                <h3 className="ne-box-title">{state.eventsAllUpcoming ? "Upcoming Events" : "Events"}</h3>
                <Link href="/events" className="ne-box-link">View All Events <ArrowRight size={14} /></Link>
              </div>
              <div className="ne-viewport" ref={events.viewportRef} data-cloned={eventsScroll}>
                <div
                  className={`ne-track ${eventsScroll ? "anim" : ""}`}
                  style={{ ["--dur" as string]: `${eventsDuration}s` } as React.CSSProperties}
                >
                  {eventItems.map((e, i) => {
                    const desc = snippet(e.description)
                    const c = dayMon(e.eventDate)
                    const clone = eventsScroll && i >= state.events.length
                    return (
                      <Link key={`${e.id}-${i}`} href="/events" className={`ne-item${clone ? " ne-clone" : ""}`}>
                        {e.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL
                          <img src={resolveFileUrl(e.imageUrl)} alt="" loading="lazy" decoding="async" className="ne-thumb" onError={(ev) => (ev.currentTarget.style.visibility = "hidden")} />
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
