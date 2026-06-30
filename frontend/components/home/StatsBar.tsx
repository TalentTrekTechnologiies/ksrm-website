"use client"

import { useEffect, useRef, useState } from "react"
import { statsData } from "@/data/home"

const stats = statsData.map(stat => ({
  value: parseInt(stat.value.toString()),
  suffix: stat.suffix || "",
  label: stat.label
}))

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export default function StatsBar() {
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0))
  const sectionRef = useRef<HTMLElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return
        hasStarted.current = true
        observer.disconnect()

        const startTime = performance.now()
        const duration = 2000

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeOut(progress)
          setCounts(stats.map((s) => Math.floor(s.value * eased)))
          if (progress < 1) requestAnimationFrame(tick)
          else setCounts(stats.map((s) => s.value))
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ width: "100%", background: "#ffffff", padding: "36px 0", borderBottom: "1px solid #f1f5f9" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=DM+Sans:opsz,wght@9..40,300;9..40,400&display=swap');

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .stat-item {
          text-align: center;
          padding: 0 16px;
        }
        .stat-item:not(:last-child) {
          border-right: 1px solid #e5e7eb;
        }
        .stat-number {
          font-family: 'Rajdhani', sans-serif;
          font-size: 44px;
          font-weight: 700;
          color: #2B3490;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #6B7280;
          letter-spacing: 0.5px;
          font-weight: 400;
          line-height: 1.4;
        }

        /* medium — 3 cols */
        @media (max-width: 900px) {
          .stats-grid  { grid-template-columns: repeat(3, 1fr); row-gap: 32px; }
          .stat-number { font-size: 36px; }
          .stat-item:not(:last-child) { border-right: none; }
        }
        /* mobile — 2 cols */
        @media (max-width: 580px) {
          .stats-grid  { grid-template-columns: repeat(2, 1fr); row-gap: 32px; padding: 0 20px; column-gap: 0; }
          .stat-number { font-size: 30px; }
        }
      `}</style>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-number">
              {counts[i]}{stat.suffix}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
