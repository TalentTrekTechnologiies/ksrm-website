import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export const metadata: Metadata = pageMetadata({
  title: "Diploma Admissions",
  description: "Diploma programme admissions at K.S.R.M. College of Engineering, Kadapa.",
  path: "/admissions/diploma",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/admissions/diploma" />
      {children}
    </>
  )
}
