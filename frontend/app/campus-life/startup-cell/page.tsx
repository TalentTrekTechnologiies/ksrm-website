import StartupCellTemplate from "@/components/campusLife/StartupCellTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Startup Cell | KSRM College of Engineering",
  description:
    "KSRM College of Engineering Startup Cell supporting student entrepreneurs with incubation, mentorship, funding, and market access.",
}

export default function StartupCellPage() {
  return <StartupCellTemplate />
}
