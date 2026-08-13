import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "About K.S.R.M. College of Engineering, Kadapa - a UGC Autonomous, NAAC A+ accredited, NBA Tier-1 institution: history, leadership, vision and mission.",
  path: "/about",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
