import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "SEDG Cell",
  description: "The Socio-Economically Disadvantaged Groups (SEDG) Cell at K.S.R.M. College of Engineering, Kadapa - its purpose, committee and student support.",
  path: "/campus-life/sedg-cell",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/sedg-cell" />
      {children}
    </>
  )
}
