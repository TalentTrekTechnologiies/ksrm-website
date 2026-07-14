import { Metadata } from "next"
import EventsManager from "@/components/admin/EventsManager"

export const metadata: Metadata = {
  title: "Events | K.S.R.M College of Engineering",
}

export default function EventsAdminPage() {
  return <EventsManager />
}
