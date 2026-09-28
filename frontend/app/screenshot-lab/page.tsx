"use client"

import { useEffect, useState } from "react"
import ProtectedDocumentViewer, {
  ProtectionLevel,
} from "@/components/ProtectedDocumentViewer"
import { CaptureEvent, ProtectionResponse } from "@/lib/capture-protection"
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
  const [response, setResponse] = useState<ProtectionResponse>("hide")
  const [captureOn, setCaptureOn] = useState(true)
  /** Every capture-ish event the page saw, newest first, with repaint time. */
  const [events, setEvents] = useState<CaptureEvent[]>([])

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
          <label>
            Response{" "}
            <select value={response} onChange={(e) => setResponse(e.target.value as ProtectionResponse)}>
              <option value="hide">hide</option>
              <option value="obscure">obscure</option>
              <option value="watermark">watermark</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={captureOn} onChange={(e) => setCaptureOn(e.target.checked)} />{" "}
            captureProtection
          </label>
          <button type="button" className="btn" disabled={!docId} onClick={() => { setEvents([]); setOpen(true) }}>
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

        <h2 style={{ fontSize: 18, margin: "26px 0 4px" }}>Capture events seen by the page</h2>
        <p className="sub" style={{ margin: "0 0 8px" }}>
          Recorded while the viewer is open. <strong>Repaint</strong> is the time from
          the event handler running to the response being on screen. It is the number
          that decides whether reacting is worth anything: if the operating system
          grabs the framebuffer before it elapses, the response changed nothing about
          that capture.
        </p>
        {events.length === 0 ? (
          <p className="sub" style={{ margin: 0 }}>
            Nothing yet. Open the viewer and try a capture — a method that produces no
            row here cannot be reacted to at all.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Event</th>
                <th style={{ width: "25%" }}>Repaint</th>
                <th>At</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={`${e.at}-${i}`}>
                  <td>{e.kind}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {e.paintLatencyMs === undefined ? "—" : `${e.paintLatencyMs.toFixed(1)} ms`}
                  </td>
                  <td style={{ color: "#778" }}>{Math.round(e.at)} ms into the session</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ fontSize: 18, margin: "26px 0 4px" }}>How to run this honestly</h2>
        <ol className="sub" style={{ margin: 0, paddingLeft: 20 }}>
          <li>Open the viewer on the machine you actually deploy to.</li>
          <li>
            Take a real capture with one method. Do not use a browser or automation
            capture as a stand-in — they take the pixels by a different route and will
            tell you nothing about the OS ones.
          </li>
          <li>
            Check the event table above. No row means the page never knew, and no
            response was possible.
          </li>
          <li>Open the captured file and fill in its row below, then score it by OCR.</li>
        </ol>
        <p className="sub" style={{ marginTop: 8 }}>
          Expect PrintScreen and Win+Shift+S to be unaffected. Windows delivers
          PrintScreen as a keyup after the framebuffer is taken, and the Win+Shift+S
          overlay freezes an image of the screen the moment it is invoked — so in both
          cases the page is told once it is already too late. Snipping Tool opened as
          an app is the plausible case, because seconds pass between it taking focus
          and the user dragging a rectangle. Measure it rather than trusting that.
        </p>

        {open && docId && (
          <ProtectedDocumentViewer
            documentId={Number(docId)}
            title={`Document ${docId}`}
            onClose={() => setOpen(false)}
            screenshotProtection={protectionOn}
            protectionLevel={level}
            viewerLabel="LAB"
            captureProtection={captureOn}
            protectionResponse={response}
            onCaptureEvent={(e) => setEvents((prev) => [e, ...prev].slice(0, 40))}
          />
        )}
      </div>
    </main>
  )
}
