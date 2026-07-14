"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import ApplicationForm from "@/components/careers/ApplicationForm"

const WHY_JOIN = [
  "Recognised for academic excellence",
  "Active research & innovation culture",
  "Collaborative, supportive workplace",
  "Structured professional growth",
]

function ApplyInner() {
  const params = useSearchParams()
  const careerIdRaw = params.get("careerId")
  const careerId = careerIdRaw && !Number.isNaN(Number(careerIdRaw)) ? Number(careerIdRaw) : undefined
  const title = params.get("title") || undefined
  const dept = params.get("dept") || undefined

  return (
    <main style={{ background: "#f4f6fb", minHeight: "70vh" }}>
      <style>{`
        .ap-wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .ap-hero { background: linear-gradient(135deg, #2B3490 0%, #1e2570 55%, #0d1033 100%); color: #fff; padding: 46px 0 56px; }
        .ap-breadcrumb { font-size: 14px; color: rgba(255,255,255,0.72); margin-bottom: 14px; }
        .ap-breadcrumb a { color: #FFE619; text-decoration: none; }
        .ap-breadcrumb a:hover { text-decoration: underline; }
        .ap-grid { display: grid; grid-template-columns: 330px 1fr; gap: 28px; margin: -34px auto 64px; align-items: start; }
        @media (max-width: 900px) { .ap-grid { grid-template-columns: 1fr; margin-top: -24px; } }
        .ap-card { background: #fff; border: 1px solid #e6e8f0; border-radius: 16px; box-shadow: 0 12px 36px rgba(43,52,144,0.09); }
        .ap-side { padding: 26px 24px; position: sticky; top: 20px; }
        @media (max-width: 900px) { .ap-side { position: static; } }
        .ap-side-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #8a8fb5; }
        .ap-job-title { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 5px 0 6px; line-height: 1.2; }
        .ap-divider { height: 1px; background: #eef0f6; margin: 18px 0; }
        .ap-why { list-style: none; padding: 0; margin: 0; }
        .ap-why li { font-size: 14px; color: #555; margin-bottom: 9px; padding-left: 22px; position: relative; line-height: 1.4; }
        .ap-why li::before { content: '✓'; position: absolute; left: 0; color: #2B3490; font-weight: 800; }
        .ap-form-card { padding: 34px; }
        @media (max-width: 560px) { .ap-form-card { padding: 22px 18px; } }
      `}</style>

      <section className="ap-hero">
        <div className="ap-wrap">
          <div className="ap-breadcrumb">
            <Link href="/">Home</Link> / <Link href="/careers">Careers</Link> / Apply
          </div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)", fontWeight: 700, margin: 0 }}>
            Application Form
          </h1>
          <p style={{ color: "rgba(255,255,255,0.84)", margin: "10px 0 0", fontSize: 16 }}>
            {title ? `You are applying for ${title}` : "Submit your application to K.S.R.M. College of Engineering"}
          </p>
        </div>
      </section>

      <div className="ap-wrap">
        <div className="ap-grid">
          {/* JOB SUMMARY SIDEBAR */}
          <aside className="ap-card ap-side">
            <div className="ap-side-label">You are applying for</div>
            <div className="ap-job-title">{title || "General Application"}</div>
            {dept && <div style={{ fontSize: 14, color: "#666" }}>{dept}</div>}

            <div className="ap-divider" />
            <div className="ap-side-label" style={{ marginBottom: 11 }}>Why join KSRM</div>
            <ul className="ap-why">
              {WHY_JOIN.map((w) => <li key={w}>{w}</li>)}
            </ul>

            <div className="ap-divider" />
            <div className="ap-side-label" style={{ marginBottom: 6 }}>Need help?</div>
            <a href="mailto:hr@ksrmce.ac.in" style={{ fontSize: 14, color: "#2B3490", fontWeight: 600, textDecoration: "none" }}>
              hr@ksrmce.ac.in
            </a>
          </aside>

          {/* APPLICATION FORM */}
          <div className="ap-card ap-form-card">
            <ApplicationForm asPage careerId={careerId} jobTitle={title} />
          </div>
        </div>
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
