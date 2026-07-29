import ExamNotificationsList from "@/components/examinations/ExamNotificationsList";
import { mediaFile } from "@/lib/api-base";
import PageResources from "@/components/PageResources";

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
];

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

      <section style={{ position: "relative", backgroundImage: "url('/banners/examinations.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#2B3490", padding: "80px 0", color: "white", minHeight: 320, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
          <div className="responsive-container">
            <div style={{ display: "inline-block", background: "#D4A500", color: "#2B3490", padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>📋 Examinations</div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}>Examination Portal</h1>
            <p style={{ fontSize: 20, fontWeight: 600, color: "#D4A500", margin: "0 0 16px" }}>K.S.R.M. College of Engineering (Autonomous)</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, maxWidth: 700, margin: 0 }}>
              Access academic calendars, exam timetables, notifications, results and all examination-related information.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 0", background: "white" }}>
        <div className="responsive-container">
          <div className="exam-quick-links">
            {quickLinks.map((q) => (
              <a key={q.label} href={q.href} target={q.external ? "_blank" : undefined} rel={q.external ? "noopener noreferrer" : undefined} className="exam-link-card">
                <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{q.icon}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: "#2B3490", lineHeight: 1.25 }}>{q.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications lead - they are the most time-sensitive thing a student
          comes here for. Fee payment / SBI sits lower down. */}
      <section id="notifications" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Latest Notifications</h2>
          <ExamNotificationsList />
          <PageResources section="examinations.notifications" embedded />
        </div>
      </section>

      <section id="calendars" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Academic Calendars</h2>
          {/* CMS-driven: Downloads routed to "Examinations → Academic Calendars",
              grouped by their AY heading, newest first. */}
          <PageResources section="examinations.calendars" embedded maxVisible={8} />
        </div>
      </section>

      <section id="timetables" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Exam Time Tables</h2>
          {/* CMS-driven: Downloads routed to "Examinations → Time Tables". */}
          <PageResources section="examinations.timetables" embedded maxVisible={8} />
        </div>
      </section>

      {/* Anything routed to Examinations generally (or any QUESTION_PAPER)
          still gets a catch-all block, so nothing an admin uploads is lost. */}
      <PageResources section="examinations" docsCategory="QUESTION_PAPER" docsTitle="More Exam Documents" background="#ffffff" />

      {/* Results & fee payment (SBI) sits low - it is a utility link-out, not
          what most visitors scan the page for. */}
      <section id="results" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Results &amp; Fee Payment</h2>
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
                <a href="https://www.onlinesbi.sbi/sbicollect/icollecthome.htm" target="_blank" rel="noopener noreferrer" style={{ background: "#2B3490", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "block", textAlign: "center" }}>Pay Online (SBI Collect)</a>
                <a href={mediaFile(204)} style={{ background: "white", color: "#2B3490", border: "2px solid #2B3490", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "block", textAlign: "center" }}>Download Challan Form</a>
              </div>
            </div>
          </div>
          {/* Result sheets uploaded from the admin (e.g. "Exam Results AY 2025-26")
              land here, grouped by their AY heading. */}
          <PageResources section="examinations.results" embedded />
        </div>
      </section>

      <section id="contact" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Contact Examination Cell</h2>
          <div style={{ maxWidth: 600, margin: "0 auto", border: "2px solid #D4A500", borderRadius: 12, padding: 40 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 8 }}>Controller of Examinations</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>K.S.R.M. College of Engineering (Autonomous)</div>
            <div style={{ fontSize: 16, color: "#444", fontWeight: 600, marginBottom: 24 }}>Dr. M. V. Ravi Kishore Reddy</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="tel:+918554233333" style={{ background: "rgba(255,230,25,0.1)", color: "#2B3490", padding: "12px 16px", borderRadius: 4, textDecoration: "none", fontWeight: 600, fontSize: 14, display: "flex", gap: 8 }}>
                <span>📞</span><span>+91-8554-233333 (Ext: 350)</span>
              </a>
              <a href="mailto:exams@ksrmce.ac.in" style={{ background: "rgba(255,230,25,0.1)", color: "#2B3490", padding: "12px 16px", borderRadius: 4, textDecoration: "none", fontWeight: 600, fontSize: 14, display: "flex", gap: 8 }}>
                <span>✉️</span><span>exams@ksrmce.ac.in</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
