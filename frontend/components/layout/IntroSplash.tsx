"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function IntroSplash() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Show splash for 4.5 seconds
    const timer = setTimeout(() => setShow(false), 4500)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#f4f3ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "clamp(300px, 80vw, 900px)",
          height: "auto",
          maxHeight: "90vh",
        }}
      >
        <video
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        >
          <source src="/ksrm-logo.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
