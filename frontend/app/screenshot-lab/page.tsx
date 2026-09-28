"use client"

import { useEffect, useState } from "react"
import ProtectedDocumentViewer, {
  ProtectionLevel,
} from "@/components/ProtectedDocumentViewer"
import { recogniseImage, scoreTranscript } from "@/lib/ocr-benchmark"

/**
 * The bench for the real viewer, as opposed to /camera-lab which benches the
 * overlay on its own.
 *
 * Open a protected document here, try each capture method against it, then
 * feed the captured file back in. The image is read with OCR and scored, so
 * the row records what the capture was actually worth rather than how it
 * looked - the distinction that reversed the finding once it was measured.
 */

const METHODS = [
  { key: "printscreen", label: "PrintScreen key", os: "Windows" },
  { key: "winshifts", label: "Win + Shift + S", os: "Windows" },
  { key: "snipping", label: "Snipping Tool", os: "Windows" },
  { key: "macshot", label: "Cmd + Shift + 4", os: "macOS" },
  { key: "browser", label: "Browser screenshot", os: "Chrome / Edge / Firefox" },
  { key: "devtools", label: "DevTools capture", os: "any" },
  { key: "extension", label: "Screenshot extension", os: "any" },
  { key: "phone", label: "Phone camera", os: "physical" },
  { key: "phonehdr", label: "Phone camera, HDR on", os: "physical" },
  { key: "recording", label: "Screen recording, frame extracted", os: "any" },
]

interface Result {
  blocked: string
  degraded: string
  watermark: string
  readable: string
  ocrChar?: number
  ocrWords?: number
  transcript?: string
  notes: string
}

const EMPTY: Result = {
  blocked: "",
  degraded: "",
  watermark: "",
  readable: "",
  notes: "",
}

const STORE = "ksrm-screenshot-lab"

/** The text the viewer's first page is expected to contain, for scoring. */
const DEFAULT_REFERENCE = `Paste the text of the page you captured here, so OCR
output can be scored against it.`

