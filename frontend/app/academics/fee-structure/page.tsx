import FeeStructureTemplate from "@/components/academics/FeeStructureTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fee Structure | KSRM College of Engineering",
  description:
    "KSRM College of Engineering fee structure for B.Tech, M.Tech, and MBA programmes with scholarship information.",
}

export default function FeeStructurePage() {
  return <FeeStructureTemplate />
}
