"use client"

import { getCommitteesPublic, Committee } from "@/lib/committees-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The institution's apex bodies, on the IQAC page.
 *
 * These were three links out to the old site's gbody.php / academiccouncil.php
 * / financial.php, so a visitor researching governance left the new site
 * entirely. Each is now a committee in the CMS (Admin -> Committees), listed
 * here with its members.
 *
 * Nothing here links back to the old site. A body whose committee has not been
 * entered yet says so plainly and fills itself in the moment members are added
 * in Admin -> Committees.
 */

const BODIES = [
  { icon: "🏛️", name: "Governing Body" },
  { icon: "🎓", name: "Academic Council" },
  { icon: "💰", name: "Finance Committee" },
]

export default function ApexBodies() {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesPublic().catch(() => [] as Committee[]),
    [],
  )

  // null means "not fetched yet", which is what both the server render and the
  // first client render see. Treating that as "empty" would print "members
  // will be published shortly" on every single load and then swap it for the
  // real list a moment later - a visible flash, and the kind of server/client
  // divergence that produces a hydration mismatch.
  const loading = committees === null

  const find = (name: string) =>
    (committees ?? []).find(
      (c) => c.name.trim().toLowerCase() === name.toLowerCase() && (c.members?.length ?? 0) > 0,
    )

  return (
    <div className="iqac-apex-wrap">
      <style>{`
        .iqac-apex-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .iqac-apex-body { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; }
        .iqac-apex-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .iqac-apex-name { font-size: 20px; font-weight: 700; color: #2B3490; }
        .iqac-apex-count { font-size: 12.5px; color: #666; font-weight: 600; }
        .iqac-apex-list { margin: 0; padding: 0; list-style: none; }
        .iqac-apex-list li { padding: 9px 0; border-bottom: 1px solid #f1f3f6; font-size: 14.5px; color: #444; }
        .iqac-apex-list li:last-child { border-bottom: none; }
        .iqac-apex-role { display: block; font-size: 12.5px; color: #2B3490; font-weight: 600; }
        .iqac-apex-empty { font-size: 14px; color: #777; margin: 0; }
        .iqac-apex-empty a { color: #2B3490; font-weight: 600; }
      `}</style>

      {BODIES.map((b) => {
        const committee = find(b.name)
        return (
          <div className="iqac-apex-body" key={b.name}>
            <div className="iqac-apex-head">
              <span style={{ fontSize: 22, lineHeight: 1 }}>{b.icon}</span>
              <div>
                <div className="iqac-apex-name">{b.name}</div>
                {committee && (
                  <div className="iqac-apex-count">
                    {committee.members.length} member{committee.members.length === 1 ? "" : "s"}
                  </div>
                )}
              </div>
            </div>

            {committee ? (
              <ul className="iqac-apex-list">
                {committee.members.map((m) => (
                  <li key={m.id}>
                    {m.name}
                    <span className="iqac-apex-role">
                      {m.role}
                      {m.designation ? ` · ${m.designation}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : loading ? (
              <p className="iqac-apex-empty">&nbsp;</p>
            ) : (
              <p className="iqac-apex-empty">Members will be published here shortly.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
