import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description: "Photo gallery of the campus, laboratories, events and student life at K.S.R.M. College of Engineering, Kadapa.",
  path: "/gallery",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
