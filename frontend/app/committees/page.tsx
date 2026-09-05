"use client";

import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";
import CommitteeRosterTable from "@/components/committees/CommitteeRosterTable";
import { committeeAnchor } from "@/components/committees/NamedCommittees";
import CmsText from "@/components/CmsText";
import { getCommitteesPublic, Committee } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * Every institution committee the CMS holds, with its roster and its papers.
 *
 * Committees were already managed in the CMS but only surfaced where a
 * `placement` pointed them - About, IQAC, Grievance and so on - so a committee
 * with no placement rendered on no page at all. Four of the five the college
 * has today are in exactly that state. This lists all of them, so adding a
 * committee is enough to publish it.
 *
 * Order is the CMS drag order; nothing here re-sorts.
 */
export default function CommitteesPage() {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesPublic().catch(() => [] as Committee[]),
    [],
  );

  const live = (committees ?? []).filter((c) => c.isActive !== false);
  const momSection = (name: string) => `committees.${committeeAnchor(name)}`;

  return (
    <SimplePageShell
      section="committees"
      titleSlot="committees"
      taglineSlot="the-committees-that-govern-and"
      introSlot="k-s-r-m-college"
    >
      {live.map((committee) => {
        const members = (committee.members ?? []).filter((m) => m.isActive !== false);
        const anchor = committeeAnchor(committee.name);
        return (
          <section key={committee.id} id={anchor} style={{ marginBottom: 56, scrollMarginTop: 104 }}>
            <h2 className="sp-heading">{committee.name}</h2>
            {committee.description && (
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: "-16px 0 20px", maxWidth: 820 }}>
                {committee.description}
              </p>
            )}
            {members.length === 0 ? (
              <p style={{ color: "#666", fontSize: 15, fontStyle: "italic" }}>
                Members will be published here shortly.
              </p>
            ) : (
              <CommitteeRosterTable
                rows={members.map((m) => ({
                  name: m.name,
                  designation: m.designation,
                  role: m.role,
                }))}
              />
            )}
            <h3
              style={{
                color: "#2B3490",
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: 22,
                fontWeight: 700,
                margin: "28px 0 12px",
              }}
            >
              Minutes of Meetings
            </h3>
            <PageResources section={momSection(committee.name)} embedded maxVisible={8} />
          </section>
        );
      })}

      {/* Minutes, constitution orders and any other committee papers, uploaded
          in Admin -> Documents against "Committees". Renders nothing until
          something is uploaded, so the page never shows an empty heading. */}
      <h2 className="sp-heading" style={{ marginTop: 8 }}>
        <CmsText section="committees" slot="committee-documents" />
      </h2>
      <PageResources section="committees" embedded />
    </SimplePageShell>
  );
}
