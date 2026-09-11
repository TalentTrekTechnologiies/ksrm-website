import { API_BASE } from "@/lib/api-base";
import { SITE_URL } from "@/lib/seo";

/**
 * The committees as the CMS knows them, read ONCE at build time.
 *
 * Every committee gets its own page and therefore its own URL, so the college
 * can cite one in a NAAC or NBA submission - "/committees/finance-committee"
 * rather than an anchor into a long shared page, which a reviewer cannot
 * bookmark and which breaks the moment the page is reordered.
 *
 * The site is a static export, so that set of pages is fixed when the build
 * runs. Same shape as lib/departments-build.ts, and for the same reason: a
 * committee created in the CMS must produce a page on the next build without
 * anyone editing code.
 */

const LOOKUP_TIMEOUT_MS = 4000;

/** Changes once per build, so a rebuild never replays a stale cached list. */
const BUILD_STAMP = Math.floor(Date.now() / 60_000);

export interface CmsCommitteeRecord {
  id: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

/** "Academic Council" -> "academic-council". Matches committeeAnchor exactly. */
export function committeeSlug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function endpoints(): string[] {
  if (/^https?:\/\//i.test(API_BASE)) return [`${API_BASE}/committees`];
  const origins = [
    process.env.BUILD_API_ORIGIN?.replace(/\/$/, ""),
    "http://localhost:4000",
    SITE_URL,
  ].filter((o): o is string => Boolean(o));
  return [...new Set(origins)].map((o) => `${o}${API_BASE}/committees?_build=${BUILD_STAMP}`);
}

let promise: Promise<CmsCommitteeRecord[]> | null = null;

export function loadCmsCommittees(): Promise<CmsCommitteeRecord[]> {
  promise ??= (async () => {
    const failures: string[] = [];
    for (const endpoint of endpoints()) {
      try {
        // force-cache, not no-store: under output "export" a no-store fetch
        // marks the render dynamic and the build refuses it.
        const res = await fetch(endpoint, {
          signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
          cache: "force-cache",
        });
        if (!res.ok) { failures.push(`${endpoint} -> HTTP ${res.status}`); continue; }
        const list = (await res.json()) as CmsCommitteeRecord[];
        if (!Array.isArray(list)) { failures.push(`${endpoint} -> unexpected response`); continue; }
        console.log(`[committees] ${list.length} committees from ${endpoint}`);
        return list;
      } catch (err: unknown) {
        failures.push(`${endpoint} -> ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`);
      }
    }
    console.warn(
      `[committees] CMS lookup failed - no committee pages will be built.\n` +
        failures.map((f) => `[committees]   tried ${f}\n`).join(""),
    );
    return [];
  })();
  return promise;
}

export async function cmsCommitteeSlugs(): Promise<string[]> {
  const all = await loadCmsCommittees();
  return [...new Set(all.filter((c) => c.isActive !== false).map((c) => committeeSlug(c.name)))].filter(Boolean);
}
