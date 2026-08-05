import { Metadata } from "next"
import TransportManager from "@/components/admin/TransportManager"

export const metadata: Metadata = {
  title: "Transport | K.S.R.M. College of Engineering",
}

export default function TransportAdminPage() {
  return <TransportManager />
}
