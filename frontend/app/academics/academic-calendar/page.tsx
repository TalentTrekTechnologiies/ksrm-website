import AcademicCalendarTemplate from "@/components/academics/AcademicCalendarTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Academic Calendar | KSRM College of Engineering",
  description: "KSRM College of Engineering academic calendar with downloadable PDFs for B.Tech, M.Tech, and MBA programmes following JNTUA regulations.",
}

export default function AcademicCalendarPage() {
  return <AcademicCalendarTemplate />
}
