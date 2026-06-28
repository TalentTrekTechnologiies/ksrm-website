import { Metadata } from "next"
import CareersTemplate from "@/components/careers/CareersTemplate"

export const metadata: Metadata = {
  title: "Careers | K.S.R.M College of Engineering",
  description: "Career opportunities and recruitment information",
}

export default function CareersPage() {
  return <CareersTemplate />
}
