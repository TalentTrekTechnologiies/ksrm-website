import { Metadata } from "next"
import FacultyManager from "@/components/admin/FacultyManager"

export const metadata: Metadata = {
  title: "Faculty | K.S.R.M. College of Engineering",
}

export default function FacultyAdminPage() {
  return <FacultyManager />
}
