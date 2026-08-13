"use client"

import Container from "@/components/ui/Container"
import { homeData } from "@/data/home"
import { getStatisticsPublic, getRecruitersPublic, SiteStatistic } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const FALLBACK_STATS = [
  { id: -1, number: 1200, suffix: "+", label: "Students Placed" },
  { id: -2, number: 200, suffix: "+", label: "Recruiting Companies" },
  { id: -3, number: 12, suffix: " LPA", label: "Highest Package" },
  { id: -4, number: 15000, suffix: "+", label: "Alumni Network" },
]

interface DisplayRecruiter {
  logo: string
  name: string
}

const INITIAL_STATS =
  Array.isArray(homeData?.placements?.stats) && homeData.placements.stats.length > 0
    ? homeData.placements.stats.map((s, i) => ({ id: -(i + 1), number: s.number, suffix: s.suffix, label: s.label }))
    : FALLBACK_STATS

const INITIAL_RECRUITERS: DisplayRecruiter[] = Array.isArray(homeData?.recruiters) ? homeData.recruiters : []

async function fetchPlacementStats() {
  const data = await getStatisticsPublic("homepage_placements")
  if (data.length === 0) return INITIAL_STATS
  return data.map((s: SiteStatistic) => ({ id: s.id, number: s.value, suffix: s.suffix ?? "", label: s.label }))
}

interface RecruitersState {
  hidden: boolean
  recruiters: DisplayRecruiter[]
}

// Placements.tsx previously read homeData.recruiters directly with no API
// call at all - this was the one component in the Sprint 1C scope still
// doing that, per the plan's explicit callout.
async function fetchRecruiters(): Promise<RecruitersState> {
  const { visible, items } = await getRecruitersPublic()
  if (!visible) return { hidden: true, recruiters: INITIAL_RECRUITERS }
  if (items.length === 0) return { hidden: false, recruiters: INITIAL_RECRUITERS }
  return { hidden: false, recruiters: items.map((r) => ({ logo: r.logoUrl, name: r.name })) }
}

