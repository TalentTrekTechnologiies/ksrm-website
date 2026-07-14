'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Container from '@/components/ui/Container'
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
      text: 'To provide high quality education with an enriched curriculum blended with impactful teaching-learning practices.',
    },
    {
      code: 'M2',
      text: 'To promote research, entrepreneurship and innovation through strong industry collaborations.',
    },
    {
      code: 'M3',
      text: 'To produce highly competent professional leaders contributing to the socio-economic development of the region and the nation.',
    },
  ],
}

// Static supporting copy shown under the heading — frames the official
// vision/mission statements (which come from the CMS) without altering them.
const INTRO =
  'Rooted in the ideals of our founders, K.S.R.M. College of Engineering pursues one clear purpose — to shape capable, ethical and innovative engineers who serve society and the nation. The vision and mission below guide every programme we design, every class we teach and every graduate we send into the world.'

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
    hidden: { opacity: 0, y: 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  return (
    <section className="vm-section">
      <style>{`
        .vm-section {
          position: relative;
          width: 100%;
          padding: 44px 0 52px;
          background: url('/Filtered/campus%20entrance.jpeg') center center / cover no-repeat;
          overflow: hidden;
        }
        .vm-overlay {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(180deg, rgba(12,18,45,0.46) 0%, rgba(12,18,45,0.66) 100%);
        }
        .vm-inner { position: relative; z-index: 1; }
        .vm-head { text-align: center; max-width: 860px; margin: 0 auto 30px; }
        .vm-eyebrow {
          font-size: 12px; letter-spacing: 3px; text-transform: uppercase;
          color: #FFE619; font-weight: 700; margin: 0 0 8px;
        }
        .vm-title {
          font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #fff;
          font-size: clamp(1.7rem, 3vw, 2.3rem); line-height: 1.1; margin: 0 0 12px;
          text-shadow: 0 2px 18px rgba(0,0,0,0.35);
        }
        .vm-intro {
          font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.9);
          margin: 0; text-shadow: 0 1px 10px rgba(0,0,0,0.3);
        }
        .vm-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch;
        }
        .vm-card {
          background: linear-gradient(155deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.07) 55%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(22px) saturate(150%);
          -webkit-backdrop-filter: blur(22px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 18px;
          padding: 30px 32px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 18px 50px rgba(0,0,0,0.32);
          color: #fff;
          display: flex; flex-direction: column;
        }
        .vm-kicker {
          font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
          color: #FFE619; font-weight: 700; margin-bottom: 4px;
        }
        .vm-card-title {
          font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #fff;
          font-size: 27px; line-height: 1; margin: 0 0 14px;
        }
        .vm-quote {
          font-family: Georgia, serif; font-size: 50px; line-height: 0.5;
          color: rgba(255,230,25,0.45); display: block; margin-bottom: 4px;
        }
        .vm-text { font-size: 16px; line-height: 1.75; color: rgba(255,255,255,0.95); margin: 0; font-style: italic; }
        .vm-rule { width: 56px; height: 3px; background: #FFE619; margin-top: 18px; border-radius: 2px; }
        .vm-missions { display: flex; flex-direction: column; gap: 15px; }
        .vm-mission-row { display: flex; gap: 14px; align-items: flex-start; }
        .vm-mcode {
          flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%;
          background: #FFE619; color: #1a1d4d; font-weight: 800; font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Rajdhani', sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }
        .vm-mtext { font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.92); margin: 2px 0 0; }
        @media (max-width: 900px) {
          .vm-grid { grid-template-columns: 1fr; gap: 18px; }
          .vm-card { padding: 26px 24px; }
        }
      `}</style>

      <div className="vm-overlay" />

      <Container>
        <div className="vm-inner">
          <motion.div
            className="vm-head"
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            variants={fadeUp}
          >
            <p className="vm-eyebrow">{vision.eyebrow ?? 'Who We Are'}</p>
            <h2 className="vm-title">{vision.heading}</h2>
            <p className="vm-intro">{INTRO}</p>
          </motion.div>

          <div className="vm-grid">
            {/* VISION */}
            <motion.div
              className="vm-card"
              initial="hidden"
              animate={mounted ? 'visible' : 'hidden'}
              variants={fadeUp}
            >
              <div className="vm-kicker">{vision.label}</div>
              <h3 className="vm-card-title">Vision</h3>
              <span className="vm-quote">&ldquo;</span>
              <p className="vm-text">{vision.text}</p>
              <div className="vm-rule" />
            </motion.div>

            {/* MISSION */}
            <motion.div
              className="vm-card"
              initial="hidden"
              animate={mounted ? 'visible' : 'hidden'}
              variants={fadeUp}
              transition={{ delay: 0.1 }}
            >
              <div className="vm-kicker">{mission.label}</div>
              <h3 className="vm-card-title">Mission</h3>
              <div className="vm-missions">
                {mission.missions.map((item, idx) => (
                  <div key={idx} className="vm-mission-row">
                    <span className="vm-mcode">{item.code}</span>
                    <p className="vm-mtext">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  )
}
