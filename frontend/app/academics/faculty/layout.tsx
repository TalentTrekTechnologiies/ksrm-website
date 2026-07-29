import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Faculty | K.S.R.M. College of Engineering",
  description: "Meet the faculty across engineering departments at K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/academics/faculty" },
  openGraph: { title: "Faculty | K.S.R.M. College of Engineering", description: "Meet the faculty across engineering departments at K.S.R.M. College of Engineering, Kadapa.", url: "/academics/faculty" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
