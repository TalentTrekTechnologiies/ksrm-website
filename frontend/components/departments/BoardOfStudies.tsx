"use client";

import { getCommitteesByDepartment, Committee } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";
import CommitteeRosterTable from "@/components/committees/CommitteeRosterTable";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import { resolveFileUrl } from "@/lib/api-base";

/**
 * A department's Board of Studies, on its own page.
 *
 * The BoS is a committee like any other, so it is maintained in
 * Admin -> Committees: create one of type "Board of Studies", pick the
 * department it belongs to, and add its members. Nothing here needs changing
 * to give a department a BoS, and no department is hardcoded.
 *
 * Selected by type AND department, not by name: every department's committee
 * is called "Board of Studies", and selecting on the name would mean a rename
 * in the CMS silently empties the section.
 *
 * Renders nothing at all until a BoS exists for the department, rather than an
 * empty heading - an absent section reads as "not published yet", an empty one
 * reads as broken. The heading appears the moment members are added.
 */
export default function BoardOfStudies({ departmentId }: { departmentId: number | null }) {
  const committees = useLiveData<Committee[]>(
    () =>
      departmentId === null
        ? Promise.resolve([] as Committee[])
        : getCommitteesByDepartment(departmentId, "BOARD_OF_STUDIES").catch(
            () => [] as Committee[],
          ),
    [departmentId],
  );

  // Minutes, agendas and resolutions, uploaded on the department's Board of
  // Studies tab. Fetched separately from the members because the two are
  // maintained in different places - the roster in Committees, the papers in
  // the department workspace - and a department may well have one without the
  // other for a while.
  const papers = useLiveData<Download[]>(
    () =>
      departmentId === null
        ? Promise.resolve([] as Download[])
        : getDownloadsPublic(undefined, departmentId)
            .then((all) => all.filter((d) => d.pageSection === "board-of-studies"))
            .catch(() => [] as Download[]),
    [departmentId],
  );
  const docs = papers ?? [];

  // The department id is resolved from the API a moment after the page loads,
  // so null here means "not known yet" as much as it means "no department".
  const boards = (committees ?? [])
    .map((c) => ({ ...c, members: (c.members ?? []).filter((m) => m.isActive !== false) }))
    .filter((c) => c.members.length > 0);

  // Shown when there is either a roster or a paper - a department that has
  // published its minutes but not yet entered its members should not have the
  // section vanish, and vice versa.
  if (boards.length === 0 && docs.length === 0) return null;

  return (
    <section id="board-of-studies" style={{ padding: "72px 0", background: "#ffffff" }}>
      <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
        <h2
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 800,
            fontFamily: "var(--font-rajdhani), sans-serif",
            color: "#2B3490",
            margin: "0 0 8px",
          }}
        >
          Board of Studies
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 24 }}>
          {boards.map((c) => (
            <div key={c.id}>
              {/* Only name the committee when there is more than one, so the
                  usual single-board case does not repeat the heading. */}
              {boards.length > 1 && (
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2B3490",
                    margin: "0 0 6px",
                  }}
                >
                  {c.name}
                </h3>
              )}
              {c.description && (
                <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: "0 0 14px", maxWidth: 900 }}>
                  {c.description}
                </p>
              )}
              <CommitteeRosterTable
                rows={c.members.map((m) => ({
                  name: m.name,
                  designation: m.designation,
                  role: m.role,
                }))}
              />
            </div>
          ))}
        </div>

        {docs.length > 0 && (
          <div style={{ marginTop: boards.length > 0 ? 36 : 20 }}>
            <h3
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#2B3490",
                margin: "0 0 14px",
              }}
            >
              Minutes &amp; Agendas
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {docs.map((d) => (
                <a
                  key={d.id}
                  href={resolveFileUrl(d.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    background: "#f7f8fa",
                    border: "1px solid #eef0f3",
                    borderRadius: 8,
                    padding: "14px 16px",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: "#1a1a2e" }}>
                    {d.title}
                  </span>
                  {d.description && (
                    <span style={{ display: "block", fontSize: 13, color: "#666", marginTop: 3 }}>
                      {d.description}
                    </span>
                  )}
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#2B3490", marginTop: 6 }}>
                    Open →
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
