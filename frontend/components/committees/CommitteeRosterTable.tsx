/**
 * The Name / Designation / Role table a committee roster is shown as.
 *
 * Pure presentation, no fetching - shared by CommitteeRoster (one committee
 * selected by type) and PlacedCommittees (every committee pointed at a page).
 * The rows arrive in the order the caller got them from the API, which is the
 * CMS drag order; nothing here re-sorts.
 *
 * overflow-x on the wrapper, not overflow:hidden - a three-column table still
 * outgrows a phone, and hidden clips the Role column off the screen entirely.
 */

export interface RosterRow {
  name: string;
  designation: string;
  role: string;
}

const cell: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #eef0f3",
  color: "#555",
};

export default function CommitteeRosterTable({ rows }: { rows: RosterRow[] }) {
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
          {rows.map((r, i) => (
            <tr key={`${r.name}-${i}`} style={{ background: i % 2 === 0 ? "#f4f3ef" : "transparent" }}>
              <td style={{ ...cell, fontWeight: 600 }}>{r.name}</td>
              <td style={cell}>{r.designation}</td>
              <td style={{ ...cell, color: "#2B3490", fontWeight: 700 }}>{r.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
