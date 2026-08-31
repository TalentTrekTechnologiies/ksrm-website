/**
 * Demo mode - the specimen build shown to prospective clients.
 *
 * The point of the specimen is to demonstrate the WORK: the design, the
 * navigation, the CMS-driven sections, the department pages. It is deliberately
 * NOT a copy of the college's live site, for three reasons that all bite later:
 *
 *  - the live site carries real people (the Correspondent, Chairman, Principal
 *    and every faculty member, with their photographs) and a document library
 *    that includes files titled with student roll numbers. Republishing those
 *    on a different host, under a different company's logo, is not ours to do.
 *  - a public copy of a real institution's site, branded as someone else, reads
 *    as impersonation however it is intended.
 *  - Google would index it as a duplicate of the client's own site and can
 *    demote the original for it.
 *
 * So the specimen keeps the structure and replaces the identity. The API data
 * is a recorded snapshot with every real name, photograph, email, phone number
 * and document scrubbed out (see scripts/demo/record-api.mjs), which is what
 * lets it run with no backend at all - it is a static bundle end to end.
 *
 * Turned on at build time with NEXT_PUBLIC_DEMO=1. Off, every line here is
 * dead and the production build is byte-identical to what it was.
 */

export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

/**
 * The specimen's identity. One place, so renaming it is one edit.
 *
 * Named for the agency rather than an invented college on purpose: a plausible
 * but fictitious college name invites the question "is this a real client?",
 * and any name convincing enough to demo with risks colliding with a real
 * institution. This one cannot be mistaken for anybody.
 */
export const DEMO_BRAND = {
  /** Full institution name, as it appears in headings and page titles. */
  name: "Talent Trek Technologies",
  /** Short form, as it appears in the top bar and breadcrumbs. */
  shortName: "Talent Trek",
  /** The agency this specimen belongs to. */
  company: "Talent Trek Technologies",
  tagline: "Trusting the Talent is Treasure",
  logo: "/demo/talenttrek-logo.png",
  /** Shown in the corner of every page so a screenshot can never be mistaken
   *  for a live college site. */
  ribbon: "DEMO",
} as const;

type Snapshot = Record<string, unknown>;

let snapshotPromise: Promise<Snapshot> | null = null;

/**
 * The recorded API, loaded once and shared by every caller.
 *
 * Keyed by the exact request path the site asks for, query string included -
 * "/downloads?pageSection=iqac.minutes" is its own entry. Recording whole
 * responses rather than reimplementing the backend's filtering means the
 * specimen cannot drift from how the real site behaves: whatever the pages
 * asked for, that is what was captured.
 */
function loadSnapshot(): Promise<Snapshot> {
  snapshotPromise ??= fetch("/demo/api-snapshot.json")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return snapshotPromise;
}

/**
 * Looks a request up in the snapshot.
 *
 * Falls back to the path without its query string, then to an empty list, so a
 * page that asks for something never recorded renders as "nothing published
 * yet" rather than throwing. A specimen that shows an error dialog is worse
 * than one with a quiet gap in it.
 */
export async function demoFetch<T>(path: string): Promise<T> {
  const snapshot = await loadSnapshot();
  if (path in snapshot) return snapshot[path] as T;

  const withoutQuery = path.split("?")[0];
  if (withoutQuery in snapshot) return snapshot[withoutQuery] as T;

  return [] as unknown as T;
}
