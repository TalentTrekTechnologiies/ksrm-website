"use client"

import { useEffect, useMemo, useState } from "react"
import CameraResistantViewer from "@/components/CameraResistantViewer"
import { recogniseImage, scoreTranscript, OcrScore } from "@/lib/ocr-benchmark"

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

/**
 * The seven configurations, as specified: NONE, WATERMARK, TEMPORAL, SPATIAL,
 * TEMPORAL + SPATIAL, TEMPORAL + DITHERING, EVERYTHING.
 *
 * Parameters come from the optimiser, not from judgement. It searched pattern,
 * period, strength, dithering and a second frequency, scored every point by
 * OCR on a single frame against the average of sixteen, and required the
 * reader to keep 90% of what the unprotected page yields - words and figures
 * separately. The temporal settings here sit at 0.3, the strongest amplitude
 * that kept the reader at 100/100; 0.4 separates harder but is in the range
 * where flicker becomes pronounced, and a simulation cannot measure that.
 */
function configs(watermarkText: string): Config[] {
  return [
    {
      key: "A",
      label: "A — None",
      note: "Control. Whatever a phone does to this is the baseline everything else is judged against.",
      props: { protectionLevel: "off" },
    },
    {
      key: "B",
      label: "B — Watermark",
      note: "Moving watermark only. Survives every capture mode, including HDR and video. Attribution, not prevention.",
      props: { protectionLevel: "off", watermark: true, watermarkText, opacity: 0, modulationSpeed: 0 },
    },
    {
      key: "C",
      label: "C — Temporal",
      note: "+delta / -delta on alternate frames at 0.3. Optimiser: a single frame loses 40% of words and 92% of figures; the average keeps all of both.",
      props: {
        protectionLevel: "off",
        patternType: "horizontal",
        patternFrequency: 3,
        modulationSpeed: 1,
        opacity: 0.3,
        watermark: false,
      },
    },
    {
      key: "D",
      label: "D — Spatial",
      note: "Static grating, no modulation. Aliases in the sensor, but is the same to the camera and the eye - and changing distance or zoom clears it.",
      props: {
        protectionLevel: "off",
        patternType: "moire",
        patternFrequency: 3,
        modulationSpeed: 0,
        opacity: 0.12,
        watermark: false,
      },
    },
    {
      key: "E",
      label: "E — Temporal + spatial",
      note: "Modulated checker plus a second grating in counter-phase, so no single distance clears both frequencies.",
      props: {
        protectionLevel: "off",
        patternType: "checker",
        patternFrequency: 3,
        modulationSpeed: 1,
        opacity: 0.3,
        secondaryFrequency: 5,
        watermark: false,
      },
    },
    {
      key: "F",
      label: "F — Temporal + dithering",
      note: "Modulation plus fresh noise each frame. Independent noise averages down by about the square root of the frame count, so the eye sees roughly a third of it.",
      props: {
        protectionLevel: "off",
        patternType: "horizontal",
        patternFrequency: 3,
        modulationSpeed: 1,
        opacity: 0.3,
        ditherIntensity: 0.1,
        watermark: false,
      },
    },
    {
      key: "G",
      label: "G — Everything",
      note: "Temporal, spatial, dithering and the watermark together. Judge readability here hardest.",
      props: {
        protectionLevel: "off",
        patternType: "checker",
        patternFrequency: 3,
        modulationSpeed: 1,
        opacity: 0.3,
        secondaryFrequency: 5,
        ditherIntensity: 0.1,
        watermark: true,
        watermarkText,
      },
    },
  ]
}

/**
 * The capture modes to try per phone. A fixed list rather than free text, so
 * rows from different testers line up. HDR on, night mode and video are the
 * ones expected to defeat the temporal layers - they average frames, which is
 * exactly what the eye does - so they are the ones that matter most to record.
 */
const MODES = [
  "Auto photo",
  "HDR on",
  "HDR off",
  "Night mode",
  "Video",
  "Frame extracted from video",
  "Closer / further",
  "Zoomed",
  "Angled",
]

