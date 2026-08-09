import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quality Assurance Cell | K.S.R.M. College of Engineering",
  description: "Quality Assurance Cell - reports, minutes and documents - at K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/iqac" },
  openGraph: { title: "Quality Assurance Cell | K.S.R.M. College of Engineering", description: "Quality Assurance Cell - reports, minutes and documents - at K.S.R.M. College of Engineering, Kadapa.", url: "/iqac" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
