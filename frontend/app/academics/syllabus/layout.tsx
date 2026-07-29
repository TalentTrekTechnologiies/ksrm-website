import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Syllabus | K.S.R.M. College of Engineering",
  description: "Regulation-wise syllabus for B.Tech, M.Tech and MBA programmes at K.S.R.M. College of Engineering.",
  alternates: { canonical: "/academics/syllabus" },
  openGraph: { title: "Syllabus | K.S.R.M. College of Engineering", description: "Regulation-wise syllabus for B.Tech, M.Tech and MBA programmes at K.S.R.M. College of Engineering.", url: "/academics/syllabus" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
