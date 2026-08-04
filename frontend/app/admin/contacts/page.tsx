import { Metadata } from "next"
import ContactsManager from "@/components/admin/ContactsManager"

export const metadata: Metadata = {
  title: "Contacts | K.S.R.M. College of Engineering",
}

export default function ContactsAdminPage() {
  return <ContactsManager />
}
