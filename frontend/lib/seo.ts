import type { Metadata } from "next"

/**
 * Single source of truth for site-wide SEO values.
 *
 * Why this exists: the site URL used to be re-typed in app/layout.tsx,
 * app/sitemap.ts and app/robots.ts independently, and ~30 route layouts each
 * hand-built their own title/description/canonical/openGraph object. That
 * duplication is what let the sitemap drift out of trailing-slash agreement
 * with the canonicals it was supposed to match (audit C3). One constant and one
 * helper now feed all three.
 */

/**
 * Canonical origin. NON-www, confirmed with the client 2026-08-13.
 * www.ksrmce.ac.in must 301 here at the DNS/server layer - this constant only
 * controls what the site *claims* is canonical, it cannot redirect anything.
 * No trailing slash: callers always supply a path that starts with "/".
 */
export const SITE_URL = "https://ksrmce.ac.in"

export const SITE_NAME = "K.S.R.M. College of Engineering"
export const SITE_SHORT_NAME = "KSRMCE"

/** Default social share card. Must exist in public/ or every share breaks (audit C8). */
export const DEFAULT_OG_IMAGE = "/og-image.jpg"

/**
 * next.config.ts sets `trailingSlash: true`, so the real, servable URL for
 * every route ends in "/". Canonicals, OG URLs and sitemap entries must all use
 * that exact form or they point at a redirect instead of the page.
 * The site root stays "/" rather than becoming "//".
 */
export function absoluteUrl(path: string): string {
  if (!path || path === "/") return `${SITE_URL}/`
  const withLeading = path.startsWith("/") ? path : `/${path}`
  const withTrailing = withLeading.endsWith("/") ? withLeading : `${withLeading}/`
  return `${SITE_URL}${withTrailing}`
}

export interface PageSeoInput {
  /**
   * Page-specific part of the title; the institution suffix is appended for
   * you. Optional only when `fullTitle` is supplied instead.
   */
  title?: string
  description: string
  /** Route path, e.g. "/admissions/ug". Trailing slash added automatically. */
  path: string
  /** Absolute or public-root-relative image path. Defaults to the site OG image. */
  image?: string
  /** Set true for utility pages that should stay out of the index. */
  noindex?: boolean
  /** Overrides the auto-appended suffix - used by the homepage. */
  fullTitle?: string
}

/**
 * Builds a complete, consistent Metadata object: title, description, canonical,
 * Open Graph and Twitter card. Every public route should go through this rather
 * than assembling the fields by hand, so a page can never again ship with (say)
 * an OG title that disagrees with its <title>.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  fullTitle,
}: PageSeoInput): Metadata {
  const resolvedTitle = fullTitle ?? `${title} | ${SITE_NAME}`
  if (!fullTitle && !title) {
    throw new Error("pageMetadata: supply either `title` or `fullTitle`")
  }
  const url = absoluteUrl(path)
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [imageUrl],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
