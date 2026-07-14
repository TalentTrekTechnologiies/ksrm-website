import { Metadata } from "next"
import SiteSettingsManager from "@/components/admin/SiteSettingsManager"

export const metadata: Metadata = {
  title: "Site Settings | K.S.R.M College of Engineering",
}

export default function SiteSettingsAdminPage() {
  return <SiteSettingsManager />
}
