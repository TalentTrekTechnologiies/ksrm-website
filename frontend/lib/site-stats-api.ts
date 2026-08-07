import { apiGet, apiPost } from "./api-client";

export interface SiteVisitStats {
  total: number;
  today: number;
}

/** Read-only - does not count as a visit. Used for the counter's periodic refresh. */
export function getSiteVisitStats(): Promise<SiteVisitStats> {
  return apiGet<SiteVisitStats>("/site-stats/visit");
}

/** Counts one visit. Call at most once per browser session (see VisitorCounter). */
export function recordSiteVisit(): Promise<SiteVisitStats> {
  return apiPost<SiteVisitStats>("/site-stats/visit");
}
