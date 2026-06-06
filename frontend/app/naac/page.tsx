import { Metadata } from "next"
import NAACTemplate from "@/components/naac/NAACTemplate"

export const metadata: Metadata = {
  title: "NAAC Accreditation | KSRM College of Engineering",
  description:
    "KSRM College of Engineering is NAAC accredited with Grade B++ (CGPA 2.88) - 3rd Cycle. Committed to quality excellence.",
}

export default function NAACPage() {
  return <NAACTemplate />
}
