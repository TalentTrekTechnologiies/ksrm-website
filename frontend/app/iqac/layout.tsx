import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IQAC | K.S.R.M. College of Engineering",
  description: "Internal Quality Assurance Cell (IQAC) - reports, minutes and documents - at KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/iqac" },
  openGraph: { title: "IQAC | K.S.R.M. College of Engineering", description: "Internal Quality Assurance Cell (IQAC) - reports, minutes and documents - at KSRM College of Engineering, Kadapa.", url: "/iqac" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
