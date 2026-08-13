import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "PG Admissions",
  description: "Postgraduate (M.Tech / MBA) admissions at K.S.R.M. College of Engineering, Kadapa.",
  path: "/admissions/pg",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/admissions/pg" />
      {children}
    </>
  )
}
