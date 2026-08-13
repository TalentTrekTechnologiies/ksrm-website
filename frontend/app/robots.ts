import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

/**
 * Production robots.txt (generated into out/robots.txt at build).
 *
 * NOTE: the temporary Hostinger test site uses a separate, manually placed
 * "Disallow: /" robots.txt so it is never indexed - that override lives only in
 * that deployment, not here.
 *
 * Deliberately NOT blocked: /_next/ (the CSS and JS bundles). Blocking those
 * stops Google rendering the page at all, which on a client-hydrated site like
 * this one would hide most of the content from the index. Nothing under
 * /_next/static is sensitive.
 */

// Required so Next statically emits out/robots.txt under `output: "export"`.
export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin", // admin SPA, behind login
        "/dashboard", // placeholder route
        "/api/", // backend proxy paths, if ever served from this origin
        "/careers/apply", // application form - no search value, collects PII
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
