import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Placements Overview",
  description: "Placement statistics, top recruiters and highest packages at K.S.R.M. College of Engineering, Kadapa.",
  path: "/placements/overview",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/placements/overview" />
      {children}
    </>
  )
}
