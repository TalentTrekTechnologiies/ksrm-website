import { Metadata } from "next"
import ResearchManager from "@/components/admin/ResearchManager"

export const metadata: Metadata = {
  title: "Research | K.S.R.M. College of Engineering",
}

export default function ResearchAdminPage() {
  return <ResearchManager />
}
