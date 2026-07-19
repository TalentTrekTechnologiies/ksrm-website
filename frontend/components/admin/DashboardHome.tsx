"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw } from "lucide-react"
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
import { getStoredAdmin } from "@/lib/auth"
import { formatBytes } from "@/lib/format-bytes"

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}
import DashboardCard from "./DashboardCard"
import OverviewChart from "./OverviewChart"
import RecentActivityFeed from "./RecentActivityFeed"
import QuickActions from "./QuickActions"
import CareerApplicationsWidgets from "./careers/CareerApplicationsWidgets"

interface DashboardData {
  overview: DashboardOverview
  recentActivity: RecentActivity
  pendingApprovals: PendingApprovals
  storage: StorageInfo
}

function CardSkeleton() {
  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="rounded-2xl border border-admin-border bg-white p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-7 w-14 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="rounded-2xl border border-admin-border bg-white p-5"
    >
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-100" />
      <div className="h-64 animate-pulse rounded-lg bg-slate-50" />
    </div>
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
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PanelSkeleton />
          <PanelSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{ boxShadow: "var(--shadow-admin-card)" }}
        className="flex flex-col items-center rounded-2xl border border-admin-border bg-white p-10 text-center"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="mb-4 text-sm text-slate-600">{error}</p>
        <button
          onClick={() => setReloadToken((t) => t + 1)}
          className="flex items-center gap-2 rounded-lg bg-admin-primary px-4 py-2 text-sm font-semibold text-white hover:bg-admin-primary-dark"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const visibleKeys = new Set(data.overview.widgets.map((w) => w.key))

  return (
    <div className="space-y-6">
      {/* Welcome banner - the first thing an admin sees after login, so it
          carries the panel's visual identity: brand gradient, soft glow. */}
      <div
        style={{ background: "var(--gradient-admin-primary)" }}
        className="relative overflow-hidden rounded-2xl px-6 py-6 text-white shadow-lg shadow-admin-primary/25 md:px-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-admin-gold/20 blur-3xl"
        />
        <h1
          style={{ fontFamily: "var(--font-admin-heading)" }}
          className="relative text-2xl font-bold md:text-[1.7rem]"
        >
          {greeting()}, {getStoredAdmin()?.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="relative mt-1 text-sm text-white/75">
          Here&apos;s what&apos;s happening on the KSRM website · updated{" "}
          {new Date(data.overview.generatedAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.overview.widgets.map((widget) => (
          <DashboardCard
            key={widget.key}
            widgetKey={widget.key}
            label={widget.label}
            count={widget.count}
            available={widget.available}
          />
        ))}
        <DashboardCard
          widgetKey="pending_approvals"
          label="Pending Approvals"
          count={data.pendingApprovals.count}
          available={true}
        />
        <DashboardCard
          widgetKey="storage"
          label="Storage Used"
          count={data.storage.usedBytes}
          displayValue={formatBytes(data.storage.usedBytes)}
          available={true}
        />
      </div>

      <QuickActions visibleKeys={visibleKeys} />

      {visibleKeys.has("career_applications") && <CareerApplicationsWidgets />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChart widgets={data.overview.widgets} />
        <RecentActivityFeed items={data.recentActivity.items} />
      </div>

      {(data.pendingApprovals.count === 0 || data.storage.usedBytes === 0) && (
        <p className="text-xs text-slate-400">
          {data.pendingApprovals.note} {data.storage.note}
        </p>
      )}
    </div>
  )
}
