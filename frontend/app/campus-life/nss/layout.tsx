import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "National Service Scheme (NSS)",
  description: "The National Service Scheme unit at K.S.R.M. College of Engineering, Kadapa - community service activities, camps and student volunteering.",
  path: "/campus-life/nss",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/nss" />
      {children}
    </>
  )
}
