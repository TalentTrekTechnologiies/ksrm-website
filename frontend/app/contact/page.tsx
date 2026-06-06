import { Metadata } from "next"
import ContactTemplate from "@/components/contact/ContactTemplate"

export const metadata: Metadata = {
  title: "Contact Us | KSRM College of Engineering",
  description:
    "Contact KSRM College of Engineering. Location: Kadapa - 516 003, Andhra Pradesh. Phone: +91 8143731980",
}

export default function ContactPage() {
  return <ContactTemplate />
}
