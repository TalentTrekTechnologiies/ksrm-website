import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Downloads",
  description: "Syllabi, question papers, brochures and forms - document downloads from K.S.R.M. College of Engineering.",
  path: "/downloads",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
