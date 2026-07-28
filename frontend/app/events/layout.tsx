import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events | K.S.R.M. College of Engineering",
  description: "Latest events, technical fests and activities at KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/events" },
  openGraph: { title: "Events | K.S.R.M. College of Engineering", description: "Latest events, technical fests and activities at KSRM College of Engineering, Kadapa.", url: "/events" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
