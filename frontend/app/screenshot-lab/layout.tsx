import type { Metadata } from "next"

/**
 * Internal test bench. Not linked, not indexed, not in the sitemap - it exists
 * to be opened by hand while someone tries to capture the viewer next to it.
 */
export const metadata: Metadata = {
  title: "Screenshot lab | K.S.R.M.",
  robots: { index: false, follow: false, nocache: true },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
