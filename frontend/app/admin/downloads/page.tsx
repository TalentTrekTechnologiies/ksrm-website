import { Metadata } from "next"
import DownloadsManager from "@/components/admin/DownloadsManager"

export const metadata: Metadata = {
  title: "Downloads | K.S.R.M College of Engineering",
}

export default function DownloadsAdminPage() {
  return <DownloadsManager />
}
