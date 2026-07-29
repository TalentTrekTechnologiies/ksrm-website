import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Examinations | K.S.R.M. College of Engineering",
  description: "Examination notifications, time tables, results and academic calendars at K.S.R.M. College of Engineering.",
  alternates: { canonical: "/examinations" },
  openGraph: { title: "Examinations | K.S.R.M. College of Engineering", description: "Examination notifications, time tables, results and academic calendars at K.S.R.M. College of Engineering.", url: "/examinations" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
