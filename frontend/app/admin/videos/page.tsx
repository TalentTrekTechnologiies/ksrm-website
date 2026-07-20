import { Metadata } from "next"
import VideosManager from "@/components/admin/VideosManager"

export const metadata: Metadata = {
  title: "Videos | K.S.R.M. College of Engineering",
}

export default function VideosAdminPage() {
  return <VideosManager />
}
