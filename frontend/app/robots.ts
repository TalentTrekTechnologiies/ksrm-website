import type { MetadataRoute } from "next"

// Production robots.txt (generated into out/robots.txt at build). Allows the
// whole public site, keeps crawlers out of the admin panel, and points at the
// sitemap. NOTE: the temporary Hostinger test site uses a separate, manually
// placed "Disallow: /" robots.txt so it is never indexed - that override lives
// only in that deployment, not here.
const SITE_URL = "https://ksrmce.ac.in"

// Required so Next statically emits out/robots.txt under `output: "export"`.
export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
