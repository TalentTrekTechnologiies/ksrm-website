import { Metadata } from "next"
import AdminsManager from "@/components/admin/AdminsManager"

export const metadata: Metadata = {
  title: "Admins | K.S.R.M College of Engineering",
}

export default function AdminsPage() {
  return <AdminsManager />
}
