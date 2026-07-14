import { Metadata } from "next"
import CommitteesManager from "@/components/admin/CommitteesManager"

export const metadata: Metadata = {
  title: "Committees | K.S.R.M. College of Engineering",
}

export default function CommitteesAdminPage() {
  return <CommitteesManager />
}
