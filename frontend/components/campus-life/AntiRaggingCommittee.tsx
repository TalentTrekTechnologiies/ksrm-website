"use client";

import { getCommitteesPublic } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";

interface CommitteeMemberDisplay {
  name: string;
  designation: string;
  role: string;
}

const FALLBACK_COMMITTEE: CommitteeMemberDisplay[] = [
  { name: "Dr. [Principal Name]", designation: "Principal", role: "Chairman" },
  { name: "Dr. [Dean Name]", designation: "Dean of Student Affairs", role: "Convenor" },
  { name: "Mr. [Faculty Name]", designation: "Faculty Member", role: "Member" },
  { name: "Ms. [Faculty Name]", designation: "Faculty Member", role: "Member" },
  { name: "[Senior Student Name]", designation: "Senior Student Representative", role: "Member" },
];

export default function AntiRaggingCommittee() {
  // Polled, so a committee change in the admin appears without a refresh. On an
  // empty roster or a failed fetch the fallback committee stays - useLiveData
  // keeps the last good value rather than blanking the section.
  const committee =
    useLiveData<CommitteeMemberDisplay[]>(
      () =>
        getCommitteesPublic("ANTI_RAGGING").then((committees) => {
          const members = committees
            .flatMap((c) => c.members)
            .filter((m) => m.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
          if (members.length === 0) return FALLBACK_COMMITTEE
          return members.map((m) => ({ name: m.name, designation: m.designation, role: m.role }))
        }),
      [],
      { initialValue: FALLBACK_COMMITTEE },
    ) ?? FALLBACK_COMMITTEE;

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
          {committee.map((member, i) => (
            <tr
              key={member.name}
              style={{ background: i % 2 === 0 ? "#f4f3ef" : "transparent" }}
            >
              <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#555", fontWeight: 600 }}>
                {member.name}
              </td>
              <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef0f3", color: "#555" }}>
                {member.designation}
              </td>
              <td
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #eef0f3",
                  color: "#2B3490",
                  fontWeight: 700,
                }}
              >
                {member.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
