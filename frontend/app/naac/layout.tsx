import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "NAAC",
  description: "NAAC accreditation information and documents for K.S.R.M. College of Engineering, Kadapa.",
  path: "/naac",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
