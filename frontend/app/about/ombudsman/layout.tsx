import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Ombudsperson",
  description: "Ombudsperson at K.S.R.M. College of Engineering, Kadapa - appointment details and the process for redressal of student grievances.",
  path: "/about/ombudsman",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/about/ombudsman" />
      {children}
    </>
  )
}