interface Row {
  phone: string
  camera: string
  humanReadability: string
  photoReadability: string
  distortion: string
  result: string
  patternVisible?: string
  watermarkVisible?: string
  /** Filled by OCR rather than by eye - "looks noisy" and "cannot be copied"
   *  turned out to be different things, and only the second one matters. */
  ocrChar?: number
  ocrWords?: number
  ocrTranscript?: string
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
    () => `KSRM COLLEGE · CONFIDENTIAL — VIEW ONLY · Viewer ${user} · Session ${session} · ${now}`,
    [user, session, now],
  )

  const list = configs(watermarkText)

  const set = (key: string, field: keyof Row, value: string) =>
    setRows((r) => ({ ...r, [key]: { ...(r[key] ?? EMPTY), [field]: value } }))

  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  /**
   * Scores a photograph of one panel by reading the text back out of it.
   *
   * This is the measurement that matters. An earlier pass scored these by how
   * much fine detail the image carried, and by that measure the strongest
   * configuration looked 89% better - while OCR still recovered 98% of the
   * words from it. A photograph can be covered in stripes and transcribe
   * perfectly.
   */
  async function scorePhoto(key: string, file: File) {
    setBusy(key)
    setProgress(0)
    try {
      const text = await recogniseImage(file, setProgress)
      const s: OcrScore = scoreTranscript(SAMPLE, text)
      setRows((r) => ({
        ...r,
        [key]: {
          ...(r[key] ?? EMPTY),
          ocrChar: s.characterAccuracy,
          ocrWords: s.wordRecall,
          ocrTranscript: s.transcript,
          photoReadability:
            s.wordRecall > 0.9 ? "copies fully" : s.wordRecall > 0.4 ? "partial" : "not usable",
        },
      }))
    } catch {
      setRows((r) => ({ ...r, [key]: { ...(r[key] ?? EMPTY), photoReadability: "OCR failed" } }))
    } finally {
      setBusy(null)
    }
  }

  const pct = (v?: number) => (v === undefined ? "—" : `${Math.round(v * 100)}%`)

  const csv = () => {
    const header = [
      "Config",
      "Phone",
      "Camera mode",
      "Human readability",
      "OCR character accuracy",
      "OCR word recall",
      "Photo readability",
      "Pattern visible",
      "Watermark visible",
      "Result",
      "OCR transcript",
    ]
    const lines = list.map((c) => {
      const r = rows[c.key] ?? EMPTY
      return [
        c.label,
        r.phone,
        r.camera,
        r.humanReadability,
        pct(r.ocrChar),
        pct(r.ocrWords),
        r.photoReadability,
        r.patternVisible ?? "",
        r.watermarkVisible ?? "",
        r.result,
        r.ocrTranscript ?? "",
      ]
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
        .ocr { display: inline-block; margin-top: 4px; font-size: 11.5px; font-weight: 700; color: #2B3490; cursor: pointer; text-decoration: underline; }
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

        <h2 style={{ fontSize: 18, margin: "30px 0 4px" }}>Human readability test</h2>
        <p className="sub" style={{ margin: "0 0 8px" }}>
          The same document - heading, paragraph, small print, figures and a table - at
          each strength the optimiser tested. Open each and read it at normal distance
          for a minute. The acceptance bar is that you can read all five parts{" "}
          <strong>comfortably</strong>; if one of these tires your eyes or visibly
          flickers, that strength is too high regardless of what OCR says.
        </p>
        <div className="bar">
          {[
            ["None", "pattern=none&freq=0&speed=0&opacity=0"],
            ["0.1", "pattern=horizontal&freq=3&speed=1&opacity=0.1"],
            ["0.2", "pattern=checker&freq=4&speed=1&opacity=0.2"],
            ["0.3 (lab default)", "pattern=horizontal&freq=3&speed=1&opacity=0.3"],
            ["0.4 (flicker range)", "pattern=checker&freq=3&speed=1&opacity=0.4"],
          ].map(([label, qs]) => (
            <a key={label} className="btn" style={{ textDecoration: "none" }} href={`/camera-lab/sweep/?${qs}`} target="_blank" rel="noreferrer">
              {label}
            </a>
          ))}
        </div>

        <h2 style={{ fontSize: 18, margin: "30px 0 0" }}>Results</h2>
        <p className="sub" style={{ margin: "4px 0 0" }}>
          One row per configuration, per phone. Saved in this browser as you type.
          Photograph a panel, then use <strong>Score a photo</strong> in its row: the
          image is read with OCR and compared against the original text, entirely in
          this browser.
        </p>
        <p className="sub" style={{ margin: "4px 0 0" }}>
          <strong>OCR words</strong> is the number that matters — the share of the
          document&apos;s words recovered exactly. Someone copying a document needs the
          words, not the pixels. A panel can look ruined and still score 98%.
        </p>

        <table>
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Config</th>
              <th>Phone</th>
              <th>Camera mode</th>
              <th>Human readability</th>
              <th>OCR chars</th>
              <th>OCR words</th>
              <th>Photo readability</th>
              <th>Pattern visible?</th>
              <th>Watermark visible?</th>
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
                  <td>
                    <select value={r.camera} onChange={(e) => set(c.key, "camera", e.target.value)} style={{ width: "100%", border: "none", font: "inherit", background: "transparent" }}>
                      <option value="">— mode —</option>
                      {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td><input value={r.humanReadability} onChange={(e) => set(c.key, "humanReadability", e.target.value)} placeholder="easy / strained / no" /></td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{pct(r.ocrChar)}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{pct(r.ocrWords)}</td>
                  <td>
                    <input value={r.photoReadability} onChange={(e) => set(c.key, "photoReadability", e.target.value)} placeholder="run OCR below" />
                    <label className="ocr">
                      {busy === c.key ? `Reading… ${Math.round(progress * 100)}%` : "Score a photo"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={busy !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) void scorePhoto(c.key, f)
                          e.target.value = ""
                        }}
                      />
                    </label>
                  </td>
                  <td><input value={r.patternVisible ?? ""} onChange={(e) => set(c.key, "patternVisible", e.target.value)} placeholder="stripes / moire / none" /></td>
                  <td><input value={r.watermarkVisible ?? ""} onChange={(e) => set(c.key, "watermarkVisible", e.target.value)} placeholder="yes / partial / no" /></td>
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
