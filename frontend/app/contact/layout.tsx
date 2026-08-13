import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: "Contact K.S.R.M. College of Engineering, Kadapa - address, phone, email and campus location.",
  path: "/contact",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
