import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Events",
  description: "Latest events, technical fests and activities at K.S.R.M. College of Engineering, Kadapa.",
  path: "/events",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
