import { Metadata } from "next"
import AccreditationManager from "@/components/admin/homepage/AccreditationManager"

export const metadata: Metadata = {
  title: "Accreditation | K.S.R.M. College of Engineering",
}

export default function AccreditationAdminPage() {
  return <AccreditationManager />
}
