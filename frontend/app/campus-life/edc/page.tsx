import { Metadata } from "next"
import CmsText from "@/components/CmsText";

export const metadata: Metadata = {
  title: "Edc | K.S.R.M. College of Engineering",
}

export default function SubPage() {
  return <main><h1>Edc</h1><p><CmsText section="edc" slot="content" /></p></main>
}
