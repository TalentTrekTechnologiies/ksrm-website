import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Alumni Association",
  description: "The K.S.R.M. Alumni Association - chapters across India and abroad, alumni activities, and how graduates of KSRMCE Kadapa can stay connected.",
  path: "/alumni",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
