import { Metadata } from "next"
import MissionEditor from "@/components/admin/homepage/MissionEditor"

export const metadata: Metadata = {
  title: "Mission | K.S.R.M. College of Engineering",
}

export default function MissionAdminPage() {
  return <MissionEditor />
}
