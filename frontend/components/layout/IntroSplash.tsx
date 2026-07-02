"use client"

import { useEffect, useState } from "react"

export default function IntroSplash() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Video duration is 4 seconds, show splash for 4.5 seconds then fade out
    const timer = setTimeout(() => setShow(false), 4500)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "#f4f3ef",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: 1,
      transition: "opacity 0.5s ease",
      pointerEvents: "auto",
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "clamp(300px, 80vw, 900px)",
          height: "auto",
          maxHeight: "90vh",
          objectFit: "contain",
          display: "block",
        }}
      >
        <source src="/ksrm-logo.mov" type="video/quicktime" />
        <source src="/ksrm-logo.mov" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
