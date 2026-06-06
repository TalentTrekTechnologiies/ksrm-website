import { Metadata } from "next"
import PlacementsTemplate from "@/components/placements/PlacementsTemplate"

export const metadata: Metadata = {
  title: "Placements | KSRM College of Engineering",
  description:
    "Training and Placements cell at KSRM College - 500+ students placed with leading companies. Average package 4.5 LPA.",
}

export default function PlacementsPage() {
  return <PlacementsTemplate />
}
