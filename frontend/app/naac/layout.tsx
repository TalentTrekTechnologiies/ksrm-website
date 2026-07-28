import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NAAC | K.S.R.M. College of Engineering",
  description: "NAAC accreditation information and documents for KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/naac" },
  openGraph: { title: "NAAC | K.S.R.M. College of Engineering", description: "NAAC accreditation information and documents for KSRM College of Engineering, Kadapa.", url: "/naac" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
