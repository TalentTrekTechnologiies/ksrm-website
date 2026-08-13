"use client"

import { useState, useEffect, useRef } from "react"
import Container from "@/components/ui/Container"
import { getStatisticsPublic, SiteStatistic } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const FALLBACK_STATS = [
  { id: -1, number: 46, suffix: "+", label: "Years of Excellence" },
  { id: -2, number: 35.23, suffix: "", label: "Acres Campus Area" },
  { id: -3, number: 1200, suffix: "+", label: "Students Intake" },
  { id: -4, number: 150, suffix: "+", label: "Faculty Members" },
  { id: -5, number: 7, suffix: "", label: "Departments" },
  { id: -6, number: 12, suffix: " LPA", label: "Highest Package" },
  { id: -7, number: 15000, suffix: "+", label: "Alumni Network" },
  { id: -8, number: 200, suffix: "+", label: "Companies Recruiting" },
]

function AnimatedCounter({ target, suffix, duration = 2 }: { target: number; suffix: string; duration?: number }) {
  // Seeded with the REAL figure, not 0.
  //
  // This component used to start at useState(0), so the static export shipped
  // `<div class="stat-number">0</div>` (and "0.00" for the decimal stat) into
  // the HTML - the count-up only ever ran in the browser. Every crawler, and
  // any user with JS disabled or still hydrating, saw a wall of zeroes where
  // the institution's headline numbers should be.
  //
  // Now the server-rendered HTML carries "46+", "1,200+", "200+" and so on.
  // The animation is unchanged for real users: the effect below resets the
  // display to 0 and counts up, but it runs only on the client and only once
  // the card scrolls into view, so the pre-hydration paint already shows the
  // true value.
  const [count, setCount] = useState(target)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // A statistic can carry decimals - the campus is 35.23 acres - and the
  // count-up used to floor every frame, so 35.23 counted up to 35 and editing
  // the figure in Admin -> Statistics appeared to do nothing at all. Step to
  // whatever precision the target itself has: a whole number still counts as
  // a whole number and shows no trailing ".00".
  const decimals = (target.toString().split(".")[1] ?? "").length

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    let start = 0
    // Client-only: drop back to 0 and count up. Never runs during the static
    // render, so it cannot put a 0 into the exported HTML.
    setCount(0)
    const increment = target / (duration * 60)
    const interval = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Number(start.toFixed(decimals)))
      }
    }, 1000 / 60)
    return () => clearInterval(interval)
  }, [hasStarted, target, duration, decimals])

  return (
    <div ref={ref} className="stat-number">
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </div>
  )
}

async function fetchStats() {
  const data = await getStatisticsPublic("homepage")
  if (data.length === 0) return FALLBACK_STATS
  return data.map((s: SiteStatistic) => ({ id: s.id, number: s.value, suffix: s.suffix ?? "", label: s.label }))
}

export default function CampusStats() {
  const stats = useLiveData(fetchStats, [], { initialValue: FALLBACK_STATS }) ?? FALLBACK_STATS

  return (
    <section style={{
      width: "100%",
      background: "#2B3490",
      padding: "48px 0",
    }}>
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; gap: 20px; }
        }

        .stat-card {
          text-align: center;
          padding: 32px 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(30px, 8.3vw, 52px);
          font-weight: 700;
          color: #FFE619;
          line-height: 1;
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 16px;
          color: #FFFFFF;
          font-weight: 500;
          line-height: 1.5;
        }
      `}</style>

      <Container>
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card">
              <AnimatedCounter target={stat.number} suffix={stat.suffix} />
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
