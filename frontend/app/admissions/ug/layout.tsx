import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "B.Tech Admissions | K.S.R.M. College of Engineering",
  description: "Undergraduate (B.Tech) admissions at KSRM College of Engineering, Kadapa - programmes, intake and process.",
  alternates: { canonical: "/admissions/ug" },
  openGraph: { title: "B.Tech Admissions | K.S.R.M. College of Engineering", description: "Undergraduate (B.Tech) admissions at KSRM College of Engineering, Kadapa - programmes, intake and process.", url: "/admissions/ug" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
