import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Admissions",
  description: "Admissions to B.Tech, M.Tech, MBA and Diploma programmes at K.S.R.M. College of Engineering, Kadapa.",
  path: "/admissions",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
