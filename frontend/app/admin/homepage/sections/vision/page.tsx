import { Metadata } from "next"
import VisionEditor from "@/components/admin/homepage/VisionEditor"

export const metadata: Metadata = {
  title: "Vision | K.S.R.M College of Engineering",
}

export default function VisionAdminPage() {
  return <VisionEditor />
}
