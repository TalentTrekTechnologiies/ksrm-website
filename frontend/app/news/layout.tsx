import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "News",
  description: "News and announcements from K.S.R.M. College of Engineering, Kadapa.",
  path: "/news",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
