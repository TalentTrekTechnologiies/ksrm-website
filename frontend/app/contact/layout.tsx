import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | K.S.R.M. College of Engineering",
  description: "Contact KSRM College of Engineering, Kadapa - address, phone, email and campus location.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Us | K.S.R.M. College of Engineering", description: "Contact KSRM College of Engineering, Kadapa - address, phone, email and campus location.", url: "/contact" },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
