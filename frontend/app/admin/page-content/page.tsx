import { Suspense } from "react"
import { Metadata } from "next"
import PageContentManager from "@/components/admin/PageContentManager"

export const metadata: Metadata = {
  title: "Page Content | K.S.R.M. College of Engineering",
}

export default function PageContentAdminPage() {
  return (
    // PageContentManager reads useSearchParams() (?section=) so the sidebar's
    // per-page links open straight into that page - Next requires that inside a
    // Suspense boundary for static export, same as the workspace route.
    <Suspense fallback={null}>
      <PageContentManager />
    </Suspense>
  )
}
