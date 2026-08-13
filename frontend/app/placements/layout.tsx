import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Placements",
  description: "Training & Placements at K.S.R.M. College of Engineering - 1200+ students placed, 200+ recruiters, top packages.",
  path: "/placements",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
