"use client"

import { getCommitteesPublic, Committee } from "@/lib/committees-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The institution's Governing Body, on the About page.
 *
 * Every member comes from the CMS - Admin -> Committees, any committee filed
 * under the "Governing Body" type - so the college adds, edits, reorders and
 * removes members itself without this file changing. Selection is on the
 * committee's TYPE rather than its name, so renaming the committee in the CMS
 * cannot silently empty this section.
 *
 * Renders nothing at all until members exist, rather than an empty heading
 * over a blank space: an absent section reads as "not published yet", an
 * empty one reads as broken.
 */
export default function GoverningBody() {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesPublic("GOVERNING_BODY").catch(() => [] as Committee[]),
    [],
  )

  // Usually one committee, but the type allows several (e.g. a Board and a
  // Finance Committee filed together); each keeps its own heading.
  const groups = (committees ?? [])
    .map((c) => ({ ...c, members: (c.members ?? []).filter((m) => m.isActive !== false) }))
    .filter((c) => c.members.length > 0)

  if (groups.length === 0) return null

  return (
    <section className="k-section" id="governing-body">
      <div className="k-container">
        <style>{`
          .k-gb-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #eef0f3; border-radius: 10px; overflow: hidden; }
          .k-gb-table thead th { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); color: #fff; text-align: left; padding: 14px 18px; font-family: 'Rajdhani', sans-serif; font-size: 13.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
          .k-gb-table tbody td { padding: 13px 18px; border-bottom: 1px solid #eef0f3; color: #555; font-size: 15px; vertical-align: top; }
          .k-gb-table tbody tr:last-child td { border-bottom: none; }
          .k-gb-name { color: #1a1a2e; font-weight: 600; }
          .k-gb-role { color: #2B3490; font-weight: 600; white-space: nowrap; }
          .k-gb-no { color: #999; width: 44px; }
          .k-gb-desc { color: #666; font-size: 15px; line-height: 1.7; margin: 0 0 20px; max-width: 1100px; }
          .k-gb-sub { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #2B3490; margin: 28px 0 12px; }
          /* Below 700px the four columns crush; the table scrolls instead of wrapping mid-name. */
          .k-gb-scroll { overflow-x: auto; }
          @media (max-width: 700px) { .k-gb-table { min-width: 560px; } }
        `}</style>

        <h2>Governing Body</h2>

        {groups.map((c, gi) => (
          <div key={c.id}>
            {/* Only name the committee when there is more than one, so the
                common single-committee case does not repeat the heading. */}
            {groups.length > 1 && <h3 className="k-gb-sub">{c.name}</h3>}
            {c.description && (gi === 0 || groups.length > 1) && (
              <p className="k-gb-desc">{c.description}</p>
            )}
            <div className="k-gb-scroll">
              <table className="k-gb-table">
                <thead>
                  <tr>
                    <th className="k-gb-no">#</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {c.members.map((m, i) => (
                    <tr key={m.id}>
                      <td className="k-gb-no">{i + 1}</td>
                      <td className="k-gb-name">{m.name}</td>
                      <td>{m.designation}</td>
                      <td className="k-gb-role">{m.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
