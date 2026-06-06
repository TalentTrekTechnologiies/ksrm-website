import SportsTemplate from "@/components/campusLife/SportsTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sports | KSRM College of Engineering",
  description:
    "KSRM College of Engineering sports facilities, achievements, and upcoming events with modern infrastructure for all disciplines.",
}

export default function SportsPage() {
  return <SportsTemplate />
}
