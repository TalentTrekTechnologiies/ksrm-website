import { Metadata } from "next"
import AuditLogsManager from "@/components/admin/AuditLogsManager"

export const metadata: Metadata = {
  title: "Audit Logs | K.S.R.M College of Engineering",
}

export default function AuditLogsPage() {
  return <AuditLogsManager />
}
