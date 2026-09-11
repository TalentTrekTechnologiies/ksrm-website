"use client";

import Link from "next/link";
import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";
import CommitteeRosterTable from "@/components/committees/CommitteeRosterTable";
import { committeeAnchor } from "@/components/committees/NamedCommittees";
import { getCommitteesPublic, Committee } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * One committee: who is on it, and its minutes.
 *
 * Minutes are ordinary documents filed against the "Committees" page section
 * with this committee's NAME as the group heading. That needs no new table and
 * no migration - and it means the year grouping the documents already have
 * applies here too, so each year's minutes fold away on their own as the next
 * year's arrive. Which is exactly what the college asked for: minutes change
 * every year and last year's should not crowd the page.
 *
 * The roster is fetched live rather than baked in, so adding a member in the
 * CMS shows up without a rebuild. The name and description come from the build
 * as a fallback, so the page has a heading before any JavaScript runs.
 */
export default function CommitteePage({
  slug,
  fallbackName,
  fallbackDescription,
}: {
  slug: string;
  fallbackName: string;
  fallbackDescription: string | null;
}) {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesPublic().catch(() => [] as Committee[]),
    [],
  );

  const committee =
    (committees ?? []).find((c) => c.isActive !== false && committeeAnchor(c.name) === slug) ?? null;

  const name = committee?.name || fallbackName;
  const description = committee?.description ?? fallbackDescription;
  const members = (committee?.members ?? []).filter((m) => m.isActive !== false);

  return (
    <SimplePageShell
      section="committees"
      titleSlot="committees"
      taglineSlot="the-committees-that-govern-and"
      overrideTitle={name}
      overrideTagline={description ?? undefined}
    >
      <p style={{ margin: "0 0 28px" }}>
        <Link href="/committees" style={{ color: "#2B3490", fontWeight: 600, textDecoration: "none", fontSize: 15 }}>
          ← All committees
        </Link>
      </p>

      {members.length > 0 && (
        <div style={{ marginBottom: 44 }}>
          <h2 className="sp-heading">Members</h2>
          <CommitteeRosterTable
            rows={members.map((m) => ({ name: m.name, designation: m.designation, role: m.role }))}
          />
        </div>
      )}

      <h2 className="sp-heading">Minutes of Meetings</h2>
      {/* This committee's own document section, the same one the index page
          reads - so a paper uploaded once appears in both places. Minutes are
          grouped by academic year like every other document, so last year's
          fold away on their own as this year's arrive. */}
      <PageResources section={`committees.${slug}`} embedded maxVisible={20} />
    </SimplePageShell>
  );
}
