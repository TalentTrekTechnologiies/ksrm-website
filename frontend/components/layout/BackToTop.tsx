"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(43, 52, 144, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(43, 52, 144, 0);
          }
        }

        .back-to-top {
          animation: slideUp 0.3s ease-out;
        }

        .back-to-top:hover {
          animation: pulse 1.5s infinite;
        }
      `}</style>

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="back-to-top"
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
            border: "2px solid #FFE619",
            color: "#FFE619",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(43, 52, 144, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)"
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(43, 52, 144, 0.4)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(43, 52, 144, 0.3)"
          }}
          aria-label="Back to top"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </button>
      )}
    </>
  )
}
