"use client";

import { getCommitteesByPlacement, Committee } from "@/lib/committees-api";
import { useLiveData } from "@/lib/use-live-data";

export interface CommitteeRow {
  name: string;
  dept: string;
  desig: string;
  role: string;
}

/**
 * The Library Committee table.
 *
 * The rows used to be eight fixed entries addressed by position -
 * committee.0.name and so on - so the wording could be edited but a member
 * could not be added, removed or reordered without a code change. They come
 * from Admin -> Committees now, with "Show on page" set to the Central Library
 * page, so the committee behaves like every other committee on the site.
 *
 * A client component of its own rather than a hook in the page: the library
 * page is a server component, and making the whole 670-line page client-side
 * to fetch one table would cost the rest of it its server rendering.
 *
 * The built-in list still shows while nothing has been entered, so the section
 * is never empty.
 */
export default function LibraryCommittee({ fallback }: { fallback: CommitteeRow[] }) {
  const cms = useLiveData<Committee[]>(
    () => getCommitteesByPlacement("LIBRARY").catch(() => [] as Committee[]),
    [],
  );

  const members = (cms ?? []).flatMap((c) => c.members ?? []);

  // The CMS holds name / designation / role. The table also shows a
  // department, taken from the designation when it is written
  // "Assistant Professor, CE" - and left blank rather than guessed otherwise.
  const rows: CommitteeRow[] = members.length
    ? members.map((m) => {
        const [desig, dept] = m.designation.split(",").map((x) => x.trim());
        return { name: m.name, dept: dept ?? "", desig: desig ?? m.designation, role: m.role };
      })
    : fallback;

  return (
    <>
      {rows.map((c, i) => (
        <tr key={`${c.name}-${i}`}>
          <td>{String(i + 1).padStart(2, "0")}</td>
          <td>{c.name}</td>
          <td>{c.dept}</td>
          <td>{c.desig}</td>
          <td>{c.role}</td>
        </tr>
      ))}
    </>
  );
}
