import ExamNotificationsList from "@/components/examinations/ExamNotificationsList";
import { mediaFile } from "@/lib/api-base";
import PageResources from "@/components/PageResources";
import ExamSectionStaff from "@/components/examinations/ExamSectionStaff";
import CoeContact from "@/components/examinations/CoeContact";
import CmsText from "@/components/CmsText";

// Academic Calendars and Time Tables used to be hardcoded here, which meant a
// code change to publish a new academic year. They now live in the CMS as
// Downloads routed to "Examinations → Academic Calendars" / "→ Time Tables"
// (grouped by AY heading) and render via <PageResources>, so the team can add
// AY 2026-27 and retire old entries from the admin.

const quickLinks = [
  { icon: "📅", label: "Academic Calendars", href: "#calendars" },
  { icon: "🔔", label: "Notifications", href: "#notifications" },
  { icon: "⏰", label: "Time Tables", href: "#timetables" },
  { icon: "📊", label: "Exam Results", href: "https://www.jemexam.com/ksrmresult/results_notifications.php", external: true },
  { icon: "💳", label: "SBI Challan Form", href: mediaFile(204), external: true},
  { icon: "📞", label: "Contact Exam Cell", href: "#contact" },
  { icon: "📘", label: "Syllabus", href: "/academics/syllabus" },
];

const EXAM_FALLBACK_SECTIONS = ["examinations"];
// Regex SOURCES, not RegExp objects: this is a server component and
// PageResources is a client one, so a compiled RegExp cannot cross that
// boundary - it fails the production build rather than degrading at runtime.
// PageResources compiles these case-insensitively.
const CALENDAR_TITLE = "calendar";
const TIMETABLE_TITLE = "time\\s*table|timetable";
const RESULT_TITLE = "result";
const QUESTION_PAPER_TITLE = "question\\s*paper|qp\\b";

