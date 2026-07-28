import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers | K.S.R.M. College of Engineering",
  description: "Career and recruitment opportunities at KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/careers" },
  openGraph: { title: "Careers | K.S.R.M. College of Engineering", description: "Career and recruitment opportunities at KSRM College of Engineering, Kadapa.", url: "/careers" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
