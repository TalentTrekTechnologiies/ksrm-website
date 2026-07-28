import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Downloads | K.S.R.M. College of Engineering",
  description: "Syllabi, question papers, brochures and forms - document downloads from KSRM College of Engineering.",
  alternates: { canonical: "/downloads" },
  openGraph: { title: "Downloads | K.S.R.M. College of Engineering", description: "Syllabi, question papers, brochures and forms - document downloads from KSRM College of Engineering.", url: "/downloads" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
