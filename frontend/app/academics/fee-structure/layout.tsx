import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Fee Structure",
  description: "Fee structure by programme at K.S.R.M. College of Engineering, Kadapa, along with the scholarships and financial assistance available to students.",
  path: "/academics/fee-structure",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/academics/fee-structure" />
      {children}
    </>
  )
}
