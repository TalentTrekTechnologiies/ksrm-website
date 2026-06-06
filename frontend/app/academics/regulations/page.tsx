import RegulationsTemplate from "@/components/academics/RegulationsTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Regulations | KSRM College of Engineering",
  description:
    "KSRM College of Engineering academic regulations (R20, R19, R16) and examination rules as per JNTUA guidelines.",
}

export default function RegulationsPage() {
  return <RegulationsTemplate />
}
