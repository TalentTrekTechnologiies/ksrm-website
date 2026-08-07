import { apiGet, apiPost } from "./api-client";

export type SiteStatsRange = "today" | "yesterday" | "7d";

export interface SiteStatsSummary {
  visits: number;
  hits: number;
}

/** Call once per browser tab session. Returns today's running totals. */
export function recordSiteVisit(): Promise<SiteStatsSummary> {
  return apiPost<SiteStatsSummary>("/site-stats/visit");
}

/** Call on every page load/navigation. Returns today's running totals. */
export function recordSiteHit(): Promise<SiteStatsSummary> {
  return apiPost<SiteStatsSummary>("/site-stats/hit");
}

/** Read-only - safe to poll. */
export function getSiteStatsSummary(range: SiteStatsRange): Promise<SiteStatsSummary> {
  return apiGet<SiteStatsSummary>(`/site-stats/summary?range=${range}`);
}

/** Upserts this tab's presence row; returns the current live count. Call
 * once on mount and then on an interval for as long as the tab stays open. */
export function sendHeartbeat(id: string): Promise<{ live: number }> {
  return apiPost<{ live: number }>("/site-stats/heartbeat", { id });
}

/** Read-only - safe to poll. */
export function getLiveCount(): Promise<{ live: number }> {
  return apiGet<{ live: number }>("/site-stats/live");
}
