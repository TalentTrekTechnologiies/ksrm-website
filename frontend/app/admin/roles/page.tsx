import { Metadata } from "next"
import RolesManager from "@/components/admin/RolesManager"

export const metadata: Metadata = {
  title: "Roles & Permissions | K.S.R.M. College of Engineering",
}

export default function RolesPage() {
  return <RolesManager />
}
