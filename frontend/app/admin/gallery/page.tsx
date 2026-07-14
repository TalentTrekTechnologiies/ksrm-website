import { Metadata } from "next"
import GalleryManager from "@/components/admin/GalleryManager"

export const metadata: Metadata = {
  title: "Gallery | K.S.R.M College of Engineering",
}

export default function GalleryAdminPage() {
  return <GalleryManager />
}
