import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Syllabus",
  description: "Regulation-wise syllabus for B.Tech, M.Tech and MBA programmes at K.S.R.M. College of Engineering.",
  path: "/academics/syllabus",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/academics/syllabus" />
      {children}
    </>
  )
}
