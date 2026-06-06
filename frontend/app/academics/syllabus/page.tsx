import SyllabusTemplate from "@/components/academics/SyllabusTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Syllabus | KSRM College of Engineering",
  description:
    "Download the detailed syllabus for B.Tech, M.Tech, and MBA programmes as per JNTUA regulations.",
}

export default function SyllabusPage() {
  return <SyllabusTemplate />
}
