import { Metadata } from "next"
import AdmissionsEditor from "@/components/admin/homepage/AdmissionsEditor"

export const metadata: Metadata = {
  title: "Admissions | K.S.R.M. College of Engineering",
}

export default function AdmissionsAdminPage() {
  return <AdmissionsEditor />
}
