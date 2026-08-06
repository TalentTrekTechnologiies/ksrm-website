"use client";

import { getCommitteesPublic, Committee } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";
import CommitteeRosterTable from "./CommitteeRosterTable";

/**
 * Named governing bodies, each as its own anchored section.
 *
 * The Governing Body, Academic Council and Finance Committee used to sit on
 * the IQAC page under "Apex Bodies", three cards deep in a tabbed page - so a
 * visitor looking for the college's governance found it filed under quality
 * assurance. They belong on About, which is where the menu has always pointed.
 *
 * Anchored rather than grouped: About's menu jumps straight to a single body,
 * and Leadership sits between the Governing Body and the other two, so they
 * cannot be one contiguous block.
 *
 * Members come from Admin -> Committees, matched by name and shown in the
 * order they are dragged into there. A body with no committee record yet says
 * so plainly and fills itself in the moment members are added - the section
 * never disappears, because the menu links to it.
 */

/** "Academic Council" -> "academic-council", so the menu can link to it. */
export function committeeAnchor(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NamedCommittees({
  names,
  background = "#ffffff",
}: {
  /** Committee names exactly as they read in Admin -> Committees. */
  names: string[];
  background?: string;
}) {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesPublic().catch(() => [] as Committee[]),
    [],
  );

  // null means "not fetched yet" - what the server render and the first client
  // render both see. Treating it as empty would flash "will be published
  // shortly" on every load before the real roster arrives.
  const loading = committees === null;

  const find = (name: string) =>
    (committees ?? []).find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase());

  return (
    <>
      {names.map((name) => {
        const committee = loading ? undefined : find(name);
        const members = committee?.members ?? [];
        return (
          <section
            key={name}
            id={committeeAnchor(name)}
            className="k-section"
            style={{ background }}
          >
            <div className="k-container">
              <h2>{name}</h2>
              {committee?.description && (
                <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 900 }}>
                  {committee.description}
                </p>
              )}

              {members.length === 0 ? (
                <p style={{ color: "#666", fontSize: 15, fontStyle: "italic" }}>
                  {loading ? " " : "Members will be published here shortly."}
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#777", fontWeight: 600, margin: "0 0 12px" }}>
                    {members.length} member{members.length === 1 ? "" : "s"}
                  </p>
                  <CommitteeRosterTable
                    rows={members.map((m) => ({
                      name: m.name,
                      designation: m.designation,
                      role: m.role,
                    }))}
                  />
                </>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
