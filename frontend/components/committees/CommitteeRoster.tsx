"use client";

import { getCommitteesPublic, CommitteeType } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";
import CommitteeRosterTable, { RosterRow } from "./CommitteeRosterTable";

/**
 * One committee's membership, selected by type.
 *
 * Use this where a page has a section built for a specific committee - the
 * Anti-Ragging page, the Grievance page. For a committee the admin points at
 * a page themselves, use PlacedCommittees instead.
 *
 * One component per page used to mean a committee type could be offered in
 * Admin -> Committees and then render nowhere - which is what happened to
 * Grievance Redressal: it saved perfectly well and appeared on no page.
 *
 * Rows come back already ordered by the backend (sortOrder, then id), which
 * is the order set by dragging in Admin -> Committees. Nothing here re-sorts
 * them; a page that did so would silently ignore that order.
 */
export default function CommitteeRoster({
  type,
  fallback,
  emptyLabel = "The committee will be published here shortly.",
}: {
  type: CommitteeType;
  /** Shown only while the CMS holds no members for this type. */
  fallback?: RosterRow[];
  emptyLabel?: string;
}) {
  // Polled, so a change in the admin appears without a refresh. useLiveData
  // keeps the last good value rather than blanking the table on a failed poll.
  const members = useLiveData<RosterRow[]>(
    () =>
      getCommitteesPublic(type)
        .then((committees) =>
          committees
            .flatMap((c) => c.members)
            .filter((m) => m.isActive)
            .map((m) => ({ name: m.name, designation: m.designation, role: m.role })),
        )
        .catch(() => fallback ?? []),
    [type],
    { initialValue: fallback ?? [] },
  );

  const rows = members === null || members.length === 0 ? (fallback ?? []) : members;

  if (rows.length === 0) {
    return <p style={{ color: "#666", fontSize: 14, fontStyle: "italic", margin: 0 }}>{emptyLabel}</p>;
  }

  return <CommitteeRosterTable rows={rows} />;
}
