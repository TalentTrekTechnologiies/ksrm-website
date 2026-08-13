import type { Metadata } from "next"
import CmsText from "@/components/CmsText";
import { pageMetadata } from "@/lib/seo"

/**
 * Thin CMS shell duplicating the real /admissions/diploma page - see the note
 * in app/academics/admissions/page.tsx for why this is `noindex, follow`
 * rather than a cross-URL canonical.
 */
export const metadata: Metadata = pageMetadata({
  title: "Diploma",
  description: "Diploma programmes at K.S.R.M. College of Engineering, Kadapa.",
  path: "/academics/diploma",
  noindex: true,
})

export default function SubPage() {
  return <main><h1><CmsText section="academics.diploma" slot="diploma" /></h1><p><CmsText section="academics.diploma" slot="content" /></p></main>
}
