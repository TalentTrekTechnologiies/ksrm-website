import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "NBA",
  description:
    "NBA programme accreditation for K.S.R.M. College of Engineering, Kadapa - accredited programmes and supporting documents.",
  path: "/nba",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
