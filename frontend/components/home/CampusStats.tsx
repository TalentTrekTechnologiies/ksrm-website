"use client"

import { useState, useEffect, useRef } from "react"
import Container from "@/components/ui/Container"
import { getStatisticsPublic, SiteStatistic } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const FALLBACK_STATS = [
  { id: -1, number: 46, suffix: "+", label: "Years of Excellence" },
  { id: -2, number: 25, suffix: "", label: "Acres Campus Area" },
  { id: -3, number: 1200, suffix: "+", label: "Students Intake" },
  { id: -4, number: 150, suffix: "+", label: "Faculty Members" },
  { id: -5, number: 7, suffix: "", label: "Departments" },
  { id: -6, number: 12, suffix: " LPA", label: "Highest Package" },
  { id: -7, number: 15000, suffix: "+", label: "Alumni Network" },
  { id: -8, number: 200, suffix: "+", label: "Companies Recruiting" },
]

function AnimatedCounter({ target, suffix, duration = 2 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
    const increment = target / (duration * 60)
    const interval = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(interval)
  }, [hasStarted, target, duration])

  return (
    <div ref={ref} className="stat-number">
      {count.toLocaleString()}{suffix}
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
