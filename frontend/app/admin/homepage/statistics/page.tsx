import { Metadata } from "next"
import StatisticsManager from "@/components/admin/homepage/StatisticsManager"

export const metadata: Metadata = {
  title: "Statistics | K.S.R.M College of Engineering",
}

export default function StatisticsAdminPage() {
  return <StatisticsManager />
}
