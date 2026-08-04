import { Metadata } from "next"
import AcademicsManager from "@/components/admin/AcademicsManager"

export const metadata: Metadata = {
  title: "Academics | K.S.R.M. College of Engineering",
}

export default function AcademicsAdminPage() {
  return <AcademicsManager />
}
