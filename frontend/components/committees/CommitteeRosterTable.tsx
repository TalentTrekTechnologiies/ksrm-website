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
  /** Shown as its own column, but only when at least one row has one - a
   *  roster that does not publish departments keeps three columns. */
  department?: string | null;
  contact?: string | null;
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
  // Columns are shown only when something fills them, so a roster that
  // publishes neither keeps the three it always had rather than gaining two
  // empty ones.
  const hasDepartment = rows.some((r) => r.department?.trim());
  const hasContact = rows.some((r) => r.contact?.trim());
  const headings = [
    "Name",
    "Designation",
    ...(hasDepartment ? ["Dept."] : []),
    "Role",
    ...(hasContact ? ["Contact"] : []),
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {headings.map((h) => (
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
              {hasDepartment && <td style={cell}>{r.department ?? ""}</td>}
              <td style={{ ...cell, color: "#2B3490", fontWeight: 700 }}>{r.role}</td>
              {hasContact && (
                <td style={cell}>
                  {/* Dialable on a phone, which is the point of publishing it
                      on a cell people are meant to contact. */}
                  {r.contact ? (
                    <a href={`tel:${r.contact.replace(/[^\d+]/g, "")}`} style={{ color: "#2B3490", textDecoration: "none" }}>
                      {r.contact}
                    </a>
                  ) : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
