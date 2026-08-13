import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Academic Regulations",
  description: "Academic regulations at K.S.R.M. College of Engineering, Kadapa - curriculum rules, examination and assessment norms for UG and PG programmes.",
  path: "/academics/regulations",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/academics/regulations" />
      {children}
    </>
  )
}
