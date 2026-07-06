"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  DashboardOverview,
  PendingApprovals,
  RecentActivity,
  StorageInfo,
  getDashboardOverview,
  getPendingApprovals,
  getRecentActivity,
  getStorageInfo,
} from "@/lib/dashboard-api"
import { ApiError } from "@/lib/api-client"
import DashboardCard from "./DashboardCard"
import OverviewChart from "./OverviewChart"
import RecentActivityFeed from "./RecentActivityFeed"

interface DashboardData {
  overview: DashboardOverview
  recentActivity: RecentActivity
  pendingApprovals: PendingApprovals
  storage: StorageInfo
}

function CardSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-xl bg-white/60 shadow-[var(--shadow-card)]" />
  )
}

export default function DashboardHome() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [overview, recentActivity, pendingApprovals, storage] = await Promise.all([
          getDashboardOverview(),
          getRecentActivity(10),
          getPendingApprovals(),
          getStorageInfo(),
        ])
        if (cancelled) return
        setData({ overview, recentActivity, pendingApprovals, storage })
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.statusCode === 401) {
          router.replace("/admin/login")
          return
        }
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load the dashboard. Please check your connection and try again.",
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [router, reloadToken])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-[var(--shadow-card)]">
        <p className="mb-4 text-sm text-red-700">{error}</p>
        <button
          onClick={() => setReloadToken((t) => t + 1)}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-navy)" }}
          className="text-2xl font-bold"
        >
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500">
          Last updated {new Date(data.overview.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.overview.widgets.map((widget) => (
          <DashboardCard
            key={widget.key}
            label={widget.label}
            count={widget.count}
            available={widget.available}
          />
        ))}
        <DashboardCard
          label="Pending Approvals"
          count={data.pendingApprovals.count}
          available={true}
        />
        <DashboardCard
          label="Storage Used"
          count={data.storage.usedBytes}
          available={true}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChart widgets={data.overview.widgets} />
        <RecentActivityFeed items={data.recentActivity.items} />
      </div>

      {(data.pendingApprovals.count === 0 || data.storage.usedBytes === 0) && (
        <p className="text-xs text-neutral-400">
          {data.pendingApprovals.note} {data.storage.note}
        </p>
      )}
    </div>
  )
}
