import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admissions | K.S.R.M. College of Engineering",
  description: "Admissions to B.Tech, M.Tech, MBA and Diploma programmes at K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/admissions" },
  openGraph: { title: "Admissions | K.S.R.M. College of Engineering", description: "Admissions to B.Tech, M.Tech, MBA and Diploma programmes at K.S.R.M. College of Engineering, Kadapa.", url: "/admissions" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
