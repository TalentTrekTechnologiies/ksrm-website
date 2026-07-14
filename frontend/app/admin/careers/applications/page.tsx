import { Metadata } from "next"
import ApplicationsManager from "@/components/admin/careers/ApplicationsManager"

export const metadata: Metadata = {
  title: "Job Applications | K.S.R.M College of Engineering",
}

export default function CareerApplicationsPage() {
  return <ApplicationsManager />
}
