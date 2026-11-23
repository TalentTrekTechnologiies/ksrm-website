"use client"

import { useVisionMission } from "@/lib/vision-mission"

/**
 * The About page's Vision statement and Mission list, from the same record as
 * the homepage (Admin -> Homepage -> Vision / Mission). The page used to keep
 * its own copy, which could not be edited there and fell out of step with
 * the homepage. Styling stays the About page's own (k-* classes).
 */
export function AboutVisionText() {
  const { vision } = useVisionMission()
  return <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.7" }}>{vision.text}</p>
}

export function AboutMissionItems() {
  const { mission } = useVisionMission()
  return (
    <div className="k-mission-items">
      {mission.missions.map((m, i) => (
        <div key={`${m.code}-${i}`} className="k-mission-item">
          <div className="k-mission-badge">{m.code}</div>
          <div className="k-mission-text">{m.text}</div>
        </div>
      ))}
    </div>
  )
}
