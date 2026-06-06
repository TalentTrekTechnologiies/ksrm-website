import FacultyTemplate from "@/components/academics/FacultyTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Faculty | KSRM College of Engineering",
  description:
    "Meet the experienced faculty members of KSRM College of Engineering across all departments with PhD qualifications and industry expertise.",
}

export default function FacultyPage() {
  return <FacultyTemplate />
}
