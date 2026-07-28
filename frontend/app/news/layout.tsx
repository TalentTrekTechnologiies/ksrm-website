import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "News | K.S.R.M. College of Engineering",
  description: "News and announcements from KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/news" },
  openGraph: { title: "News | K.S.R.M. College of Engineering", description: "News and announcements from KSRM College of Engineering, Kadapa.", url: "/news" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
