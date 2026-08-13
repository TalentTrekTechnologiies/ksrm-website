import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Quality Assurance Cell",
  description: "Quality Assurance Cell - reports, minutes and documents - at K.S.R.M. College of Engineering, Kadapa.",
  path: "/iqac",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
