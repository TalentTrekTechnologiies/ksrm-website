import type { Metadata } from "next"
import CmsText from "@/components/CmsText";
import { pageMetadata } from "@/lib/seo"

/**
 * Thin CMS shell that duplicates the real, far richer /admissions section.
 * Kept as a working URL (it may hold CMS copy and was linked from the Academics
 * index), but taken out of the index with a single clean `noindex, follow`
 * signal so it stops competing with /admissions in search results.
 *
 * A cross-URL canonical would be the wrong tool here: the two pages are not
 * substantially equivalent, which is what rel=canonical asserts.
 */
export const metadata: Metadata = pageMetadata({
  title: "Admissions",
  description: "Admissions information for K.S.R.M. College of Engineering, Kadapa.",
  path: "/academics/admissions",
  noindex: true,
})

export default function SubPage() {
  return <main><h1><CmsText section="academics.admissions" slot="admissions" /></h1><p><CmsText section="academics.admissions" slot="content" /></p></main>
}
