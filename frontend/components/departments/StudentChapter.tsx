"use client";

import { getCommitteesByDepartment, Committee } from "@/lib/committees-api";
import { getEventsPublic, EventItem } from "@/lib/events-api";
import { getDepartmentsPublic } from "@/lib/departments-api";
import { useLiveData } from "@/lib/use-live-data";
import CommitteeRosterTable from "@/components/committees/CommitteeRosterTable";

/**
 * A department's Student Professional Chapter (e.g. CSE's CSI chapter) -
 * its About text, committee and events.
 *
 * Its documents are NOT rendered here. This page already has a "Student
 * Chapter" activity-reports section further down (search this file for
 * chapterDocs) with richer rendering - inline photo previews for image
 * uploads - built before this component existed; fetching and rendering the
 * same pageSection again here would just show every document twice.
 *
 * Same shape as BoardOfStudies otherwise: the committee is an ordinary
 * committee (type "Student Chapter", this department), the events are
 * ordinary department-scoped events - each fetched independently, each
 * maintained on the admin screen that already owns that kind of content.
 *
 * Renders nothing until the chapter has an About paragraph, a committee or an
 * event, so a department with no chapter yet shows no half-built section.
 */
export default function StudentChapter({ departmentId }: { departmentId: number | null }) {
  const departments = useLiveData(
    () => (departmentId === null ? Promise.resolve([]) : getDepartmentsPublic().catch(() => [])),
    [departmentId],
  );
  const about = (departments ?? []).find((d) => d.id === departmentId)?.studentChapterAbout ?? "";

  const committees = useLiveData<Committee[]>(
    () =>
      departmentId === null
        ? Promise.resolve([] as Committee[])
        : getCommitteesByDepartment(departmentId, "STUDENT_CHAPTER").catch(() => [] as Committee[]),
    [departmentId],
  );
  const roster = (committees ?? [])
    .map((c) => ({ ...c, members: (c.members ?? []).filter((m) => m.isActive !== false) }))
    .filter((c) => c.members.length > 0);

  const events = useLiveData<EventItem[]>(
    () =>
      departmentId === null
        ? Promise.resolve([] as EventItem[])
        : getEventsPublic(departmentId).catch(() => [] as EventItem[]),
    [departmentId],
  );
  // Soonest-first for what is still ahead, then most-recent-first for what
  // has already happened - the same rule the homepage's Events panel uses,
  // for the same reason: a chapter page is as much a record of what it has
  // done as a notice of what is coming.
  const now = Date.now();
  const upcoming = (events ?? [])
    .filter((e) => new Date(e.eventDate).getTime() >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const past = (events ?? [])
    .filter((e) => new Date(e.eventDate).getTime() < now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  const eventRows = [...upcoming, ...past];

  if (!about && roster.length === 0 && eventRows.length === 0) return null;

  return (
    <section id="student-chapter" style={{ padding: "72px 0", background: "#f7f8fa" }}>
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
          Student Chapter
        </h2>

        {about && (
          <p style={{ fontSize: 15.5, color: "#555", lineHeight: 1.8, margin: "16px 0 0", maxWidth: 900, whiteSpace: "pre-line" }}>
            {about}
          </p>
        )}

        {roster.length > 0 && (
          <div style={{ marginTop: 32 }}>
            {roster.map((c) => (
              <div key={c.id} style={{ marginBottom: 24 }}>
                {roster.length > 1 && (
                  <h3 style={{ fontFamily: "var(--font-rajdhani), sans-serif", fontSize: 20, fontWeight: 700, color: "#2B3490", margin: "0 0 6px" }}>
                    {c.name}
                  </h3>
                )}
                {c.description && (
                  <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, margin: "0 0 14px", maxWidth: 900 }}>{c.description}</p>
                )}
                <CommitteeRosterTable rows={c.members.map((m) => ({ name: m.name, designation: m.designation, role: m.role }))} />
              </div>
            ))}
          </div>
        )}

        {eventRows.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h3 style={{ fontFamily: "var(--font-rajdhani), sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 14px" }}>
              Events
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {eventRows.map((e) => {
                const future = new Date(e.eventDate).getTime() >= now;
                return (
                  <div key={e.id} style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: 10, padding: "16px 18px" }}>
                    <span
                      style={{
                        display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: ".4px",
                        textTransform: "uppercase", color: future ? "#2B3490" : "#999", marginBottom: 6,
                      }}
                    >
                      {new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {future ? " · Upcoming" : ""}
                    </span>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e", margin: "0 0 4px" }}>{e.title}</p>
                    {e.location && <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{e.location}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(roster.length > 0 || eventRows.length > 0) && (
          <p style={{ fontSize: 13.5, color: "#888", marginTop: 32 }}>
            Activity reports and photos from this chapter are further down this page.
          </p>
        )}
      </div>
    </section>
  );
}
