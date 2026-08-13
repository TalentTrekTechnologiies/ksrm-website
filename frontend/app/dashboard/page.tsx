import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

// Placeholder route. Kept out of the index (and out of sitemap.ts) so an empty
// "Coming Soon" shell can't be crawled as a thin page; robots.txt disallows it
// too, but a page can be indexed from an external link without ever being
// crawled, and only the meta tag prevents that.
export const metadata: Metadata = pageMetadata({
  title: "Dashboard",
  description: "Student and staff dashboard for K.S.R.M. College of Engineering, Kadapa.",
  path: "/dashboard",
  noindex: true,
})

export default function Page() {
  return <div style={{ padding: '60px 20px', textAlign: 'center' }}>Coming Soon</div>
}
