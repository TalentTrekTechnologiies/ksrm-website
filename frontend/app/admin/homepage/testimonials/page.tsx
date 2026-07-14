import { Metadata } from "next"
import TestimonialsManager from "@/components/admin/homepage/TestimonialsManager"

export const metadata: Metadata = {
  title: "Testimonials | K.S.R.M College of Engineering",
}

export default function TestimonialsAdminPage() {
  return <TestimonialsManager />
}
