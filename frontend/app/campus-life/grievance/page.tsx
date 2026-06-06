import GrievanceTemplate from "@/components/campusLife/GrievanceTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Grievance Redressal | KSRM College of Engineering",
  description: "KSRM College of Engineering grievance redressal system with fair, transparent and timely resolution for student complaints.",
}

export default function GrievancePage() {
  return <GrievanceTemplate />
}
