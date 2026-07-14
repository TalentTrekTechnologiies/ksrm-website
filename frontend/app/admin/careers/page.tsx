import { Metadata } from "next"
import CareersManager from "@/components/admin/CareersManager"

export const metadata: Metadata = {
  title: "Careers | K.S.R.M College of Engineering",
}

export default function CareersAdminPage() {
  return <CareersManager />
}
