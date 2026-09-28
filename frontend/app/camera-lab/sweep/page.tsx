"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import CameraResistantViewer, {
  PatternType,
} from "@/components/CameraResistantViewer"

/**
 * One panel, configured entirely from the query string, so a script can sweep
 * the parameter space and OCR the result.
 *
 * The seven fixed configurations on the lab page answered "does the idea
 * work"; the answer from OCR was no - 98% of words still transcribed. This
 * exists to answer the follow-up honestly: is there ANY combination of
 * strength and scale that costs an attacker something without costing a reader
 * more, or is the whole approach a dead end at 60Hz?
 *
 *   /camera-lab/sweep?pattern=checker&freq=3&speed=1&opacity=0.2
 */

const SAMPLE = `Criterion 3.4.2 — The institution provides incentives to teachers who
receive state, national and international recognition for research
contributions. Supporting documents for the assessment period are enclosed,
including sanction letters, utilisation certificates and the audited statement
of accounts for each financial year under review. Figures in Table 3.4.2(a)
are reconciled against the annual accounts.`

function SweepPanel() {
  const q = useSearchParams()
  const num = (k: string, d: number) => {
    const v = Number(q.get(k))
    return Number.isFinite(v) && q.get(k) !== null ? v : d
  }

  return (
    <main style={{ background: "#fff", padding: 0, margin: 0 }}>
      <div id="panel" style={{ width: 760, background: "#fff" }}>
        <CameraResistantViewer
          protectionLevel="off"
          patternType={(q.get("pattern") as PatternType) ?? "checker"}
          patternFrequency={num("freq", 3)}
          modulationSpeed={num("speed", 1)}
          opacity={num("opacity", 0.12)}
          watermark={q.get("watermark") === "1"}
          watermarkText="KSRM COLLEGE · VIEW ONLY"
        >
          <div
            style={{
              padding: 20,
              fontFamily: "system-ui, sans-serif",
              fontSize: 15,
              lineHeight: 1.75,
              color: "#111",
              whiteSpace: "pre-line",
            }}
          >
            {SAMPLE}
          </div>
        </CameraResistantViewer>
      </div>
    </main>
  )
}

export default function SweepPage() {
  return (
    <Suspense fallback={null}>
      <SweepPanel />
    </Suspense>
  )
}
