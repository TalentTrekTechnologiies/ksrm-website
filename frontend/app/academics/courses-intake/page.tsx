import CoursesIntakeTemplate from "@/components/academics/CoursesIntakeTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Courses Offered & Intake | KSRM College of Engineering",
  description: "KSRM College of Engineering AICTE approved courses with intake details for B.Tech, M.Tech and MBA programmes. EAPCET Code: KSRM",
}

export default function CoursesIntakePage() {
  return <CoursesIntakeTemplate />
}
