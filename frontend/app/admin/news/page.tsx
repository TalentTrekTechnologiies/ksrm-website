import { Metadata } from "next"
import NewsManager from "@/components/admin/homepage/NewsManager"

export const metadata: Metadata = {
  title: "News | K.S.R.M College of Engineering",
}

export default function NewsAdminPage() {
  return <NewsManager />
}
