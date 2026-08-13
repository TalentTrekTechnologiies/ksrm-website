import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Examinations",
  description: "Examination notifications, time tables, results and academic calendars at K.S.R.M. College of Engineering.",
  path: "/examinations",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
