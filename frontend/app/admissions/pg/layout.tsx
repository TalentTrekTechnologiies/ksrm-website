import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PG Admissions | K.S.R.M. College of Engineering",
  description: "Postgraduate (M.Tech / MBA) admissions at K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/admissions/pg" },
  openGraph: { title: "PG Admissions | K.S.R.M. College of Engineering", description: "Postgraduate (M.Tech / MBA) admissions at K.S.R.M. College of Engineering, Kadapa.", url: "/admissions/pg" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
