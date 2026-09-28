"use client"

import { useEffect, useMemo, useState } from "react"
import CameraResistantViewer, {
  PatternType,
} from "@/components/CameraResistantViewer"

/**
 * The bench for the camera-resistance experiment.
 *
 * Seven configurations of the same paragraph, so a phone photographed against
 * this page produces seven directly comparable results in one shot. Nothing
 * here asserts that any of it works - that is what the table at the bottom is
 * for, and the honest outcome may well be that only the watermark survives.
 */

interface Config {
  key: string
  label: string
  note: string
  props: Partial<React.ComponentProps<typeof CameraResistantViewer>>
}

const SAMPLE = `Criterion 3.4.2 — The institution provides incentives to teachers who
receive state, national and international recognition for research
contributions. Supporting documents for the assessment period are enclosed,
including sanction letters, utilisation certificates and the audited statement
of accounts for each financial year under review. Figures in Table 3.4.2(a)
are reconciled against the annual accounts.`

function configs(watermarkText: string): Config[] {
  return [
    {
      key: "A",
      label: "A — No protection",
      note: "Control. Whatever a phone does to this is the baseline everything else is judged against.",
      props: { protectionLevel: "off" },
    },
    {
      key: "B",
      label: "B — Static watermark",
      note: "No movement, no modulation. Survives any camera, any mode. Attribution only.",
      props: {
        protectionLevel: "off",
        watermark: true,
        watermarkMotion: false,
        watermarkText,
        opacity: 0,
        modulationSpeed: 0,
      },
    },
    {
      key: "C",
      label: "C — Dynamic watermark",
      note: "Drifts and re-phases, so two photographs are not stamped identically.",
      props: { protectionLevel: "low", watermarkText },
    },
    {
      key: "D",
      label: "D — Temporal modulation",
      note: "Pattern at +delta then -delta on alternate frames. The eye averages it away; a short exposure should not.",
      props: {
        protectionLevel: "off",
        patternType: "horizontal",
        patternFrequency: 4,
        modulationSpeed: 1,
        opacity: 0.1,
        watermark: false,
      },
    },
    {
      key: "E",
      label: "E — Spatial interference",
      note: "Static fine grating. Aliases in the sensor, but defeated by changing distance or zoom.",
      props: {
        protectionLevel: "off",
        patternType: "moire",
        patternFrequency: 3,
        modulationSpeed: 0,
        opacity: 0.1,
        watermark: false,
      },
    },
    {
      key: "F",
      label: "F — Temporal + spatial",
      note: "Both at once, no watermark, to see whether they add or simply cost readability twice.",
      props: {
        protectionLevel: "off",
        patternType: "checker",
        patternFrequency: 3,
        modulationSpeed: 1,
        opacity: 0.12,
        watermark: false,
      },
    },
    {
      key: "G",
      label: "G — Everything",
      note: "The full stack. Judge readability here hardest: this is the configuration most likely to fail the human test.",
      props: { protectionLevel: "max", watermarkText },
    },
  ]
}

interface Row {
  phone: string
  camera: string
  humanReadability: string
  photoReadability: string
  distortion: string
  result: string
}

const EMPTY: Row = {
  phone: "",
  camera: "",
  humanReadability: "",
  photoReadability: "",
  distortion: "",
  result: "",
}

const STORE_KEY = "ksrm-camera-lab-results"

