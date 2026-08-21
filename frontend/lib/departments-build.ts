import { API_BASE } from "@/lib/api-base";

/**
 * The departments as the CMS knows them, read ONCE at build time.
 *
 * This exists because of a failure that is invisible until someone hits it:
 * the site is a static export, so the set of department pages is fixed when
 * the build runs. A department created in the CMS therefore produced no page
 * at all - and because nginx serves /index.html for unknown paths, the URL
 * answered 200 with the homepage rather than 404ing. "I created it in the CMS
 * and it is not on the site" had no error anywhere to explain it.
 *
 * Both the department route and the sitemap read from here, so a department
 * cannot be built but left out of the sitemap, or vice versa.
 */

/** How long the build will wait for the CMS before giving up. */
const CMS_LOOKUP_TIMEOUT_MS = 4000;

export interface CmsDepartmentRecord {
  slug: string;
  name?: string | null;
  shortName?: string | null;
  isActive?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
}

/**
 * Department rows that are offices rather than teaching departments. They have
 * real CMS records and their own admin workspace, but no public department
 * page - the Central Library and Examination Section have their own pages
 * elsewhere on the site.
 *
 * Kept in step with NON_ACADEMIC_DEPARTMENT_SLUGS in lib/departments-api.ts.
 * That module is not imported here on purpose: this one runs during the build
 * and must not pull in the browser API client.
 */
const OFFICE_SLUGS = new Set(["central-library", "examination-section"]);

/**
 * Absolute URL for the build-time lookup.
 *
 * Production sets NEXT_PUBLIC_API_URL to a relative "/api", which the browser
 * resolves against the page's own origin. At build time there is no page and
 * therefore no origin, so fetch("/api/departments") throws "Failed to parse
 * URL". BUILD_API_ORIGIN supplies one.
 */
function cmsEndpoint(): string {
  if (/^https?:\/\//i.test(API_BASE)) return `${API_BASE}/departments`;
  const origin = (process.env.BUILD_API_ORIGIN ?? "http://localhost:4000").replace(/\/$/, "");
  return `${origin}${API_BASE}/departments`;
}

let cmsDepartmentsPromise: Promise<Map<string, CmsDepartmentRecord>> | null = null;

/**
 * Two things this has to get right, both learned the hard way when an earlier
 * version of it broke a production build:
 *
 *  1. A TIMEOUT. The original went through apiGet, which calls fetch with no
 *     signal, and a .catch() only fires on rejection - a request that HANGS
 *     never rejects, so each department page sat waiting until Next's own
 *     60-second export limit killed it, three attempts each, and the build
 *     exited. An unreachable API must fail in seconds, not hang.
 *  2. ONE call, not one per page. This runs for every department page, so
 *     without the shared promise below it was one identical request per page.
 *
 * Returns an empty map on any failure - timeout, network error, non-200, bad
 * JSON - so the build falls back to the slugs defined in code. The CMS is an
 * enhancement here; it must never be able to fail a build.
 */
export function loadCmsDepartments(): Promise<Map<string, CmsDepartmentRecord>> {
  // `force-cache`, NOT `no-store`. Under output: "export" the route is
  // effectively `dynamic = "error"`, and a no-store fetch marks the render
  // dynamic - Next then refuses to render it statically and the lookup fails
  // every time with "couldn't be rendered statically". Caching is right here
  // anyway: this runs once at build, and the result is baked into the HTML.
  const endpoint = cmsEndpoint();
  cmsDepartmentsPromise ??= fetch(endpoint, {
    signal: AbortSignal.timeout(CMS_LOOKUP_TIMEOUT_MS),
    cache: "force-cache",
  })
    .then((r) => (r.ok ? r.json() : []))
    .then(
      (list: CmsDepartmentRecord[]) =>
        new Map((Array.isArray(list) ? list : []).map((d) => [d.slug, d])),
    )
    .catch((err: unknown) => {
      // Logged once, not per page, so a build against an offline API says so
      // plainly instead of looking like the overrides silently did nothing.
      // The reason is included: "timed out" and "connection refused" call for
      // very different fixes, and without it the message is a dead end.
      console.warn(
        `[departments] CMS lookup failed - building only the departments defined in code. ` +
          `URL: ${endpoint} - ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`,
      );
      return new Map<string, CmsDepartmentRecord>();
    });
  return cmsDepartmentsPromise;
}

export async function cmsDepartment(slug: string): Promise<CmsDepartmentRecord | null> {
  return (await loadCmsDepartments()).get(slug) ?? null;
}

/**
 * Slugs that should get a public department page: every active teaching
 * department the CMS knows about, offices excluded.
 */
export async function cmsDepartmentSlugs(): Promise<string[]> {
  const all = await loadCmsDepartments();
  return [...all.values()]
    .filter((d) => d.slug && d.isActive !== false && !OFFICE_SLUGS.has(d.slug.trim().toLowerCase()))
    .map((d) => d.slug);
}
