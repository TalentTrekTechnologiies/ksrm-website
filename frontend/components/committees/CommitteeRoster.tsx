"use client";

import { getCommitteesPublic, CommitteeType } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * A committee's membership, as a table.
 *
 * One component per page used to mean a committee type could be offered in
 * Admin -> Committees and then render nowhere - which is what happened to
 * Grievance Redressal: it saved perfectly well and appeared on no page.
 *
 * Rows come back already ordered by the backend (sortOrder, then id), which
 * is the order set by dragging in Admin -> Committees. Nothing here re-sorts
 * them; a page that did so would silently ignore that order.
 */

export interface RosterMember {
  name: string;
  designation: string;
  role: string;
}

export default function CommitteeRoster({
  type,
  fallback,
  emptyLabel = "The committee will be published here shortly.",
}: {
  type: CommitteeType;
  /** Shown only while the CMS holds no members for this type. */
  fallback?: RosterMember[];
  emptyLabel?: string;
}) {
  // Polled, so a change in the admin appears without a refresh. useLiveData
  // keeps the last good value rather than blanking the table on a failed poll.
  const members = useLiveData<RosterMember[]>(
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
    return (
      <p style={{ color: "#666", fontSize: 14, fontStyle: "italic", margin: 0 }}>{emptyLabel}</p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {["Name", "Designation", "Role"].map((h) => (
              <th
                key={h}
                style={{
                  background: "#2B3490",
                  color: "#fff",
                  padding: 14,
                  textAlign: "left",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((member, i) => (
            <tr key={`${member.name}-${i}`} style={{ background: i % 2 === 0 ? "#f4f3ef" : "transparent" }}>
              <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#555", fontWeight: 600 }}>
                {member.name}
              </td>
              <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#555" }}>
                {member.designation}
              </td>
              <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#2B3490", fontWeight: 700 }}>
                {member.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
