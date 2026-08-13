import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Courses & Intake",
  description: "Programmes offered and sanctioned intake at K.S.R.M. College of Engineering, Kadapa.",
  path: "/academics/courses-intake",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/academics/courses-intake" />
      {children}
    </>
  )
}
