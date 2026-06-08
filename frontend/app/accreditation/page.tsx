import { Metadata } from "next"
import AccreditationTemplate from "@/components/accreditation/AccreditationTemplate"

export const metadata: Metadata = {
  title: "Accreditations & Rankings | KSRM College of Engineering",
  description:
    "KSRM accreditations - NAAC A++, NBA Accreditation, NIRF Ranking, UGC Autonomous status, JNTUA affiliation.",
}

export default function AccreditationPage() {
  return <AccreditationTemplate />
}
