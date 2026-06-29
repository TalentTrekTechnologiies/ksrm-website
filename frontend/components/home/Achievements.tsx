'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/Container'

const Achievements = () => {
  const achievements = [
    { number: '40+', label: 'Years of Excellence' },
    { number: '50', label: 'Acres Campus Area' },
    { number: '2500+', label: 'Students Intake' },
    { number: '150+', label: 'Faculty Members' },
    { number: '7', label: 'Departments' },
    { number: '95%', label: 'Placement Rate' },
    { number: '500+', label: 'Alumni Network' },
    { number: '500+', label: 'Companies Recruiting' },
  ]

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
          whileInView="visible"
          viewport={{ once: true }}
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
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: '#D4A500',
                  margin: '0',
                }}
              >
                {item.number}
              </div>
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
