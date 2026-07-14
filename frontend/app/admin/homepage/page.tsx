import { Metadata } from "next"
import HomepageLanding from "@/components/admin/homepage/HomepageLanding"

export const metadata: Metadata = {
  title: "Homepage | K.S.R.M. College of Engineering",
}

export default function HomepageAdminPage() {
  return <HomepageLanding />
}
