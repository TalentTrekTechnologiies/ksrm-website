import ExamNotificationsList from "@/components/examinations/ExamNotificationsList";
import { mediaFile } from "@/lib/api-base";
import PageResources from "@/components/PageResources";

const calendarGroups = [
  {
    year: "AY 2025-26",
    items: [
      { title: "Academic Calendar – M.Tech I Semester AY 2025-26", date: "27-10-2025", href: mediaFile(183)},
      { title: "Academic Calendar – MBA I Year AY 2025-26", date: "30-08-2025", href: mediaFile(184)},
      { title: "Academic Calendar – B.Tech I Semester AY 2025-26", date: "30-08-2025", href: mediaFile(185)},
      { title: "Academic Calendar – B.Tech VII & VIII Semester AY 2025-26", date: "17-07-2025", href: mediaFile(187)},
      { title: "Academic Calendar – B.Tech V & VI Semester AY 2025-26", date: "17-07-2025", href: mediaFile(188)},
      { title: "Academic Calendar – B.Tech III & IV Semester AY 2025-26", date: "17-07-2025", href: mediaFile(189)},
      { title: "Academic Calendar – B.Tech Honour and Minor Degree AY 2025-26", date: "17-07-2025", href: mediaFile(190)},
    ],
  },
  {
    year: "AY 2024-25",
    items: [
      { title: "Revised Academic Calendar – M.Tech II Semester 2024-25", date: "05-05-2025", href: mediaFile(191)},
      { title: "Academic Calendar – M.Tech II, IV Semesters (R22PG) AY 2024-25", date: "20-12-2024", href: mediaFile(192)},
      { title: "Academic Calendar – B.Tech Even Semester Programs 2024-25", date: "20-12-2024", href: mediaFile(193)},
      { title: "Academic Calendar – B.Tech Odd Semester Programs 2024-25", date: "25-07-2024", href: mediaFile(195)},
    ],
  },
];

const timetables = [
  { title: "Timetable - B.Tech. VI Sem (R23UG) End Regular & Supple, April-May 2026", date: "10-04-2026", href: mediaFile(196)},
  { title: "Timetable - B.Tech. IV Sem (R23UG) End Regular & Supple, April-May 2026", date: "10-04-2026", href: mediaFile(197)},
  // NOTE: "B.Tech. VI Sem (R23UG) II Mid, April 2026" was removed - its file
  // 404s on the old site itself (confirmed dead at source, nothing to re-host).
  { title: "Timetable - B.Tech. IV Sem (R23UG) II Mid Examinations, April 2026", date: "10-04-2026", href: mediaFile(198)},
  { title: "Timetable - B.Tech. I Sem (R23UG) Supple End Examinations, Dec-2025", date: "29-11-2025", href: mediaFile(199)},
  { title: "Timetable - B.Tech. I Sem (R20UG) Supple End Examinations, Dec-2025", date: "29-11-2025", href: mediaFile(200)},
  { title: "Timetable - B.Tech. VIII Sem (R18UG) Supple End Examinations, Dec-2025", date: "27-11-2025", href: mediaFile(201)},
  { title: "Timetable - B.Tech. VI Sem (R20UG) Supple End Examinations, Dec-2025", date: "27-11-2025", href: mediaFile(203)},
];

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
        .exam-doc-row { display: flex; align-items: center; gap: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; margin-bottom: 8px; text-decoration: none; }
        .exam-list-row { display: flex; gap: 16px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
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

      <section id="calendars" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Academic Calendars</h2>
          {calendarGroups.map((g) => (
            <div key={g.year}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", borderLeft: "4px solid #D4A500", paddingLeft: 16, margin: "32px 0 16px" }}>{g.year}</div>
              {g.items.map((item) => (
                <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className="exam-doc-row">
                  <div style={{ background: "#eef1ff", width: 40, height: 40, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#2B3490", fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ color: "#999", fontSize: 12, marginTop: 2 }}>{item.date}</div>
                  </div>
                  <div style={{ color: "white", background: "#2B3490", padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>Download →</div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Admin-uploaded exam documents (grouped by AY heading), right after
          the hardcoded calendars so they read as one continuous list. */}
      <PageResources section="examinations" docsCategory="QUESTION_PAPER" docsTitle="More Exam Documents" background="#ffffff" />

      <section id="notifications" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Latest Notifications</h2>
          <ExamNotificationsList />
        </div>
      </section>

      <section id="timetables" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Exam Time Tables</h2>
          {timetables.map((t) => (
            <div className="exam-list-row" key={t.title}>
              <div style={{ minWidth: 90, fontSize: 12, color: "#999" }}>{t.date}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, color: "#2B3490", fontWeight: 500, lineHeight: 1.5 }}>{t.title}</div></div>
              <a href={t.href} target="_blank" rel="noopener noreferrer" style={{ color: "#2B3490", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", padding: "4px 12px", background: "white", borderRadius: 4 }}>View →</a>
            </div>
          ))}
        </div>
      </section>

      <section id="results" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Results &amp; Fee Payment</h2>
          <div className="exam-results-grid">
            <a href="https://www.jemexam.com/ksrmresult/results_notifications.php" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #2B3490, #1a1d4d)", borderRadius: 12, padding: 40, color: "white", textDecoration: "none" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <div style={{ color: "#D4A500", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Exam Results</div>
              <div style={{ color: "#ccc", fontSize: 15, lineHeight: 1.7, margin: "12px 0 24px" }}>Check B.Tech, M.Tech and MBA results on the KSRM results portal powered by JEM Exam.</div>
              <div style={{ background: "#D4A500", color: "#2B3490", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, display: "inline-block" }}>View Results →</div>
            </a>
            <div style={{ background: "#f9f9f9", border: "2px solid #D4A500", borderRadius: 12, padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
              <div style={{ color: "#2B3490", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Online Fee Payment</div>
              <div style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: "12px 0 24px" }}>Pay tuition and exam fee via SBI Collect or download the SBI Challan Form for offline payment.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="https://www.onlinesbi.sbi/sbicollect/icollecthome.htm" target="_blank" rel="noopener noreferrer" style={{ background: "#2B3490", color: "white", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "block", textAlign: "center" }}>Pay Online (SBI Collect)</a>
                <a href={mediaFile(204)} style={{ background: "white", color: "#2B3490", border: "2px solid #2B3490", padding: "14px 28px", borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: "none", display: "block", textAlign: "center" }}>Download Challan Form</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" style={{ padding: "80px 0", background: "#f4f3ef" }}>
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
