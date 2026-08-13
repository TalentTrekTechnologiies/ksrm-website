import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: "Career and recruitment opportunities at K.S.R.M. College of Engineering, Kadapa.",
  path: "/careers",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
