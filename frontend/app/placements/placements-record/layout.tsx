import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Placements Record",
  description: "Year-wise placement records at K.S.R.M. College of Engineering, Kadapa - students placed, recruiting companies and placement outcomes.",
  path: "/placements/placements-record",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/placements/placements-record" />
      {children}
    </>
  )
}
