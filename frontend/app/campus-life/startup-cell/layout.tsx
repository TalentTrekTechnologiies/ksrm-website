import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs"

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs path="/campus-life/startup-cell" />
      {children}
    </>
  )
}
