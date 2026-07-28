import { Metadata } from "next"
import PageContentManager from "@/components/admin/PageContentManager"

export const metadata: Metadata = {
  title: "Page Content | K.S.R.M. College of Engineering",
}

export default function PageContentAdminPage() {
  return <PageContentManager />
}
