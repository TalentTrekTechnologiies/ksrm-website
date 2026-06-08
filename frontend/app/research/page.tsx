import { Metadata } from "next"
import ResearchTemplate from "@/components/research/ResearchTemplate"

export const metadata: Metadata = {
  title: "Research & Innovation | KSRM College of Engineering",
  description:
    "Research initiatives at KSRM - 50+ publications, 10+ patents, 15+ funded projects. Centers for VLSI, AI & ML, and Structural Engineering.",
}

export default function ResearchPage() {
  return <ResearchTemplate />
}
