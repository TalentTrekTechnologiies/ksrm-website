"use client"

import { useEffect, useState } from "react"

export default function IntroSplash() {
  const [show, setShow] = useState(true)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),   // parts fly in
      setTimeout(() => setPhase(2), 3700),  // dip (anticipation)
      setTimeout(() => setPhase(3), 4100),  // zoom large + vanish
      setTimeout(() => setShow(false), 5300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!show) return null

  const part: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    transition: "all 2.3s cubic-bezier(0.16, 1, 0.3, 1)",
  }

  let stageTransform = "scale(1)"
  let stageOpacity = 1
  let stageTransition = "transform 0.35s ease"
  if (phase === 2) { stageTransform = "scale(0.92)" }
  if (phase === 3) {
    stageTransform = "scale(4.2)"
    stageOpacity = 0
    stageTransition = "transform 1.1s cubic-bezier(0.6,0,0.8,0.2), opacity 1.1s ease"
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#f4f3ef",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: phase === 3 ? 0 : 1,
      transition: "opacity 1.1s ease",
      pointerEvents: phase === 3 ? "none" : "auto",
    }}>
      <div style={{
        position: "absolute",
        width: "clamp(540px, 79vw, 990px)",
        height: "clamp(540px, 79vw, 990px)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(43,52,144,0.12) 0%, rgba(43,52,144,0) 70%)",
        opacity: phase >= 1 && phase < 3 ? 1 : 0,
        transition: "opacity 1.5s ease",
      }} />

      <div style={{
        position: "relative",
        width: "clamp(396px, 72vw, 810px)",
        height: "clamp(396px, 72vw, 810px)",
        transform: stageTransform,
        opacity: stageOpacity,
        transition: stageTransition,
      }}>
        <img src="/ring.png" alt="" style={{
          ...part,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translate(0,0) rotate(0deg) scale(1)" : "translate(-90vw,0) rotate(-220deg) scale(0.5)",
        }} />
        <img src="/book.png" alt="" style={{
          ...part,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translate(0,0) scale(1)" : "translate(0,-90vh) scale(0.6)",
          transitionDelay: "0.5s",
        }} />
        <img src="/banner.png" alt="" style={{
          ...part,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translate(0,0) scale(1)" : "translate(0,90vh) scale(0.6)",
          transitionDelay: "1s",
        }} />
      </div>
    </div>
  )
}
