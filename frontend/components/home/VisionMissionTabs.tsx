'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getSectionPublic, VisionContent, MissionContent } from '@/lib/homepage-api'
import { useLiveData } from '@/lib/use-live-data'

const FALLBACK_VISION: VisionContent = {
  eyebrow: 'Who We Are',
  heading: 'Our Vision & Mission',
  label: 'Our Vision',
  text: 'To evolve as center of repute for providing quality academic programs amalgamated with creative learning and research excellence to produce graduates with leadership qualities, ethical and human values to serve the nation.',
}

const FALLBACK_MISSION: MissionContent = {
  label: 'Our Mission',
  missions: [
    {
      code: 'M1',
      text: 'To provide high quality education with enriched curriculum blended with impactful teaching-learning practices.',
    },
    {
      code: 'M2',
      text: 'To promote research, entrepreneurship and innovation through industry collaborations.',
    },
    {
      code: 'M3',
      text: 'To produce highly competent professional leaders for contributing to Socio-economic development of region and the nation.',
    },
  ],
}

interface VisionMissionState {
  vision: VisionContent
  mission: MissionContent
}

async function fetchVisionMission(): Promise<VisionMissionState> {
  const [visionSection, missionSection] = await Promise.all([
    getSectionPublic('vision'),
    getSectionPublic('mission'),
  ])
  return {
    vision: visionSection?.content ?? FALLBACK_VISION,
    mission: missionSection?.content ?? FALLBACK_MISSION,
  }
}

// previewData lets the admin Preview panel render this exact component with
// draft (unpublished) content instead of fetching - see
// app/admin/homepage/preview/[key]/page.tsx.
export default function VisionMissionTabs({
  previewData,
}: {
  previewData?: { vision?: VisionContent; mission?: MissionContent }
}) {
  const [mounted, setMounted] = useState(false)
  const live = useLiveData(fetchVisionMission, [], { skip: !!previewData })
  const vision = previewData?.vision ?? live?.vision ?? FALLBACK_VISION
  const mission = previewData?.mission ?? live?.mission ?? FALLBACK_MISSION

  useEffect(() => {
    setMounted(true)
  }, [])

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <>
      <section style={{ background: 'white', padding: '48px 0 0', textAlign: 'center', width: '100%' }}>
        <p
          style={{
            fontSize: '13px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#2B3490',
            fontWeight: 700,
            margin: '0 0 8px',
          }}
        >
          {vision.eyebrow ?? 'Who We Are'}
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 700,
            color: '#1a1d4d',
            fontFamily: "'Rajdhani', sans-serif",
            margin: '0 0 48px',
            paddingBottom: '0',
          }}
        >
          {vision.heading}
        </h2>
      </section>

      <section
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          position: 'relative',
          zIndex: 1,
          minHeight: '500px',
        }}
      >
        {/* Vision */}
        <motion.div
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={fadeUp}
          style={{
            background: 'linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%)',
            padding: 'clamp(32px, 6vw, 80px) clamp(20px, 5vw, 60px)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#D4A500',
              marginBottom: '16px',
              fontWeight: 700,
            }}
          >
            {vision.label}
          </div>
          <div style={{ fontSize: '80px', color: 'rgba(212, 165, 0, 0.2)', lineHeight: '0.8', display: 'block', marginBottom: '8px' }}>
            &ldquo;
          </div>
          <p
            style={{
              fontSize: '20px',
              lineHeight: 1.9,
              fontStyle: 'italic',
              color: 'white',
              margin: '0 0 32px',
            }}
          >
            {vision.text}
          </p>
          <div style={{ width: '60px', height: '3px', background: '#D4A500' }} />
        </motion.div>

        {/* Mission */}
        <motion.div
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          variants={fadeUp}
          style={{
            background: '#D4A500',
            padding: 'clamp(32px, 6vw, 80px) clamp(20px, 5vw, 60px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#2B3490',
              marginBottom: '24px',
              fontWeight: 700,
            }}
          >
            {mission.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {mission.missions.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                <div
                  style={{
                    background: '#2B3490',
                    color: '#D4A500',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                    flexShrink: 0,
                  }}
                >
                  {item.code}
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    color: '#1a1d4d',
                    lineHeight: 1.7,
                    fontWeight: 500,
                    margin: '0',
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  )
}
