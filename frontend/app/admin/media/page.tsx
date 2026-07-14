import { Metadata } from "next"
import MediaLibraryManager from "@/components/admin/MediaLibraryManager"

export const metadata: Metadata = {
  title: "Media Library | K.S.R.M College of Engineering",
}

export default function MediaLibraryAdminPage() {
  return <MediaLibraryManager />
}
