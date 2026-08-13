import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "B.Tech Admissions",
  description: "Undergraduate (B.Tech) admissions at K.S.R.M. College of Engineering, Kadapa - programmes, intake and process.",
  path: "/admissions/ug",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/admissions/ug" />
      {children}
    </>
  )
}
