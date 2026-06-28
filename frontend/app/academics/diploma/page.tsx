import DiplomaTemplate from "@/components/academics/DiplomaTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Diploma / Polytechnic Admissions | KSRM College of Engineering",
  description: "KSRMCE Polytechnic (Diploma) admissions 2026. 3-year programmes in CE, EEE, ME, ECE, CSE, AIML. Industry training, internships, Wi-Fi, hostels, transport.",
}

export default function DiplomaPage() {
  return <DiplomaTemplate />
}