export default function ExaminationsPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }
        .exam-quick-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(205px, 1fr)); gap: 12px; }
        @media (max-width: 640px) { .exam-quick-links { grid-template-columns: 1fr 1fr; gap: 10px; } }
        .exam-link-card { background: #f4f3ef; border: 1px solid #e5e7eb; border-radius: 10px; padding: 13px 16px; text-decoration: none; display: flex; align-items: center; gap: 11px; transition: background 0.15s, border-color 0.15s; }
        .exam-link-card:hover { background: #eef0fb; border-color: #2B3490; }
        .exam-results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        @media (max-width: 1024px) { .exam-results-grid { grid-template-columns: 1fr; gap: 24px; } }
      `}</style>

      <section style={{ position: "relative", backgroundImage: "url('/banners/examinations.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#2B3490", padding: "80px 0", color: "white", minHeight: 320, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
          <div className="responsive-container">
            <div style={{ display: "inline-block", background: "#D4A500", color: "#2B3490", padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>📋 Examinations</div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}><CmsText section="examinations" slot="examination-portal" /></h1>
            <p style={{ fontSize: 20, fontWeight: 600, color: "#D4A500", margin: "0 0 16px" }}><CmsText section="examinations" slot="k-s-r-m-college" /></p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, maxWidth: 700, margin: 0 }}><CmsText section="examinations" slot="access-academic-calendars-exam-timetables" multiline /></p>
          </div>
        </div>
      </section>

      {/* Examination Section staff - CMS-managed, shown up front. */}
      <ExamSectionStaff />


      <section style={{ padding: "40px 0", background: "white" }}>
        <div className="responsive-container">
          <div className="exam-quick-links">
            {quickLinks.map((q, _i) => (
              <a key={q.label} href={q.href} target={q.external ? "_blank" : undefined} rel={q.external ? "noopener noreferrer" : undefined} className="exam-link-card">
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{q.icon}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: "#2B3490", lineHeight: 1.25 }}><CmsText section="examinations" slot={`quickLinks.${_i}.label`} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications lead - they are the most time-sensitive thing a student
          comes here for. Fee payment / SBI sits lower down. */}
      <section id="notifications" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}><CmsText section="examinations" slot="latest-notifications" /></h2>
          <ExamNotificationsList />
          <PageResources section="examinations.notifications" embedded />
        </div>
      </section>

      <section id="calendars" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}><CmsText section="examinations" slot="academic-calendars" /></h2>
          {/* Entries added under Exam Notifications with type "Academic
              Calendar", grouped by academic year. The Downloads block below
              stays so anything uploaded the old way still shows. */}
          <ExamNotificationsList type="CALENDAR" hideEmpty />
          <PageResources
            section="examinations.calendars"
            embedded
            maxVisible={8}
            fallbackSections={EXAM_FALLBACK_SECTIONS}
            fallbackTitlePattern={CALENDAR_TITLE}
          />
        </div>
      </section>

      <section id="timetables" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}><CmsText section="examinations" slot="exam-time-tables" /></h2>
          <ExamNotificationsList type="TIMETABLE" hideEmpty />
          <PageResources
            section="examinations.timetables"
            embedded
            maxVisible={8}
            fallbackSections={EXAM_FALLBACK_SECTIONS}
            fallbackTitlePattern={TIMETABLE_TITLE}
          />
        </div>
      </section>

      {/* Examination rules and the student code of conduct.
          Its own section (not the catch-all) so conduct rules sit where
          students look for them, and deliberately WITHOUT a fallbackSections /
          fallbackTitlePattern pair: those cause a block to pull in documents
          routed elsewhere whose titles happen to match, which is how the other
          sections ended up mixing content. Only documents an admin explicitly
          routes to "Examinations -> Rules & Regulations" appear here. */}
      <section id="rules" style={{ padding: "80px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          {/* Plain text, matching the Syllabus section above. A <CmsText> here
              would render NOTHING until an admin happened to fill that slot -
              CmsText returns null when unset - leaving an empty <h2>. The
              editable content in this section is the documents themselves. */}
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 16, textAlign: "center" }}>
            Rules &amp; Regulations
          </h2>
          <p style={{ textAlign: "center", color: "#666", fontSize: 15, margin: "0 0 32px", maxWidth: 760, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
            Examination rules and the student code of conduct. Published by the Office of the
            Controller of Examinations.
          </p>
          {/* `embedded` keeps this inside the section above rather than opening
              its own. Note emptyText is deliberately omitted: PageResources
              ignores it when embedded, so it would be dead config - the
              paragraph above carries the section on its own until the first
              document is published. */}
          <PageResources section="examinations.rules" embedded maxVisible={8} />
        </div>
      </section>

      {/* Every SYLLABUS document, regardless of which page it was routed to -
          matches the inclusion the dedicated Syllabus page already uses, so a
          document uploaded once shows in both places without extra admin
          work. The branch/regulation breakdown only exists on the dedicated
          page, so this links there for anyone who wants that view. */}
      <section id="syllabus" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 16, textAlign: "center" }}>Syllabus</h2>
          <p style={{ textAlign: "center", margin: "0 0 32px" }}>
            <a href="/academics/syllabus" style={{ color: "#2B3490", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              View full branch &amp; regulation-wise syllabus →
            </a>
          </p>
          <PageResources section="examinations.syllabus" docsCategory="SYLLABUS" embedded maxVisible={8} />
        </div>
      </section>

      {/* Anything routed to Examinations generally (or any QUESTION_PAPER)
          still gets a catch-all block, so nothing an admin uploads is lost. */}
      <section id="question-papers" style={{ padding: "80px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Question Papers</h2>
          <ExamNotificationsList type="QUESTION_PAPER" hideEmpty />
          <PageResources
            section="examinations"
            docsCategory="QUESTION_PAPER"
            embedded
            maxVisible={8}
            fallbackSections={EXAM_FALLBACK_SECTIONS}
            fallbackTitlePattern={QUESTION_PAPER_TITLE}
          />
        </div>
      </section>

      <PageResources section="examinations" docsCategory="QUESTION_PAPER" docsTitle="More Exam Documents" background="#ffffff" />

      {/* Results & fee payment (SBI) sits low - it is a utility link-out, not
          what most visitors scan the page for. */}
      <section id="results" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}><CmsText section="examinations" slot="results-fee-payment" /></h2>
          <div className="exam-results-grid">
            <a href="https://www.jemexam.com/ksrmresult/results_notifications.php" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #2B3490, #1a1d4d)", borderRadius: 12, padding: 28, color: "white", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>📊</span>
                <span style={{ color: "#D4A500", fontSize: 22, fontWeight: 700 }}>Exam Results</span>
              </div>
              <div style={{ color: "#ccc", fontSize: 15, lineHeight: 1.7, margin: "12px 0 24px" }}>Check B.Tech, M.Tech and MBA results on the K.S.R.M. results portal powered by JEM Exam.</div>
              <div style={{ background: "#D4A500", color: "#2B3490", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, display: "inline-block" }}>View Results →</div>
            </a>
            <div style={{ background: "#f9f9f9", border: "2px solid #D4A500", borderRadius: 12, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>💳</span>
                <span style={{ color: "#2B3490", fontSize: 22, fontWeight: 700 }}>Online Fee Payment</span>
              </div>
              <div style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: "12px 0 24px" }}>Pay tuition and exam fee via SBI Collect or download the SBI Challan Form for offline payment.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="https://sbcollect.sbi.bank.in/sbicollect/icollecthome.htm" target="_blank" rel="noopener noreferrer" style={{ background: "#2B3490", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "block", textAlign: "center" }}>Pay Online (SBI Collect)</a>
                <a href={mediaFile(204)} style={{ background: "white", color: "#2B3490", border: "2px solid #2B3490", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "block", textAlign: "center" }}>Download Challan Form</a>
              </div>
            </div>
          </div>
          {/* Result sheets uploaded from the admin (e.g. "Exam Results AY 2025-26")
              land here, grouped by their AY heading. */}
          <ExamNotificationsList type="RESULT" hideEmpty />
          <PageResources
            section="examinations.results"
            embedded
            fallbackSections={EXAM_FALLBACK_SECTIONS}
            fallbackTitlePattern={RESULT_TITLE}
          />
        </div>
      </section>

      <section id="contact" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}><CmsText section="examinations" slot="contact-examination-cell" /></h2>
          <div style={{ maxWidth: 600, margin: "0 auto", border: "2px solid #D4A500", borderRadius: 12, padding: 40 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 8 }}>Controller of Examinations</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>K.S.R.M. College of Engineering (Autonomous)</div>
            <div style={{ fontSize: 16, color: "#444", fontWeight: 600, marginBottom: 24 }}>Dr. M. V. Ravi Kishore Reddy</div>
            <CoeContact />
          </div>
        </div>
      </section>

    
      </main>
  );
}
