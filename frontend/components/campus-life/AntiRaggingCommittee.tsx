"use client";

import { useEffect, useState } from "react";
import { getCommitteesPublic } from "@/lib/committees-api";

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
  const [committee, setCommittee] = useState<CommitteeMemberDisplay[]>(FALLBACK_COMMITTEE);

  useEffect(() => {
    let cancelled = false
    getCommitteesPublic("ANTI_RAGGING")
      .then((committees) => {
        if (cancelled) return
        const members = committees
          .flatMap((c) => c.members)
          .filter((m) => m.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        if (members.length === 0) return
        setCommittee(members.map((m) => ({ name: m.name, designation: m.designation, role: m.role })))
      })
      .catch(() => {
        // Network/API failure - fallback committee (already the initial state) stays.
      })
    return () => { cancelled = true }
  }, [])

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
