import AntiRaggingTemplate from "@/components/campusLife/AntiRaggingTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Anti-Ragging | KSRM College of Engineering",
  description:
    "KSRM College of Engineering anti-ragging policy with zero tolerance, helpline numbers, and support for students.",
}

export default function AntiRaggingPage() {
  return <AntiRaggingTemplate />
}
