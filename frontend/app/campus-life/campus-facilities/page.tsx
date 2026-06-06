import CampusFacilitiesTemplate from "@/components/campusLife/CampusFacilitiesTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Campus Facilities | KSRM College of Engineering",
  description: "KSRM College of Engineering campus facilities with state-of-the-art infrastructure, labs, hostels, library, sports complex and modern amenities.",
}

export default function CampusFacilitiesPage() {
  return <CampusFacilitiesTemplate />
}
