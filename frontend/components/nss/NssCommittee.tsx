"use client";

import { getCommitteesByPlacement, Committee } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * The NSS programme committee table.
 *
 * Comes from Admin -> Committees with "Show on page" set to the NSS page, so
 * it behaves like every other committee on the site - members can be added,
 * removed and reordered without a code change.
 *
 * A client component of its own rather than a hook in the page: the NSS page
 * is a server component, and making the whole page client-side to fetch one
 * table would cost the rest of it its server rendering. Same shape as
 * LibraryCommittee, deliberately.
 *
 * Renders nothing at all until the CMS has members, so the section never
 * appears as an empty table.
 */
export default function NssCommittee() {
  const cms = useLiveData<Committee[]>(
    () => getCommitteesByPlacement("NSS").catch(() => [] as Committee[]),
    [],
  );

  const members = (cms ?? []).flatMap((c) => c.members ?? []);
  if (members.length === 0) return null;

  // Styled inline rather than with the page's classes: the NSS page keeps its
  // CSS in its own <style> block, which this separate component cannot rely on
  // reaching. Only the heading reuses a class, matching the page's other
  // section titles.
  const cell: React.CSSProperties = {
    padding: "14px 16px",
    borderBottom: "1px solid #e6e8f0",
    textAlign: "left",
    verticalAlign: "top",
  };

  return (
    <section style={{ padding: "72px 0", background: "#ffffff" }}>
      <div className="responsive-container">
        <h2 className="nss-section-heading">NSS Committee</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
            <thead>
              <tr style={{ background: "#2B3490", color: "#fff" }}>
                <th style={{ ...cell, width: 70 }}>S.No.</th>
                <th style={cell}>Name &amp; Designation</th>
                <th style={{ ...cell, width: 140 }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id ?? `${m.name}-${i}`}>
                  <td style={cell}>{String(i + 1).padStart(2, "0")}</td>
                  <td style={cell}>
                    <strong>{m.name}</strong>
                    {m.designation ? (
                      <>
                        <br />
                        <span style={{ color: "#666", fontSize: 14 }}>{m.designation}</span>
                      </>
                    ) : null}
                  </td>
                  <td style={cell}>{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
