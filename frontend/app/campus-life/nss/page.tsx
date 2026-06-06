import NSSTemplate from "@/components/campusLife/NSSTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "NSS | KSRM College of Engineering",
  description:
    "KSRM College of Engineering NSS unit with 250+ volunteers engaged in community service, environmental conservation, and social development.",
}

export default function NSSPage() {
  return <NSSTemplate />
}
