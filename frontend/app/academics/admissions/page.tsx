import AdmissionsTemplate from "@/components/academics/AdmissionsTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admissions | KSRM College of Engineering",
  description: "KSRM College of Engineering admissions for B.Tech, M.Tech and MBA through EAPCET, PGECET and ICET. EAPCET Code: KSRM",
}

export default function AdmissionsPage() {
  return <AdmissionsTemplate />
}
