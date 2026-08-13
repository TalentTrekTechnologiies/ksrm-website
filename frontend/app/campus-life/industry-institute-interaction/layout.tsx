import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Industry Institute Interaction",
  description: "Industry Institute Interaction at K.S.R.M. College of Engineering, Kadapa - industry engagement activities and the committee that coordinates them.",
  path: "/campus-life/industry-institute-interaction",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/industry-institute-interaction" />
      {children}
    </>
  )
}
