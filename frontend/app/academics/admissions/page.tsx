import { Metadata } from "next"
import CmsText from "@/components/CmsText";

export const metadata: Metadata = {
  title: "Admissions | K.S.R.M. College of Engineering",
}

export default function SubPage() {
  return <main><h1><CmsText section="academics.admissions" slot="admissions" /></h1><p><CmsText section="academics.admissions" slot="content" /></p></main>
}
