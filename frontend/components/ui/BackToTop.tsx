'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #2B3490;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(43, 52, 144, 0.25);
          transition: all 0.3s ease;
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .back-to-top:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(43, 52, 144, 0.35);
        }

        .back-to-top:active {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .back-to-top {
            bottom: 100px;
            right: 16px;
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 460px) {
          .back-to-top {
            bottom: 90px;
            right: 12px;
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      <button
        onClick={scrollToTop}
        className={`back-to-top ${isVisible ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>
    </>
  )
}
