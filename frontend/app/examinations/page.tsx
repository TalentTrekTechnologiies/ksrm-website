import { Metadata } from "next"
import ExaminationsTemplate from "@/components/examinations/ExaminationsTemplate"

export const metadata: Metadata = {
  title: "Examinations | KSRM College of Engineering",
  description:
    "Examination schedules, results, notifications and timetables for KSRM College of Engineering. View results online.",
}

export default function ExaminationsPage() {
  return <ExaminationsTemplate />
}