export default function CameraLabPage() {
  const [fps, setFps] = useState<number | null>(null)
  const [session] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase())
  const [user, setUser] = useState("reviewer")
  const [now, setNow] = useState("")
  const [rows, setRows] = useState<Record<string, Row>>({})

  useEffect(() => {
    setNow(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) setRows(JSON.parse(raw) as Record<string, Row>)
    } catch {
      // A lab note is not worth failing the page over.
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(rows))
    } catch {
      /* private window, or storage full - the table still works in memory */
    }
  }, [rows])

  const watermarkText = useMemo(
    () => `KSRM COLLEGE · VIEW ONLY · ${user} · ${session} · ${now}`,
    [user, session, now],
  )

  const list = configs(watermarkText)

  const set = (key: string, field: keyof Row, value: string) =>
    setRows((r) => ({ ...r, [key]: { ...(r[key] ?? EMPTY), [field]: value } }))

  const csv = () => {
    const header = [
      "Config",
      "Phone",
      "Camera mode",
      "Human readability",
      "Photo readability",
      "Photo distortion",
      "Result",
    ]
    const lines = list.map((c) => {
      const r = rows[c.key] ?? EMPTY
      return [c.label, r.phone, r.camera, r.humanReadability, r.photoReadability, r.distortion, r.result]
        .map((v) => `"${(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    })
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `camera-lab-${session}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", padding: "28px 20px 80px" }}>
      <style>{`
        .lab { max-width: 1200px; margin: 0 auto; font-family: system-ui, sans-serif; color: #1a1a2e; }
        .lab h1 { font-size: 26px; margin: 0 0 6px; }
        .lab .sub { color: #666; font-size: 14.5px; margin: 0 0 18px; line-height: 1.6; }
        .warn { background: #fff4e5; border: 1px solid #ffd8a8; color: #7a4100; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; line-height: 1.6; margin-bottom: 18px; }
        .bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; font-size: 14px; }
        .bar input { border: 1px solid #d7dbe7; border-radius: 8px; padding: 7px 10px; font: inherit; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 18px; }
        .cell { background: #fff; border: 1px solid #e4e8f2; border-radius: 12px; overflow: hidden; }
        .cell h2 { font-size: 15px; margin: 0; padding: 10px 14px; background: #2B3490; color: #fff; }
        .cell .note { font-size: 12.5px; color: #667; padding: 9px 14px 0; line-height: 1.5; }
        .doc { padding: 14px; font-size: 14.5px; line-height: 1.75; white-space: pre-line; }
        table { width: 100%; border-collapse: collapse; background: #fff; font-size: 13.5px; margin-top: 14px; }
        th, td { border: 1px solid #e4e8f2; padding: 7px 8px; text-align: left; vertical-align: top; }
        th { background: #eef1f8; font-weight: 700; }
        td input { width: 100%; border: none; font: inherit; background: transparent; }
        td input:focus { outline: 2px solid #2B3490; border-radius: 4px; }
        .btn { background: #2B3490; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-weight: 600; cursor: pointer; }
      `}</style>

      <div className="lab">
        <h1>Camera resistance — experiment</h1>
        <p className="sub">
          Seven configurations of the same paragraph. Read each one on the screen, then
          photograph this page with a phone and compare. Record what you find in the
          table; the aim is to learn which of these survives a real camera, not to
          assume any of them does.
        </p>

        <div className="warn">
          <strong>Flicker warning.</strong> Configurations D, F and G alternate the
          overlay every frame. If you are sensitive to flicker, or prone to
          photosensitive seizures, do not view them — they are disabled automatically
          if your system is set to reduce motion.
          {fps !== null && (
            <>
              {" "}This display is running at about <strong>{fps} Hz</strong>, which is
              the ceiling on how fast anything here can alternate.
            </>
          )}
        </div>

        <div className="bar">
          <label>
            Viewer label{" "}
            <input value={user} onChange={(e) => setUser(e.target.value)} />
          </label>
          <span style={{ color: "#667" }}>Session {session}</span>
          <button type="button" className="btn" onClick={csv}>
            Export results as CSV
          </button>
        </div>

        <div className="grid">
          {list.map((c, i) => (
            <div className="cell" key={c.key}>
              <h2>{c.label}</h2>
              <p className="note">{c.note}</p>
              <CameraResistantViewer
                {...c.props}
                onFps={i === 0 ? setFps : undefined}
              >
                <div className="doc">{SAMPLE}</div>
              </CameraResistantViewer>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 18, margin: "30px 0 0" }}>Results</h2>
        <p className="sub" style={{ margin: "4px 0 0" }}>
          One row per configuration, per phone. Saved in this browser as you type.
        </p>

        <table>
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Config</th>
              <th>Phone</th>
              <th>Camera mode</th>
              <th>Human readability</th>
              <th>Photo readability</th>
              <th>Photo distortion</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const r = rows[c.key] ?? EMPTY
              return (
                <tr key={c.key}>
                  <td>{c.label}</td>
                  <td><input value={r.phone} onChange={(e) => set(c.key, "phone", e.target.value)} placeholder="iPhone 14" /></td>
                  <td><input value={r.camera} onChange={(e) => set(c.key, "camera", e.target.value)} placeholder="auto / HDR off / night" /></td>
                  <td><input value={r.humanReadability} onChange={(e) => set(c.key, "humanReadability", e.target.value)} placeholder="easy / strained / no" /></td>
                  <td><input value={r.photoReadability} onChange={(e) => set(c.key, "photoReadability", e.target.value)} placeholder="full / partial / none" /></td>
                  <td><input value={r.distortion} onChange={(e) => set(c.key, "distortion", e.target.value)} placeholder="none / bands / moire" /></td>
                  <td><input value={r.result} onChange={(e) => set(c.key, "result", e.target.value)} placeholder="worth keeping?" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <p className="sub" style={{ marginTop: 18 }}>
          What to try per phone: default auto mode, HDR off, night mode, and a video
          recording with a frame extracted afterwards. The temporal configurations are
          expected to fail against HDR and video, because both average several
          exposures together — which is exactly the thing the effect depends on not
          happening. If that is what you find, it is the finding.
        </p>
      </div>
    </main>
  )
}
