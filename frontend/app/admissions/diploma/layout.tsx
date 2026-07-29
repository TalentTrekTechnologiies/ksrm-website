import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Diploma Admissions | K.S.R.M. College of Engineering",
  description: "Diploma programme admissions at K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/admissions/diploma" },
  openGraph: { title: "Diploma Admissions | K.S.R.M. College of Engineering", description: "Diploma programme admissions at K.S.R.M. College of Engineering, Kadapa.", url: "/admissions/diploma" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
