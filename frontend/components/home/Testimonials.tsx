"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { testimonialsData } from "@/data/home"
import { Star } from "lucide-react"

const EASE = [0.22, 1, 0.36, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function Testimonials() {
  return (
    <section style={{ width: "100%", background: "#f7f8fa", padding: "56px 0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
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
            fontSize: "12px", fontWeight: 700, letterSpacing: "2px",
            color: "#2B3490", textTransform: "uppercase", marginBottom: "12px",
          }}>
            STUDENT VOICES
          </div>
          <h2 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "36px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px",
          }}>
            What Our Students Say
          </h2>
          <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
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
          {(Array.isArray(testimonialsData) ? testimonialsData : []).map((testimonial, i) => (
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
                  fontSize: "15px", color: "#666", lineHeight: 1.7, marginBottom: "24px", fontStyle: "italic",
                  margin: "0 0 24px",
                }}>
                  "{testimonial.quote}"
                </p>

                {/* AVATAR + NAME */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{
                    width: "44px", height: "44px",
                    borderRadius: "50%",
                    background: "#2B3490",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#ffffff", fontWeight: 700, fontSize: "14px",
                  }}>
                    {testimonial.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "14px", fontWeight: 700, color: "#1a1a2e",
                    }}>
                      {testimonial.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
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
