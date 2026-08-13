import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Apply for a Position",
  description: "Application form for open positions at K.S.R.M. College of Engineering, Kadapa.",
  path: "/careers/apply",
  noindex: true,
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
