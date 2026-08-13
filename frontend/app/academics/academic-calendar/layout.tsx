import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Academic Calendar",
  description: "Academic calendars for K.S.R.M. College of Engineering, Kadapa - semester schedules, examination dates and holidays, downloadable by year.",
  path: "/academics/academic-calendar",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/academics/academic-calendar" />
      {children}
    </>
  )
}
