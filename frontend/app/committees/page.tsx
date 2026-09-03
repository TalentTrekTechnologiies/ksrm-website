"use client";

import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";
import CommitteeRosterTable from "@/components/committees/CommitteeRosterTable";
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

  return (
    <SimplePageShell
      section="committees"
      titleSlot="committees"
      taglineSlot="the-committees-that-govern-and"
      introSlot="k-s-r-m-college"
    >
      {live.map((committee) => {
        const members = (committee.members ?? []).filter((m) => m.isActive !== false);
        if (members.length === 0) return null;
        return (
          <div key={committee.id} style={{ marginBottom: 48 }}>
            <h2 className="sp-heading">{committee.name}</h2>
            {committee.description && (
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: "-16px 0 20px", maxWidth: 820 }}>
                {committee.description}
              </p>
            )}
            <CommitteeRosterTable
              rows={members.map((m) => ({
                name: m.name,
                designation: m.designation,
                role: m.role,
              }))}
            />
          </div>
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
