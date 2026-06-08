import { Metadata } from "next"
import AlumniTemplate from "@/components/alumni/AlumniTemplate"

export const metadata: Metadata = {
  title: "Alumni | KSRM College of Engineering",
  description:
    "KSRM Alumni Network - 10000+ alumni across 500+ companies in 25+ countries. Connect with fellow graduates.",
}

export default function AlumniPage() {
  return <AlumniTemplate />
}
