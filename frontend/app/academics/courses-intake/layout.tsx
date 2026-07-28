import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Courses & Intake | K.S.R.M. College of Engineering",
  description: "Programmes offered and sanctioned intake at KSRM College of Engineering, Kadapa.",
  alternates: { canonical: "/academics/courses-intake" },
  openGraph: { title: "Courses & Intake | K.S.R.M. College of Engineering", description: "Programmes offered and sanctioned intake at KSRM College of Engineering, Kadapa.", url: "/academics/courses-intake" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
