import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Placements | K.S.R.M. College of Engineering",
  description: "Training & Placements at KSRM College of Engineering - 1200+ students placed, 200+ recruiters, top packages.",
  alternates: { canonical: "/placements" },
  openGraph: { title: "Placements | K.S.R.M. College of Engineering", description: "Training & Placements at KSRM College of Engineering - 1200+ students placed, 200+ recruiters, top packages.", url: "/placements" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
