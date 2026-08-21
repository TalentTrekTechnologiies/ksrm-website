import { API_BASE } from "@/lib/api-base";
import { SITE_URL } from "@/lib/seo";
import { canonicalDepartmentSlug } from "@/lib/department-slugs";

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

/**
 * Cache-buster, changing once per build.
 *
 * The fetch below must be `force-cache` (see loadCmsDepartments), and Next
 * keeps that cache in .next/cache BETWEEN builds, keyed on the URL. So a
 * department created in the CMS could still be missing from a rebuild, because
 * the build never asked the API again - it replayed a response recorded before
 * the department existed. That is indistinguishable from the API being down,
 * and it makes "create it in the CMS, then redeploy" silently not work.
 *
 * Rounded to the minute so the workers of a single build share one value and
 * make one request between them, while any later build gets a fresh one.
 */
const BUILD_STAMP = Math.floor(Date.now() / 60_000);

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
function cmsEndpoints(): string[] {
  if (/^https?:\/\//i.test(API_BASE)) return [`${API_BASE}/departments`];

  // Tried in order. The backend on the build machine is the right source and
  // the fast one, but a deploy where it is on another port, still starting, or
  // behind a socket would quietly fall back to "only the departments defined
  // in code" - and the failure is invisible until someone clicks a menu entry
  // and lands on the homepage. Falling back to the public origin means the
  // build gets the real list either way.
  const origins = [
    process.env.BUILD_API_ORIGIN?.replace(/\/$/, ""),
    "http://localhost:4000",
    SITE_URL,
  ].filter((o): o is string => Boolean(o));

  return [...new Set(origins)].map((o) => `${o}${API_BASE}/departments?_build=${BUILD_STAMP}`);
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
  cmsDepartmentsPromise ??= (async () => {
    const endpoints = cmsEndpoints();
    const failures: string[] = [];

    for (const endpoint of endpoints) {
      try {
        // `force-cache`, NOT `no-store`. Under output: "export" the route is
        // effectively `dynamic = "error"`, and a no-store fetch marks the
        // render dynamic - Next then refuses to render it statically and the
        // lookup fails every time with "couldn't be rendered statically".
        // Caching is right here anyway: this runs once at build, and the
        // result is baked into the HTML.
        const res = await fetch(endpoint, {
          signal: AbortSignal.timeout(CMS_LOOKUP_TIMEOUT_MS),
          cache: "force-cache",
        });
        if (!res.ok) {
          failures.push(`${endpoint} -> HTTP ${res.status}`);
          continue;
        }
        const list = (await res.json()) as CmsDepartmentRecord[];
        if (!Array.isArray(list) || list.length === 0) {
          failures.push(`${endpoint} -> empty or unexpected response`);
          continue;
        }
        // Said out loud on success too. Silence used to mean either "it
        // worked" or "it quietly did not", and the difference only showed up
        // later as a menu entry leading to the homepage.
        console.log(`[departments] ${list.length} departments from ${endpoint}`);
        return new Map(list.map((d) => [d.slug, d]));
      } catch (err: unknown) {
        // "timed out" and "connection refused" call for very different fixes,
        // so the reason is kept rather than collapsed into "failed".
        failures.push(
          `${endpoint} -> ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`,
        );
      }
    }

    // Loud, and specific about the consequence: this is the state where a
    // department that exists in the CMS gets no page, its menu entry lands on
    // the homepage, and nothing else reports a problem.
    console.warn(
      `
[departments] ================= CMS LOOKUP FAILED =================
` +
        `[departments] Building ONLY the departments defined in code.
` +
        `[departments] Any department created in the CMS will have NO PAGE in
` +
        `[departments] this build, and its menu entry will open the homepage.
` +
        failures.map((f) => `[departments]   tried ${f}
`).join("") +
        `[departments] Fix the API and rebuild, or set BUILD_API_ORIGIN.
` +
        `[departments] =====================================================
`,
    );
    return new Map<string, CmsDepartmentRecord>();
  })();

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
  const slugs = [...all.values()]
    .filter((d) => d.slug && d.isActive !== false && !OFFICE_SLUGS.has(d.slug.trim().toLowerCase()))
    // Through the alias map, or the CMS's "mechanical" would be built beside
    // the site's own "mech": the same department at two URLs, with the same
    // title and description, each canonicalising to itself.
    .map((d) => canonicalDepartmentSlug(d.slug));
  return [...new Set(slugs)];
}
