import { Metadata } from "next"
import QuickLinksManager from "@/components/admin/homepage/QuickLinksManager"

export const metadata: Metadata = {
  title: "Quick Links | K.S.R.M College of Engineering",
}

export default function QuickLinksAdminPage() {
  return <QuickLinksManager />
}
