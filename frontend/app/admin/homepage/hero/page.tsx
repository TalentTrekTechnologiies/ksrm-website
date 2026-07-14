import { Metadata } from "next"
import HeroEditor from "@/components/admin/homepage/HeroEditor"

export const metadata: Metadata = {
  title: "Hero Banner | K.S.R.M. College of Engineering",
}

export default function HeroAdminPage() {
  return <HeroEditor />
}
