import EDCTemplate from "@/components/campusLife/EDCTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "EDC | KSRM College of Engineering",
  description:
    "KSRM College of Engineering Entrepreneurship Development Cell supporting student startups, innovation, and entrepreneurial ventures.",
}

export default function EDCPage() {
  return <EDCTemplate />
}