export default function ScreenshotLabPage() {
  const [docId, setDocId] = useState("")
  const [level, setLevel] = useState<ProtectionLevel>("strong")
  const [protectionOn, setProtectionOn] = useState(true)
  const [open, setOpen] = useState(false)
  const [reference, setReference] = useState(DEFAULT_REFERENCE)
  const [rows, setRows] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE)
      if (raw) setRows(JSON.parse(raw) as Record<string, Result>)
    } catch {
      /* a lab note is not worth failing the page over */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(rows))
    } catch {
      /* private window or storage full */
    }
  }, [rows])

  const set = (key: string, field: keyof Result, value: string) =>
    setRows((r) => ({ ...r, [key]: { ...(r[key] ?? EMPTY), [field]: value } }))

  async function score(key: string, file: File) {
    setBusy(key)
    setProgress(0)
    try {
      const text = await recogniseImage(file, setProgress)
      const s = scoreTranscript(reference, text)
      setRows((r) => ({
        ...r,
        [key]: {
          ...(r[key] ?? EMPTY),
          ocrChar: s.characterAccuracy,
          ocrWords: s.wordRecall,
          transcript: s.transcript,
          readable:
            s.wordRecall > 0.9 ? "copies fully" : s.wordRecall > 0.4 ? "partial" : "not usable",
        },
      }))
    } catch {
      setRows((r) => ({ ...r, [key]: { ...(r[key] ?? EMPTY), readable: "OCR failed" } }))
    } finally {
      setBusy(null)
    }
  }

  const pct = (v?: number) => (v === undefined ? "—" : `${Math.round(v * 100)}%`)

  const csv = () => {
    const header = [
      "Method",
      "Platform",
      "Capture blocked",
      "Capture degraded",
      "Watermark visible",
      "Document readable",
      "OCR characters",
      "OCR words",
      "Notes",
      "Transcript",
    ]
    const lines = METHODS.map((m) => {
      const r = rows[m.key] ?? EMPTY
      return [m.label, m.os, r.blocked, r.degraded, r.watermark, r.readable, pct(r.ocrChar), pct(r.ocrWords), r.notes, r.transcript ?? ""]
        .map((v) => `"${(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    })
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "screenshot-lab.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main style={{ background: "#f6f7fb", minHeight: "100vh", padding: "28px 20px 80px" }}>
      <style>{`
        .lab { max-width: 1200px; margin: 0 auto; font-family: system-ui, sans-serif; color: #1a1a2e; }
        .lab h1 { font-size: 26px; margin: 0 0 6px; }
        .sub { color: #666; font-size: 14.5px; margin: 0 0 16px; line-height: 1.65; }
        .warn { background: #fff4e5; border: 1px solid #ffd8a8; color: #7a4100; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; line-height: 1.6; margin-bottom: 18px; }
        .bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; font-size: 14px; }
        .bar input, .bar select, textarea { border: 1px solid #d7dbe7; border-radius: 8px; padding: 7px 10px; font: inherit; }
        textarea { width: 100%; min-height: 70px; }
        .btn { background: #2B3490; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-weight: 600; cursor: pointer; }
        .btn:disabled { opacity: .5; cursor: default; }
        table { width: 100%; border-collapse: collapse; background: #fff; font-size: 13px; margin-top: 12px; }
        th, td { border: 1px solid #e4e8f2; padding: 6px 7px; text-align: left; vertical-align: top; }
        th { background: #eef1f8; font-weight: 700; }
        td input { width: 100%; border: none; font: inherit; background: transparent; }
        .ocr { display: inline-block; margin-top: 4px; font-size: 11.5px; font-weight: 700; color: #2B3490; cursor: pointer; text-decoration: underline; }
      `}</style>

      <div className="lab">
        <h1>Screenshot lab — the protected viewer</h1>
        <p className="sub">
          Open a protected document, try each capture method against it, then feed the
          captured file back into its row. The image is read with OCR and scored
          against the reference text, in this browser. The question each row answers is
          not whether the capture looked damaged, but whether it produced a reusable
          copy.
        </p>

        <div className="warn">
          <strong>Flicker note.</strong> The experimental level modulates the overlay
          every frame at a higher amplitude. It is disabled automatically under
          prefers-reduced-motion. Do not leave it running in front of anyone
          who is sensitive to flicker.
        </div>

        <div className="bar">
          <label>
            Document id{" "}
            <input value={docId} onChange={(e) => setDocId(e.target.value)} placeholder="e.g. 4821" size={8} />
          </label>
          <label>
            Level{" "}
            <select value={level} onChange={(e) => setLevel(e.target.value as ProtectionLevel)}>
              <option value="standard">standard</option>
              <option value="strong">strong (default)</option>
              <option value="experimental">experimental</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={protectionOn} onChange={(e) => setProtectionOn(e.target.checked)} />{" "}
            screenshotProtection
          </label>
          <button type="button" className="btn" disabled={!docId} onClick={() => setOpen(true)}>
            Open the viewer
          </button>
          <button type="button" className="btn" onClick={csv}>
            Export CSV
          </button>
        </div>

        <p className="sub" style={{ margin: "0 0 6px" }}>
          Reference text — paste what the captured page actually says, or OCR has
          nothing to be scored against.
        </p>
        <textarea value={reference} onChange={(e) => setReference(e.target.value)} />

        <table>
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Method</th>
              <th style={{ width: "10%" }}>Platform</th>
              <th>Blocked?</th>
              <th>Degraded?</th>
              <th>Watermark?</th>
              <th>OCR chars</th>
              <th>OCR words</th>
              <th>Usable copy?</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {METHODS.map((m) => {
              const r = rows[m.key] ?? EMPTY
              return (
                <tr key={m.key}>
                  <td>{m.label}</td>
                  <td style={{ color: "#778" }}>{m.os}</td>
                  <td><input value={r.blocked} onChange={(e) => set(m.key, "blocked", e.target.value)} placeholder="no" /></td>
                  <td><input value={r.degraded} onChange={(e) => set(m.key, "degraded", e.target.value)} placeholder="stripes?" /></td>
                  <td><input value={r.watermark} onChange={(e) => set(m.key, "watermark", e.target.value)} placeholder="visible?" /></td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{pct(r.ocrChar)}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{pct(r.ocrWords)}</td>
                  <td>
                    <input value={r.readable} onChange={(e) => set(m.key, "readable", e.target.value)} placeholder="score it" />
                    <label className="ocr">
                      {busy === m.key ? `Reading… ${Math.round(progress * 100)}%` : "Score a capture"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={busy !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) void score(m.key, f)
                          e.target.value = ""
                        }}
                      />
                    </label>
                  </td>
                  <td><input value={r.notes} onChange={(e) => set(m.key, "notes", e.target.value)} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <p className="sub" style={{ marginTop: 16 }}>
          <strong>OCR words</strong> is the column that decides it. Someone copying a
          document needs the words, not the pixels — a capture can look ruined and
          still score 98%.
        </p>

        {open && docId && (
          <ProtectedDocumentViewer
            documentId={Number(docId)}
            title={`Document ${docId}`}
            onClose={() => setOpen(false)}
            screenshotProtection={protectionOn}
            protectionLevel={level}
            viewerLabel="LAB"
          />
        )}
      </div>
    </main>
  )
}
