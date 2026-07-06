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
    <div
      style={{ boxShadow: "var(--shadow-admin-card)" }}
      className="rounded-xl border border-admin-border bg-white p-5"
    >
      <p
        style={{ fontFamily: "var(--font-admin-heading)" }}
        className="mb-4 text-lg font-bold text-admin-primary"
      >
        Content Overview
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748B" }}
              angle={-40}
              textAnchor="end"
              interval={0}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748B" }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(30, 58, 138, 0.05)" }}
              contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 13 }}
            />
            <Bar dataKey="count" fill="#1E3A8A" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
