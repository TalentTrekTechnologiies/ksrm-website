import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery | K.S.R.M. College of Engineering",
  description: "Photo gallery of the campus, laboratories, events and student life at K.S.R.M. College of Engineering, Kadapa.",
  alternates: { canonical: "/gallery" },
  openGraph: { title: "Gallery | K.S.R.M. College of Engineering", description: "Photo gallery of the campus, laboratories, events and student life at K.S.R.M. College of Engineering, Kadapa.", url: "/gallery" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
