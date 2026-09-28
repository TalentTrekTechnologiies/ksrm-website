import type { Metadata } from "next"

/**
 * An experiment, not part of the site: kept out of the sitemap, out of search,
 * and off every menu. It exists to be opened by hand on a phone and a laptop
 * side by side.
 */
export const metadata: Metadata = {
  title: "Camera resistance lab | K.S.R.M.",
  robots: { index: false, follow: false, nocache: true },
}

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
