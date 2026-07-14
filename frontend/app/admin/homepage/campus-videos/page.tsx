import { Metadata } from "next"
import CampusVideosManager from "@/components/admin/homepage/CampusVideosManager"

export const metadata: Metadata = {
  title: "Campus Videos | K.S.R.M College of Engineering",
}

export default function CampusVideosAdminPage() {
  return <CampusVideosManager />
}
