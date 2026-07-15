"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MapPin, Briefcase, Building2, CalendarDays, Clock } from "lucide-react"
import { getCareersPublic, Career } from "@/lib/careers-api"
import ApplicationForm from "@/components/careers/ApplicationForm"

const WHY_JOIN = [
  "Recognised for academic excellence",
  "Active research & innovation culture",
  "Collaborative, supportive workplace",
  "Structured professional growth",
]

function fmtDate(iso?: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return null
  }
}

function ApplyInner() {
  const params = useSearchParams()
  const careerIdRaw = params.get("careerId")
  const careerId = careerIdRaw && !Number.isNaN(Number(careerIdRaw)) ? Number(careerIdRaw) : undefined
  const titleParam = params.get("title") || undefined
  const deptParam = params.get("dept") || undefined

  const [career, setCareer] = useState<Career | null>(null)
  const [loading, setLoading] = useState<boolean>(!!careerId)

  useEffect(() => {
    if (!careerId) return
    let cancelled = false
    getCareersPublic()
      .then((items) => {
        if (!cancelled) setCareer(items.find((c) => c.id === careerId) ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [careerId])

  const title = career?.title || titleParam || "General Application"
  const dept = career?.department || deptParam || null
  const posted = fmtDate(career?.postedAt)
  const closing = fmtDate(career?.closingAt)
  const description = career?.description?.trim()

  const chips: { icon: React.ReactNode; text: string }[] = []
  if (dept) chips.push({ icon: <Building2 size={15} />, text: dept })
  if (career?.location) chips.push({ icon: <MapPin size={15} />, text: career.location })
  if (career?.employmentType) chips.push({ icon: <Briefcase size={15} />, text: career.employmentType })
  if (posted) chips.push({ icon: <CalendarDays size={15} />, text: `Posted ${posted}` })

  const summary: { label: string; value: string }[] = []
  if (dept) summary.push({ label: "Department", value: dept })
  if (career?.employmentType) summary.push({ label: "Employment Type", value: career.employmentType })
  if (career?.location) summary.push({ label: "Location", value: career.location })
  if (posted) summary.push({ label: "Posted On", value: posted })
  if (closing) summary.push({ label: "Apply Before", value: closing })

  return (
    <main style={{ background: "#f4f6fb" }}>
      <style>{`
        .jp-wrap { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .jp-wrap { padding: 0 28px; } }
        @media (max-width: 600px) { .jp-wrap { padding: 0 16px; } }

        .jp-hero { position: relative; background: #1e2570 url('/banners/careers.jpg') center / cover no-repeat; overflow: hidden; }
        .jp-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(13,16,51,0.92) 0%, rgba(30,37,112,0.8) 45%, rgba(43,52,144,0.58) 100%); }
        .jp-hero-inner { position: relative; z-index: 1; padding: 52px 0 70px; color: #fff; }
        .jp-breadcrumb { font-size: 14px; color: rgba(255,255,255,0.75); margin-bottom: 16px; }
        .jp-breadcrumb a { color: #FFE619; text-decoration: none; }
        .jp-breadcrumb a:hover { text-decoration: underline; }
        .jp-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2rem, 4vw, 3.1rem); font-weight: 700; line-height: 1.08; margin: 0; max-width: 900px; }
        .jp-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .jp-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.22); color: #fff; font-size: 14px; font-weight: 500; padding: 7px 14px; border-radius: 20px; }
        .jp-closing { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 14px; color: #FFE619; font-weight: 600; }

        .jp-body { padding: 0 0 72px; }
        .jp-top { display: grid; grid-template-columns: 1.7fr 1fr; gap: 28px; align-items: start; margin-top: -44px; position: relative; z-index: 2; }
        @media (max-width: 980px) { .jp-top { grid-template-columns: 1fr; } }

        .jp-card { background: #fff; border: 1px solid #e6e8f0; border-radius: 16px; box-shadow: 0 12px 36px rgba(43,52,144,0.09); padding: 34px; }
        @media (max-width: 600px) { .jp-card { padding: 24px 20px; } }
        .jp-card h2 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
        .jp-sub { color: #888; font-size: 14px; margin: 0 0 24px; }
        .jp-desc-text { white-space: pre-wrap; font-size: 15.5px; line-height: 1.8; color: #444; }

        /* Job summary card */
        .jp-sum-row { display: flex; justify-content: space-between; gap: 14px; padding: 11px 0; border-bottom: 1px dashed #eef0f6; font-size: 14.5px; }
        .jp-sum-row:last-of-type { border-bottom: none; }
        .jp-sum-label { color: #8a8fb5; font-weight: 600; }
        .jp-sum-value { color: #1a1a2e; font-weight: 600; text-align: right; }
        .jp-why { list-style: none; padding: 0; margin: 0; }
        .jp-why li { font-size: 14.5px; color: #444; margin-bottom: 11px; padding-left: 26px; position: relative; line-height: 1.5; }
        .jp-why li::before { content: '✓'; position: absolute; left: 0; top: 1px; color: #fff; background: #2B3490; width: 18px; height: 18px; border-radius: 50%; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .jp-help { margin-top: 18px; padding-top: 18px; border-top: 1px solid #eef0f6; font-size: 14px; color: #666; }
        .jp-help a { color: #2B3490; font-weight: 600; text-decoration: none; }
        .jp-block + .jp-block { margin-top: 24px; }

        /* Full-width form below: 3 columns on wide screens, roomy but not stretched */
        .jp-form-card { margin-top: 28px; }
        @media (min-width: 1200px) { .jp-form-card .af-grid { grid-template-columns: repeat(3, 1fr); } }
        .jp-form-card .af-submit { max-width: 440px; }
      `}</style>

      {/* BANNER: title + chips */}
      <section className="jp-hero">
        <div className="jp-wrap">
          <div className="jp-hero-inner">
            <div className="jp-breadcrumb">
              <Link href="/">Home</Link> / <Link href="/careers">Careers</Link> / Apply
            </div>
            <h1 className="jp-title">{title}</h1>
            {chips.length > 0 && (
              <div className="jp-chips">
                {chips.map((c, i) => (
                  <span className="jp-chip" key={i}>{c.icon} {c.text}</span>
                ))}
              </div>
            )}
            {closing && <div className="jp-closing"><Clock size={15} /> Applications close on {closing}</div>}
          </div>
        </div>
      </section>

      <div className="jp-wrap jp-body">
        {/* JOB DESCRIPTION + JOB SUMMARY */}
        <div className="jp-top">
          {/* LEFT — description + why join (keeps this column filled) */}
          <div>
            <section className="jp-card">
              <h2>Job Description</h2>
              {loading ? (
                <p style={{ color: "#aaa", fontSize: 15, margin: 0 }}>Loading role details…</p>
              ) : description ? (
                <div className="jp-desc-text">{description}</div>
              ) : (
                <p style={{ color: "#777", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                  {title === "General Application"
                    ? "Submit a general application and our HR team will match your profile against current and upcoming openings."
                    : "Full role details will be shared by our HR team after you apply."}
                </p>
              )}
            </section>

            <section className="jp-card jp-block">
              <h2>Why join K.S.R.M.?</h2>
              <ul className="jp-why" style={{ marginTop: 14 }}>
                {WHY_JOIN.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </section>
          </div>

          {/* RIGHT — job summary + help */}
          <div>
            {summary.length > 0 && (
              <section className="jp-card jp-block">
                <h2>Job Summary</h2>
                <div style={{ marginTop: 16 }}>
                  {summary.map((s) => (
                    <div className="jp-sum-row" key={s.label}>
                      <span className="jp-sum-label">{s.label}</span>
                      <span className="jp-sum-value">{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="jp-help">
                  Questions about this role? Write to <a href="mailto:hr@ksrmce.ac.in">hr@ksrmce.ac.in</a>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* FULL-WIDTH APPLICATION FORM */}
        <section className="jp-card jp-form-card" id="apply">
          <h2>Apply for this position</h2>
          <p className="jp-sub">
            {title !== "General Application"
              ? `Complete the form below to apply for ${title}. Fields marked * are required.`
              : "Complete the form below to submit your application. Fields marked * are required."}
          </p>
          <ApplicationForm asPage careerId={careerId} jobTitle={career?.title || titleParam} />
        </section>
      </div>
    </main>
  )
}

export default function CareerApplyPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px 0", textAlign: "center", color: "#666" }}>Loading…</div>}>
      <ApplyInner />
    </Suspense>
  )
}
