"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import CameraResistantViewer, {
  PatternType,
} from "@/components/CameraResistantViewer"
import { FIXTURE } from "@/lib/readability-fixture"

/**
 * One panel, configured entirely from the query string, so the optimiser can
 * search the parameter space and score every point by OCR.
 *
 * Renders the mixed fixture - heading, prose, small print, figures, table -
 * rather than one paragraph. Numbers and tables are most of an accreditation
 * document and they degrade differently from prose, so a setting that keeps
 * the prose and loses the figures must not be allowed to score as a success.
 *
 * Each part is wrapped with a data attribute so the optimiser can crop and
 * score them one at a time.
 *
 *   /camera-lab/sweep?pattern=checker&freq=3&speed=1&opacity=0.2&dither=0.1&freq2=5
 *   &cycle=8    cycles eight different masks instead of reusing one
 *   &content=1  masks the CONTENT instead of overlaying it
 */

function num(q: URLSearchParams, key: string, fallback: number): number {
  const raw = q.get(key)
  if (raw === null) return fallback
  const v = Number(raw)
  return Number.isFinite(v) ? v : fallback
}

function SweepPanel() {
  const q = useSearchParams()

  return (
    <main style={{ background: "#fff", padding: 0, margin: 0 }}>
      <div id="panel" style={{ width: 820, background: "#fff" }}>
        <CameraResistantViewer
          protectionLevel="off"
          patternType={(q.get("pattern") as PatternType) ?? "checker"}
          patternFrequency={num(q, "freq", 3)}
          modulationSpeed={num(q, "speed", 1)}
          opacity={num(q, "opacity", 0.12)}
          ditherIntensity={num(q, "dither", 0)}
          secondaryFrequency={num(q, "freq2", 0)}
          phaseShiftSpeed={num(q, "phase", 1 / 120)}
          maskCycle={num(q, "cycle", 0)}
          contentMask={q.get("content") === "1"}
          // The lab holds the block size fixed so the OCR numbers stay
          // comparable between runs. The production viewer scales it with the
          // rendered width instead - see ProtectedDocumentViewer.
          
          watermark={q.get("watermark") === "1"}
          watermarkText="KSRM COLLEGE · CONFIDENTIAL — VIEW ONLY"
        >
          <div
            style={{
              padding: 22,
              fontFamily: "system-ui, sans-serif",
              color: "#111",
              lineHeight: 1.7,
            }}
          >
            <h2 data-part="heading" style={{ fontSize: 22, margin: "0 0 12px" }}>
              {FIXTURE[0].text}
            </h2>
            <p data-part="paragraph" style={{ fontSize: 15, margin: "0 0 12px" }}>
              {FIXTURE[1].text}
            </p>
            <p data-part="small" style={{ fontSize: 12, margin: "0 0 12px", color: "#333" }}>
              {FIXTURE[2].text}
            </p>
            <p data-part="numbers" style={{ fontSize: 15, margin: "0 0 12px", fontVariantNumeric: "tabular-nums" }}>
              Sanctioned 4820000 &nbsp; Utilised 4617500 &nbsp; Balance 202500 &nbsp;
              Projects 37 &nbsp; Patents 12 &nbsp; Publications 284
            </p>
            <table
              data-part="table"
              style={{ borderCollapse: "collapse", fontSize: 14, fontVariantNumeric: "tabular-nums" }}
            >
              <thead>
                <tr>
                  {["Year", "Projects", "Papers", "Grant (Rs)"].map((h) => (
                    <th key={h} style={{ border: "1px solid #999", padding: "4px 12px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["2021-22", "18", "42", "1260000"],
                  ["2022-23", "24", "61", "1845000"],
                  ["2023-24", "31", "77", "2410000"],
                  ["2024-25", "37", "84", "2905000"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ border: "1px solid #999", padding: "4px 12px" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
