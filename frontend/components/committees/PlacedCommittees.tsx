"use client";

import { getCommitteesByPlacement, Committee, CommitteePlacement } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";
import CommitteeRosterTable from "./CommitteeRosterTable";

/**
 * Every committee the CMS has pointed at this page, each with its roster.
 *
 * This block is what makes a new committee possible without a code change.
 * Before it, where a committee appeared was decided by its `type`, and each
 * type was wired to one hardcoded section - so an Internal Complaint
 * Committee, an SC/ST Cell or a Women's Empowerment Cell could only be saved
 * as OTHER, which rendered nowhere at all. Now the admin picks the page from
 * a dropdown and it shows up here.
 *
 * Renders nothing at all when no committee is pointed here, so dropping it
 * onto a page costs that page nothing until someone uses it - no empty
 * heading, no "coming soon" placeholder.
 *
 * Order is the CMS drag order; nothing here re-sorts.
 */
export default function PlacedCommittees({
  placement,
  heading,
}: {
  placement: CommitteePlacement;
  /** Shown above the group, only when there is something to show. */
  heading?: string;
}) {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesByPlacement(placement).catch(() => [] as Committee[]),
    [placement],
  );

  // null is "not fetched yet", which is what the server render and the first
  // client render both see. Treating it as empty is right here: the section
  // simply is not there until the data arrives.
  const withMembers = (committees ?? []).filter((c) => (c.members?.length ?? 0) > 0);

  if (withMembers.length === 0) return null;

  return (
    <section style={{ padding: "72px 0", background: "#ffffff" }}>
      <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
        {heading && (
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              fontFamily: "var(--font-rajdhani), sans-serif",
              color: "#2B3490",
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            {heading}
          </h2>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {withMembers.map((c) => (
            <div key={c.id}>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  color: "#2B3490",
                  margin: "0 0 6px",
                }}
              >
                {c.name}
              </h3>
              {c.description && (
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 14px", maxWidth: 900 }}>
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
      </div>
    </section>
  );
}
