"use client"

import { useState, useEffect, useRef } from "react"

interface AnimatedCounterProps {
  end: number
  suffix?: string
  duration?: number
  label?: string
}

export default function AnimatedCounter({ end, suffix = "", duration = 2, label }: AnimatedCounterProps) {
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
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let current = 0
    const increment = end / (duration * 60) // 60 frames per second
    const interval = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 1000 / 60)

    return () => clearInterval(interval)
  }, [hasStarted, end, duration])

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          color: "#2B3490",
          fontFamily: "'Rajdhani', sans-serif",
          lineHeight: 1.2,
        }}
      >
        {count.toLocaleString()}{suffix}
      </div>
      {label && (
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#666",
            marginTop: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
