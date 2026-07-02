"use client"

import { useEffect, useRef, ReactNode } from "react"

interface FadeInOnScrollProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right"
}

export default function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up"
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-active")
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const getInitialTransform = () => {
    const distance = 30
    switch (direction) {
      case "up":
        return `translateY(${distance}px)`
      case "down":
        return `translateY(-${distance}px)`
      case "left":
        return `translateX(${distance}px)`
      case "right":
        return `translateX(-${distance}px)`
      default:
        return "translateY(30px)"
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: ${getInitialTransform()};
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }

        .fade-in-element {
          opacity: 0;
          transform: ${getInitialTransform()};
          transition: opacity ${duration}s ease-out, transform ${duration}s ease-out;
          transition-delay: ${delay}s;
        }

        .fade-in-element.fade-in-active {
          animation: fadeInUp ${duration}s ease-out ${delay}s forwards;
        }
      `}</style>

      <div ref={ref} className="fade-in-element">
        {children}
      </div>
    </>
  )
}
