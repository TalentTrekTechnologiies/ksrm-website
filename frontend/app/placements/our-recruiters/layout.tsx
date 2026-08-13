import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Our Recruiters",
  description: "Companies that recruit from K.S.R.M. College of Engineering, Kadapa - the organisations hiring KSRMCE graduates across engineering and management.",
  path: "/placements/our-recruiters",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/placements/our-recruiters" />
      {children}
    </>
  )
}
