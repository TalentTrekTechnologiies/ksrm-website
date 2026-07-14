import { Suspense } from "react"
import { Metadata } from "next"
import DepartmentWorkspace from "@/components/admin/departments/DepartmentWorkspace"

export const metadata: Metadata = {
  title: "Department Workspace | K.S.R.M. College of Engineering",
}

export default function DepartmentWorkspacePage() {
  return (
    // DepartmentWorkspace reads useSearchParams() (id, tab) - Next requires
    // that to be inside a Suspense boundary for static export, same as
    // the homepage preview route.
    <Suspense fallback={null}>
      <DepartmentWorkspace />
    </Suspense>
  )
}
