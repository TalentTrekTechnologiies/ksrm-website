"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { DashboardWidget } from "@/lib/dashboard-api"

export default function OverviewChart({ widgets }: { widgets: DashboardWidget[] }) {
  const data = widgets.map((w) => ({ label: w.label, count: w.count }))

  return (
    <div className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
      <p style={{ fontFamily: "var(--font-heading)", color: "var(--color-navy)" }} className="mb-4 text-lg font-bold">
        Content Overview
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2B3490" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
