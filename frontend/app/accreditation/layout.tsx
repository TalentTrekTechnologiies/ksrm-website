import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Accreditation",
  description: "Accreditations and recognitions - NAAC A+, NBA Tier-1, UGC Autonomous - of K.S.R.M. College of Engineering, Kadapa.",
  path: "/accreditation",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
