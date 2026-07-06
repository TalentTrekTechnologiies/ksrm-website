import { Metadata } from "next"
import DashboardHome from "@/components/admin/DashboardHome"

export const metadata: Metadata = {
  title: "Dashboard | K.S.R.M College of Engineering",
}

export default function DashboardPage() {
  return <DashboardHome />
}
