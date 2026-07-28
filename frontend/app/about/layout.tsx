import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | K.S.R.M. College of Engineering",
  description: "About KSRM College of Engineering, Kadapa - a UGC Autonomous, NAAC A++ accredited, NBA Tier-1 institution: history, leadership, vision and mission.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Us | K.S.R.M. College of Engineering", description: "About KSRM College of Engineering, Kadapa - a UGC Autonomous, NAAC A++ accredited, NBA Tier-1 institution: history, leadership, vision and mission.", url: "/about" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
