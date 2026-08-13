import type { Metadata } from "next"
import CmsText from "@/components/CmsText";
import { pageMetadata } from "@/lib/seo"

/**
 * Thin CMS shell duplicating the real /edc page (Entrepreneurship Development
 * Cell), which carries roughly twice the content. See the note in
 * app/academics/admissions/page.tsx for why this is `noindex, follow` rather
 * than a cross-URL canonical.
 *
 * NOTE: deploy/nginx-redirects.conf still sends the legacy /edc.php here. That
 * target is repointed to /edc/ as part of this SEO pass so the 301 lands on the
 * indexable page rather than the noindexed shell.
 */
export const metadata: Metadata = pageMetadata({
  title: "Entrepreneurship Development Cell",
  description: "The Entrepreneurship Development Cell at K.S.R.M. College of Engineering, Kadapa.",
  path: "/campus-life/edc",
  noindex: true,
})

export default function SubPage() {
  return <main><h1>Entrepreneurship Development Cell (EDC)</h1><p><CmsText section="edc" slot="content" /></p></main>
}
