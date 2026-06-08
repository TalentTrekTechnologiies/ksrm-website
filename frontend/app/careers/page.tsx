import { Metadata } from "next"
import CareersTemplate from "@/components/careers/CareersTemplate"

export const metadata: Metadata = {
  title: "Careers | KSRM College of Engineering",
  description:
    "Join KSRM College - career opportunities in academia, research, and administration.",
}

export default function CareersPage() {
  return <CareersTemplate />
}
