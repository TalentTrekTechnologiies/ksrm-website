import LibraryTemplate from "@/components/campusLife/LibraryTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Library | KSRM College of Engineering",
  description:
    "KSRM College of Engineering Central Library with 45,000+ books, digital resources, e-journals, and excellent reading facilities.",
}

export default function LibraryPage() {
  return <LibraryTemplate />
}
