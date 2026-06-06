import HostelsTemplate from "@/components/campusLife/HostelsTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hostels | KSRM College of Engineering",
  description:
    "KSRM College of Engineering boys and girls hostels with modern facilities, mess, Wi-Fi, and 24/7 security.",
}

export default function HostelsPage() {
  return <HostelsTemplate />
}
