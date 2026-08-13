import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Facilities for Differently-Abled",
  description: "Accessibility facilities and support for differently-abled students at K.S.R.M. College of Engineering, Kadapa, and the committee overseeing them.",
  path: "/campus-life/facilities-for-differently-abled",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/facilities-for-differently-abled" />
      {children}
    </>
  )
}
