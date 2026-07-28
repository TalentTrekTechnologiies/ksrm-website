import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Placements Overview | K.S.R.M. College of Engineering",
  description: "Placement statistics, top recruiters and highest packages at KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/placements/overview" },
  openGraph: { title: "Placements Overview | K.S.R.M. College of Engineering", description: "Placement statistics, top recruiters and highest packages at KSRM College of Engineering, Kadapa.", url: "/placements/overview" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
