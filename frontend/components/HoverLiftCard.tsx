"use client"

import { ReactNode } from "react"

interface HoverLiftCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function HoverLiftCard({ children, className = "", style = {} }: HoverLiftCardProps) {
  return (
    <>
      <style>{`
        .hover-lift-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        .hover-lift-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(43, 52, 144, 0.15);
        }
      `}</style>

      <div className={`hover-lift-card ${className}`} style={style}>
        {children}
      </div>
    </>
  )
}
