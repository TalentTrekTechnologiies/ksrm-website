import { Metadata } from "next"
import KgcetManager from "@/components/admin/KgcetManager"

export const metadata: Metadata = {
  title: "KGCET | K.S.R.M. College of Engineering",
}

export default function KgcetAdminPage() {
  return <KgcetManager />
}
