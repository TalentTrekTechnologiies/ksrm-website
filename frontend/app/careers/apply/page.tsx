"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { MapPin, Briefcase, Building2, CalendarDays, Clock } from "lucide-react"
import { getCareersPublic, Career } from "@/lib/careers-api"
import ApplicationForm from "@/components/careers/ApplicationForm"

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
        if (cancelled) return
        setCareer(items.find((c) => c.id === careerId) ?? null)
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

  return (
    <main style={{ background: "#f4f6fb", minHeight: "70vh" }}>
      <style>{`
        .jp-wrap { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        .jp-hero { background: linear-gradient(135deg, #2B3490 0%, #1e2570 55%, #0d1033 100%); color: #fff; padding: 44px 0 56px; }
        .jp-breadcrumb { font-size: 14px; color: rgba(255,255,255,0.72); margin-bottom: 16px; }
        .jp-breadcrumb a { color: #FFE619; text-decoration: none; }
        .jp-breadcrumb a:hover { text-decoration: underline; }
        .jp-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.9rem, 3.6vw, 2.8rem); font-weight: 700; line-height: 1.1; margin: 0; }
        .jp-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .jp-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 13.5px; font-weight: 500; padding: 6px 13px; border-radius: 20px; }
        .jp-closing { display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 13.5px; color: #FFE619; font-weight: 600; }
        .jp-apply-btn { display: inline-block; margin-top: 22px; background: #FFE619; color: #1a1d4d; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; padding: 12px 30px; border-radius: 8px; text-decoration: none; box-shadow: 0 8px 22px rgba(0,0,0,0.25); }
        .jp-body { margin: -34px auto 64px; }
        .jp-card { background: #fff; border: 1px solid #e6e8f0; border-radius: 16px; box-shadow: 0 12px 36px rgba(43,52,144,0.09); padding: 34px; margin-bottom: 24px; }
        @media (max-width: 560px) { .jp-card { padding: 22px 18px; } }
        .jp-card h2 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
        .jp-card h2 + .jp-sub { color: #888; font-size: 14px; margin: 0 0 20px; }
        .jp-desc-text { white-space: pre-wrap; font-size: 15.5px; line-height: 1.8; color: #444; }
      `}</style>

      {/* JOB HEADER */}
      <section className="jp-hero">
        <div className="jp-wrap">
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
          {closing && (
            <div className="jp-closing"><Clock size={15} /> Applications close on {closing}</div>
          )}
          <a href="#apply" className="jp-apply-btn">Apply for this position ↓</a>
        </div>
      </section>

      <div className="jp-wrap jp-body">
        {/* JOB DESCRIPTION */}
        {description && (
          <section className="jp-card">
            <h2>Job Description</h2>
            <div className="jp-desc-text">{description}</div>
          </section>
        )}

        {/* APPLICATION FORM */}
        <section id="apply" className="jp-card">
          <h2>Apply for this position</h2>
          <p className="jp-sub">{title !== "General Application" ? `Complete the form below to apply for ${title}.` : "Complete the form below to submit your application."}</p>
          <ApplicationForm asPage careerId={careerId} jobTitle={career?.title || titleParam} />
        </section>

        {!description && !loading && careerId && (
          <p style={{ textAlign: "center", color: "#999", fontSize: 14 }}>
            Full role details will be shared by our HR team after you apply.
          </p>
        )}
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