export default function Placements() {
  const stats = useLiveData(fetchPlacementStats, [], { initialValue: INITIAL_STATS }) ?? INITIAL_STATS
  const liveRecruiters = useLiveData(fetchRecruiters, [])
  const recruitersHidden = liveRecruiters?.hidden ?? false
  const recruiters = liveRecruiters?.recruiters ?? INITIAL_RECRUITERS

  const posters: string[] = Array.isArray(homeData?.placements?.posters) ? homeData.placements.posters : []
  const posterStrip = [...posters, ...posters]

  /**
   * On a touch device the strips auto-scroll until the visitor touches one,
   * at which point that strip becomes an ordinary swipeable carousel for the
   * rest of the visit.
   *
   * Handing over permanently rather than pausing-and-resuming is deliberate:
   * the animation drives `transform` while a swipe drives `scrollLeft`, so
   * resuming would yank the strip away from wherever the reader had put it.
   * Once someone has taken hold of it, it is theirs.
   */
  const onStripInteract = (e: React.SyntheticEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add("manual")
  }

  // Both strips move at a constant pixels-per-second rate whatever they hold.
  // A fixed duration crawled with four posters and blurred with forty, which
  // was the "placements scrolling slowly" report on a strip that happened to
  // be short. Raised 48 -> 72 px/s at the college's request; the floor keeps a
  // two-item strip from whipping past.
  const STRIP_PX_PER_SECOND = 72
  const photoDuration = Math.max(8, Math.round((posters.length * 296) / STRIP_PX_PER_SECOND))
  const recruiterDuration = Math.max(8, Math.round((recruiters.length * 180) / STRIP_PX_PER_SECOND))

  return (
    <section style={{ width: "100%", background: "#f8f9fa", padding: "48px 0" }}>
      <style>{`
        .placements-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 60px;
        }

        .stat-box {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          padding: 40px 24px;
          border-radius: 12px;
          text-align: center;
          border: none;
        }

        .stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #FFE619;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 16px;
          color: #ffffff;
          font-weight: 500;
        }

        .photo-carousel {
          margin-bottom: 60px;
          overflow: hidden;
        }

        .carousel-title {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #2B3490;
          margin-bottom: 32px;
          font-family: 'Rajdhani', sans-serif;
        }

        .photo-track {
          display: flex;
          gap: 16px;
          animation: scroll var(--dur, 30s) linear infinite;
          will-change: transform;
        }

        .photo-item {
          flex-shrink: 0;
          width: 280px;
          height: 200px;
          border-radius: 10px;
          overflow: hidden;
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Pause on hover only where there is a pointer to hover with. On a
           touchscreen :hover sticks after a tap, so touching the strip paused
           it for good - and it is overflow:hidden, so it could not be scrolled
           by hand either. That is "the logos are not scrolling" on a phone:
           they scroll until you touch them. */
        @media (hover: hover) and (pointer: fine) {
          .photo-carousel:hover .photo-track {
            animation-play-state: paused;
          }
        }

        .recruiter-section {
          background: white;
          padding: 48px 0;
          border-radius: 12px;
        }

        .recruiter-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          padding: 32px 40px;
          border-radius: 12px;
        }

        .recruiter-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: white;
          flex: 1;
        }

        .recruiter-badge {
          background: #FFE619;
          color: #1a1a2e;
          padding: 20px 28px;
          border-radius: 10px;
          text-align: center;
          font-family: 'Rajdhani', sans-serif;
        }

        .badge-value {
          font-size: 28px;
          font-weight: 700;
          display: block;
        }

        .badge-label {
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
        }

        .recruiter-track {
          display: flex;
          gap: 20px;
          animation: scroll var(--dur, 30s) linear infinite;
          will-change: transform;
        }

        .recruiter-logo {
          flex-shrink: 0;
          width: 160px;
          height: 100px;
          background: white;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }

        .recruiter-logo img {
          width: 90%;
          height: 90%;
          object-fit: contain;
        }

        @media (hover: hover) and (pointer: fine) {
          .recruiter-carousel:hover .recruiter-track {
            animation-play-state: paused;
          }
        }

        .strip-viewport { overflow: hidden; }

        /* On a touchscreen the strips do not animate; they are swiped.

           This rule existed before and did nothing, because it unclipped
           .photo-carousel / .recruiter-carousel while the element actually
           clipping was an inner div with overflow:hidden set inline - and an
           inline style beats a stylesheet rule. So the strip stopped moving
           and still could not be scrolled. That is "placements scrolling
           slowly" on a phone: the animation is throttled by the battery saver
           and there is no way to move it yourself.

           The clipped half is dropped too - the duplicate exists only to make
           the loop seamless, and swiping through the same logos twice is
           just confusing. */
        /* Touch devices now auto-scroll TOO, per the college's request - but
           they keep the manual escape hatch that was the whole reason it was
           switched off here.

           The original problem was not the animation, it was that stopping it
           left no alternative: the viewport was overflow hidden, so when a
           phone throttled the animation (Low Power Mode, battery saver,
           backgrounded tab) the strip froze and could not be moved by hand.

           Both are on now. The strip animates, AND the viewport stays
           swipeable, so a throttled animation degrades to an ordinary
           scroller instead of a dead one. Touching it hands control over
           permanently (see onStripInteract) rather than fighting the user's
           finger for the scroll position.

           The duplicated half stays visible here, because with the animation
           running the loop needs it to be seamless. */
        @media (hover: none), (pointer: coarse) {
          .strip-viewport {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
          }
          .strip-viewport.manual .photo-track,
          .strip-viewport.manual .recruiter-track { animation: none; }
          .strip-viewport.manual { scroll-snap-type: x proximity; }
          .strip-viewport.manual .photo-item,
          .strip-viewport.manual .recruiter-logo { scroll-snap-align: start; }
          .strip-viewport.manual .strip-clone { display: none; }
        }

        /* Anyone who asked for less motion still gets a plain scroller. */
        @media (prefers-reduced-motion: reduce) {
          .photo-track, .recruiter-track { animation: none; }
          .strip-viewport {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            scroll-snap-type: x proximity;
          }
          .photo-item, .recruiter-logo { scroll-snap-align: start; }
          .strip-clone { display: none; }
        }

        @media (max-width: 1024px) {
          .placements-stats { grid-template-columns: repeat(2, 1fr); }
          .photo-item { width: 220px; height: 160px; }
          .recruiter-logo { width: 140px; height: 90px; }
        }

        @media (max-width: 640px) {
          .placements-stats { grid-template-columns: 1fr; }
          .stat-box { padding: 28px 20px; }
          .stat-number { font-size: 40px; }
          .photo-item { width: 100%; height: 200px; }
          /* Tighten the blue recruiter card so it isn't cramped, and center +
             shrink its text/badge to fit a phone width. */
          .recruiter-section { padding: 32px 0; }
          .recruiter-header { flex-direction: column; padding: 24px 20px; gap: 14px; text-align: center; }
          .recruiter-title { font-size: 22px; text-align: center; }
          .recruiter-badge { padding: 14px 24px; }
          .badge-value { font-size: 24px; }
          .carousel-title { font-size: 22px; }
          .recruiter-logo { width: 120px; height: 78px; }
        }
      `}</style>

      <Container>
        {/* HEADING */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "14px", letterSpacing: "3px", color: "#2B3490", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
            TRAINING & PLACEMENTS
          </p>
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.7rem, 6vw, 40px)", fontWeight: 700, color: "#1a1a2e", margin: "12px 0 8px" }}>
            Where Talent Meets Opportunity
          </h2>
          <p style={{ fontSize: "clamp(15px, 4vw, 18px)", color: "#666", margin: 0 }}>
            Join 1200+ graduates placed at India&apos;s top companies
          </p>
        </div>

        {/* STATS */}
        <div className="placements-stats">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-box">
              <div className="stat-number">
                {stat.number}{stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* PHOTO CAROUSEL */}
        <div className="photo-carousel">
          <div className="carousel-title">2025 Placements</div>
          <div className="strip-viewport" onTouchStart={onStripInteract}>
            <div className="photo-track" style={{ ["--dur" as string]: `${photoDuration}s` } as React.CSSProperties}>
              {posterStrip.map((poster, i) => (
                <div key={i} className={`photo-item${i >= posters.length ? " strip-clone" : ""}`}>
                  <img src={poster} alt={`Placement ${i}`} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECRUITER SECTION */}
        {!recruitersHidden && (
          <div className="recruiter-section">
            <div className="recruiter-header">
              <div className="recruiter-title">Recruited by <span style={{ color: "#FFE619" }}>200+ Top Companies</span></div>
              <div className="recruiter-badge">
                <span className="badge-value">12 LPA</span>
                <span className="badge-label">Highest Package</span>
              </div>
            </div>

            <div className="recruiter-carousel strip-viewport" onTouchStart={onStripInteract}>
              <div className="recruiter-track" style={{ ["--dur" as string]: `${recruiterDuration}s` } as React.CSSProperties}>
                {[...recruiters, ...recruiters].map((recruiter, i) => {
                  const isClone = i >= recruiters.length;
                  const logo = recruiter?.logo ?? '';
                  const filename = logo.split('/').pop() || '';
                  const encodedPath = `/recruiters/${encodeURIComponent(filename)}`;
                  return (
                    <div key={i} className={`recruiter-logo${isClone ? " strip-clone" : ""}`}>
                      <img
                        src={encodedPath}
                        alt={recruiter?.name ?? ''}
                        title={recruiter?.name ?? ''}
                        loading="lazy"
                        style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          const target = e.currentTarget;
                          target.style.opacity = '0.3'
                          target.style.filter = 'none'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
