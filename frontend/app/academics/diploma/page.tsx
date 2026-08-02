import { Metadata } from "next"
import CmsText from "@/components/CmsText";

export const metadata: Metadata = {
  title: "Diploma | K.S.R.M. College of Engineering",
}

export default function SubPage() {
  return <main><h1><CmsText section="academics.diploma" slot="diploma" /></h1><p><CmsText section="academics.diploma" slot="content" /></p></main>
}
