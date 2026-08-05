import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accreditation | K.S.R.M. College of Engineering",
  description: "Accreditations and recognitions - NAAC A+, NBA Tier-1, UGC Autonomous - of K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/accreditation" },
  openGraph: { title: "Accreditation | K.S.R.M. College of Engineering", description: "Accreditations and recognitions - NAAC A+, NBA Tier-1, UGC Autonomous - of K.S.R.M. College of Engineering, Kadapa.", url: "/accreditation" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
