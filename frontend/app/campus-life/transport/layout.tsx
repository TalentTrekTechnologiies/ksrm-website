import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Transport",
  description: "College bus routes, transport rules and student transport facilities at K.S.R.M. College of Engineering, Kadapa.",
  path: "/campus-life/transport",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/transport" />
      {children}
    </>
  )
}
