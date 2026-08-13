import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Institution's Innovation Council (IIC)",
  description: "The Institution's Innovation Council at K.S.R.M. College of Engineering, Kadapa - objectives, key activities and innovation initiatives for students.",
  path: "/iic",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
