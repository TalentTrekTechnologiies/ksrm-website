import { Metadata } from "next"
import NewsTemplate from "@/components/news/NewsTemplate"

export const metadata: Metadata = {
  title: "News & Events | KSRM College of Engineering",
  description:
    "Latest news, events and announcements from KSRM College of Engineering. Stay updated with college activities.",
}

export default function NewsPage() {
  return <NewsTemplate />
}
