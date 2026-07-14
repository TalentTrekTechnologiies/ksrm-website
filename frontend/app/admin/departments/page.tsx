import { Metadata } from "next"
import DepartmentsManager from "@/components/admin/DepartmentsManager"

export const metadata: Metadata = {
  title: "Departments | K.S.R.M College of Engineering",
}

export default function DepartmentsAdminPage() {
  return <DepartmentsManager />
}
