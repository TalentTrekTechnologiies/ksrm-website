import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Equal Opportunity Cell",
  description: "The Equal Opportunity Cell at K.S.R.M. College of Engineering, Kadapa - its role, committee members and support available to students.",
  path: "/campus-life/equal-opportunity-cell",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/equal-opportunity-cell" />
      {children}
    </>
  )
}
