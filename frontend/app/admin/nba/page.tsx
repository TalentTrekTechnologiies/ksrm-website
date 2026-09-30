import { Metadata } from "next"
import NbaWorkspace from "@/components/admin/NbaWorkspace"

export const metadata: Metadata = {
  title: "NBA | K.S.R.M. College of Engineering",
}

/**
 * NBA accreditation: the branches and the documents the public page shows.
 *
 * Both already existed, managed from opposite ends of the admin - programmes
 * under Academics, documents behind a page-section dropdown on the general
 * Documents browser. This is one screen for that page, not a new store.
 */
export default function NbaAdminPage() {
  return <NbaWorkspace />
}
