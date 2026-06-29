'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Container from '@/components/ui/Container'

function CountUpNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / 60
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return (
    <div style={{ fontSize: '42px', fontWeight: 800, color: '#D4A500', margin: '0' }}>
      {count}{suffix}
    </div>
  )
}

const Achievements = () => {
  const [mounted, setMounted] = useState(false)

  const achievements = [
    { target: 46, label: 'Years of Excellence' },
    { target: 50, label: 'Acres Campus Area' },
    { target: 2500, label: 'Students Intake', suffix: '+' },
    { target: 150, label: 'Faculty Members', suffix: '+' },
    { target: 7, label: 'Departments' },
    { target: 95, label: 'Placement Rate', suffix: '%' },
    { target: 500, label: 'Alumni Network', suffix: '+' },
    { target: 200, label: 'Companies Recruiting', suffix: '+' },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const stagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  return (
    <section style={{ background: 'rgba(43, 52, 144, 0.08)', padding: '60px 0' }}>
      <Container>
        <motion.div
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={stagger}
          className="achievements-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '60px',
          }}
        >
          {achievements.map((item, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '28px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <CountUpNumber target={item.target} suffix={item.suffix} />
              <div
                style={{
                  fontSize: '14px',
                  color: '#ccc',
                  marginTop: '8px',
                  letterSpacing: '1px',
                }}
              >
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div
          style={{
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #D4A500, transparent)',
            marginTop: '60px',
          }}
        />
      </Container>
    </section>
  )
}

export default Achievements
