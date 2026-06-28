import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | KSRM College of Engineering",
  description: "Project dashboard for KSRM College of Engineering",
}

export default function DashboardPage() {
  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px", color: "#2B3490" }}>Dashboard</h1>
      <p style={{ color: "#666", lineHeight: "1.6" }}>
        Welcome to the KSRM College of Engineering Dashboard. This page displays project tracking and institutional updates.
      </p>
    </div>
  )
}
