import { Metadata } from "next"
import AboutEditor from "@/components/admin/homepage/AboutEditor"

export const metadata: Metadata = {
  title: "About | K.S.R.M. College of Engineering",
}

export default function AboutAdminPage() {
  return <AboutEditor />
}
