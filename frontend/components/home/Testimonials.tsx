"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { testimonialsData } from "@/data/home"
import { Star } from "lucide-react"
import { getTestimonialsPublic } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const EASE = [0.22, 1, 0.36, 1] as const

interface DisplayTestimonial {
  name: string
  degree: string
  company: string
  quote: string
  rating: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const FALLBACK_TESTIMONIALS: DisplayTestimonial[] = Array.isArray(testimonialsData) ? testimonialsData : []

interface TestimonialsState {
  hidden: boolean
  testimonials: DisplayTestimonial[]
}

async function fetchTestimonials(): Promise<TestimonialsState> {
  const { visible, items } = await getTestimonialsPublic()
  if (!visible) return { hidden: true, testimonials: FALLBACK_TESTIMONIALS }
  if (items.length === 0) return { hidden: false, testimonials: FALLBACK_TESTIMONIALS }
  return {
    hidden: false,
    testimonials: items.map((t) => ({
      name: t.name,
      degree: t.role,
      company: t.company ?? "",
      quote: t.quote,
      rating: t.rating,
    })),
  }
}

export default function Testimonials() {
  const live = useLiveData(fetchTestimonials, [])
  const hidden = live?.hidden ?? false
  const testimonials = live?.testimonials ?? FALLBACK_TESTIMONIALS

  if (hidden) return null

  return (
    <section style={{ width: "100%", background: "#f7f8fa", padding: "40px 0" }}>
      <style>{`
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin: 40px 0;
        }
        @media (max-width: 1024px) {
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .testimonials-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Container>
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          <div style={{
            fontSize: "14px", fontWeight: 700, letterSpacing: "2px",
            color: "#2B3490", textTransform: "uppercase", marginBottom: "12px",
          }}>
            STUDENT VOICES
          </div>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "clamp(21px, 5.8vw, 36px)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px",
          }}>
            What Our Students Say
          </h2>
          <p style={{ fontSize: "18px", color: "#666", margin: 0 }}>
            Real stories from real achievers
          </p>
        </motion.div>

        {/* TESTIMONIALS GRID */}
        <motion.div
          className="testimonials-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, i) => (
            <motion.div key={i} variants={cardVariants}>
              <div style={{
                background: "#ffffff",
                border: "1px solid #eef0f3",
                borderRadius: "14px",
                padding: "28px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}>
                {/* STARS */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                  {Array(testimonial?.rating ?? 5).fill(0).map((_, i) => (
                    <Star key={i} size={16} fill="#FFE619" color="#FFE619" />
                  ))}
                </div>

                {/* QUOTE */}
                <p style={{
                  fontSize: "17px", color: "#666", lineHeight: 1.7, marginBottom: "24px", fontStyle: "italic",
                  margin: "0 0 24px",
                }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* AVATAR + NAME */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{
                    width: "44px", height: "44px",
                    borderRadius: "50%",
                    background: "#2B3490",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#ffffff", fontWeight: 700, fontSize: "16px",
                  }}>
                    {testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "16px", fontWeight: 700, color: "#1a1a2e",
                    }}>
                      {testimonial.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#888" }}>
                      {testimonial.degree} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
