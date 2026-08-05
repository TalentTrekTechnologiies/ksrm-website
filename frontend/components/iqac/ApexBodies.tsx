"use client"

import { useState } from "react"
import { getCommitteesPublic, Committee, CommitteeMember } from "@/lib/committees-api"
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

/** Rows shown before the "Show all" toggle. The Academic Council alone runs to
 *  22 members, and three such lists in full buried the page. */
const PREVIEW = 4

/** Office-bearers first, then everyone else in the order the CMS holds them. */
const RANK = ["chairperson", "chairman", "convener", "convenor", "coordinator", "member secretary"]
function rankOf(role: string) {
  const r = (role || "").trim().toLowerCase()
  const i = RANK.findIndex((x) => r.includes(x))
  return i === -1 ? RANK.length : i
}

function BodyCard({ icon, name, committee }: { icon: string; name: string; committee?: Committee }) {
  const [expanded, setExpanded] = useState(false)

  const members: CommitteeMember[] = [...(committee?.members ?? [])].sort(
    (a, b) => rankOf(a.role) - rankOf(b.role) || a.sortOrder - b.sortOrder,
  )
  const overflowing = members.length > PREVIEW
  const shown = expanded || !overflowing ? members : members.slice(0, PREVIEW)

  return (
    <div className="ab-card">
      <div className="ab-head">
        <span className="ab-icon">{icon}</span>
        <div>
          <div className="ab-name">{name}</div>
          {members.length > 0 && (
            <div className="ab-count">
              {members.length} member{members.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
      </div>

      {members.length === 0 ? (
        <p className="ab-empty">Members will be published here shortly.</p>
      ) : (
        <>
          <ul className="ab-list">
            {shown.map((m) => (
              <li key={m.id}>
                <span className="ab-member">{m.name}</span>
                <span className="ab-meta">
                  <span className="ab-role">{m.role}</span>
                  {m.designation && <span className="ab-desig">{m.designation}</span>}
                </span>
              </li>
            ))}
          </ul>
          {overflowing && (
            <button type="button" className="ab-more" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less ↑" : `Show all ${members.length} members ↓`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default function ApexBodies() {
  const committees = useLiveData<Committee[]>(
    () => getCommitteesPublic().catch(() => [] as Committee[]),
    [],
  )

  // null means "not fetched yet", which is what both the server render and the
  // first client render see. Treating that as "empty" would print "members
  // will be published shortly" on every load and then swap it for the real
  // list a moment later.
  const loading = committees === null

  const find = (name: string) =>
    (committees ?? []).find(
      (c) => c.name.trim().toLowerCase() === name.toLowerCase() && (c.members?.length ?? 0) > 0,
    )

  return (
    <div className="ab-grid">
      <style>{`
        .ab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; align-items: start; }
        .ab-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; }
        .ab-head { display: flex; align-items: center; gap: 12px; padding-bottom: 14px; margin-bottom: 6px; border-bottom: 2px solid #FFE619; }
        .ab-icon { font-size: 24px; line-height: 1; }
        .ab-name { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #2B3490; line-height: 1.2; }
        .ab-count { font-size: 12.5px; color: #777; font-weight: 600; margin-top: 2px; }
        .ab-list { list-style: none; margin: 0; padding: 0; }
        .ab-list li { padding: 11px 0; border-bottom: 1px solid #f4f6f8; }
        .ab-list li:last-child { border-bottom: none; }
        .ab-member { display: block; font-size: 14.5px; font-weight: 600; color: #1a1a2e; line-height: 1.4; }
        .ab-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .ab-role { background: #eef1ff; color: #2B3490; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .ab-desig { font-size: 12.5px; color: #777; }
        .ab-more { margin-top: 12px; background: none; border: none; padding: 0; cursor: pointer;
                   color: #2B3490; font-size: 13px; font-weight: 700; font-family: inherit; }
        .ab-more:hover { text-decoration: underline; }
        .ab-empty { font-size: 14px; color: #888; margin: 12px 0 0; }
      `}</style>

      {BODIES.map((b) => (
        <BodyCard
          key={b.name}
          icon={b.icon}
          name={b.name}
          // While loading, pass nothing so the server render and the first
          // client render agree.
          committee={loading ? undefined : find(b.name)}
        />
      ))}
    </div>
  )
}
