import { Metadata } from "next"
import PlacementsManager from "@/components/admin/PlacementsManager"

export const metadata: Metadata = {
  title: "Placements | K.S.R.M College of Engineering",
}

export default function PlacementsAdminPage() {
  return <PlacementsManager />
}
