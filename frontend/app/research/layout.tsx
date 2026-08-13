import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Research",
  description: "Research publications, projects and patents across engineering departments at K.S.R.M. College of Engineering, Kadapa.",
  path: "/research",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
