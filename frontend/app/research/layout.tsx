import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Research | K.S.R.M. College of Engineering",
  description: "Research publications, projects and patents across engineering departments at KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/research" },
  openGraph: { title: "Research | K.S.R.M. College of Engineering", description: "Research publications, projects and patents across engineering departments at KSRM College of Engineering, Kadapa.", url: "/research" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
