import { Metadata } from "next"
import RecruitersManager from "@/components/admin/homepage/RecruitersManager"

export const metadata: Metadata = {
  title: "Recruiters | K.S.R.M College of Engineering",
}

export default function RecruitersAdminPage() {
  return <RecruitersManager />
}
