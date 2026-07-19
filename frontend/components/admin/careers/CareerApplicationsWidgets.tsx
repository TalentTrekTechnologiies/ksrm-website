"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  getCareerApplicationDashboardCounts,
  CareerApplicationDashboardCounts,
} from "@/lib/career-applications-api"

const TILES: { key: keyof CareerApplicationDashboardCounts; label: string }[] = [
  { key: "applicationsToday", label: "Applications Today" },
  { key: "applicationsThisWeek", label: "Applications This Week" },
  { key: "pendingReview", label: "Pending Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "selected", label: "Selected" },
]

export default function CareerApplicationsWidgets() {
  const [counts, setCounts] = useState<CareerApplicationDashboardCounts | null>(null)

  useEffect(() => {
    let cancelled = false
    getCareerApplicationDashboardCounts()
      .then((data) => {
        if (!cancelled) setCounts(data)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  if (!counts) return null

  return (
    <div style={{ boxShadow: "var(--shadow-admin-card)" }} className="rounded-2xl border border-admin-border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Job Applications</h2>
        <Link href="/admin/careers/applications" className="text-xs font-semibold text-admin-primary hover:underline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {TILES.map((tile) => (
          <div key={tile.key}>
            <p className="text-2xl font-bold text-slate-900">{counts[tile.key]}</p>
            <p className="text-xs text-slate-500">{tile.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
