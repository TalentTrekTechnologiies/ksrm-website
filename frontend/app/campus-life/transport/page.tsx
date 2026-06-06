import TransportTemplate from "@/components/campusLife/TransportTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transport | KSRM College of Engineering",
  description:
    "KSRM College of Engineering transport with 15 buses covering 8 major routes in Kadapa, Tirupati, and surrounding areas.",
}

export default function TransportPage() {
  return <TransportTemplate />
}
