import { Metadata } from "next"
import AnnouncementsManager from "@/components/admin/announcements/AnnouncementsManager"

export const metadata: Metadata = {
  title: "Announcements | K.S.R.M. College of Engineering",
}

export default function AnnouncementsPage() {
  return <AnnouncementsManager />
}
