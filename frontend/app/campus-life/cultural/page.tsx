import CulturalTemplate from "@/components/campusLife/CulturalTemplate"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cultural Club | KSRM College of Engineering",
  description: "KSRM College of Engineering Cultural Club celebrating creativity, talent and the spirit of togetherness through KALAKRITI and cultural events.",
}

export default function CulturalPage() {
  return <CulturalTemplate />
}
