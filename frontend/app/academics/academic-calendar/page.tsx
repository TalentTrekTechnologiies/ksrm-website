const calendars2025 = [
  { title: "B.Tech I Semester (R23UG)", reg: "R23UG" },
  { title: "B.Tech III & IV Semester (R23UG)", reg: "R23UG" },
  { title: "B.Tech V & VI Semester (R23UG)", reg: "R23UG" },
  { title: "B.Tech VII & VIII Semester (R23UG)", reg: "R23UG" },
  { title: "MBA I Year (R25)", reg: "R25" },
  { title: "M.Tech I Semester (R22PG)", reg: "R22PG" },
];

const calendars2024 = [
  { title: "B.Tech (R23UG / R20UG / R18UG)", reg: "Multiple" },
  { title: "M.Tech (R22PG / R18PG)", reg: "Multiple" },
  { title: "MBA (R19 / R25)", reg: "Multiple" },
];

const calendars2023 = [
  { title: "B.Tech (R20UG / R18UG / R15UG)", reg: "Multiple" },
  { title: "M.Tech (R18PG)", reg: "R18PG" },
];

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function YearSection({ year, rows }: { year: string; rows: { title: string; reg: string }[] }) {
  return (
    <div className="ac-calendar-section">
      <h3 className="ac-year-title">Academic Year {year}</h3>
      <div className="ac-calendar-grid">
        {rows.map((r) => (
          <div className="ac-calendar-row" key={r.title}>
            <div className="ac-calendar-info">
              <h4>{r.title}</h4>
              <p>{r.reg}</p>
            </div>
            <a href="#" className="ac-download-btn" target="_blank" rel="noopener noreferrer">
              <DownloadIcon />PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AcademicCalendarPage() {
  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width:  1720px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .ac-hero {
          position: relative;
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }
        .ac-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #D4A500;
        }
        .ac-hero-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.08;
          margin: 0;
        }
        .ac-hero-tagline {
          color: rgba(255,255,255,0.85);
          font-size: 19px;
          line-height: 1.6;
          margin: 16px 0 0;
          font-weight: 400;
          max-width: 700px;
        }
        .ac-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          margin-top: 24px;
        }
        .ac-breadcrumb a { color: #D4A500; text-decoration: none; }
        .ac-breadcrumb a:hover { opacity: 0.8; }
        .ac-breadcrumb span { color: #D4A500; }
        .ac-year-badge {
          display: inline-block;
          background: #D4A500;
          color: #2B3490;
          padding: 10px 20px;
          border-radius: 20px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px;
          font-weight: 700;
          margin-top: 24px;
        }
        .ac-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #D4A500;
          color: #2B3490;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 24px;
          margin-left: 12px;
        }
        .ac-cta-button:hover { background: #ffd700; transform: translateY(-2px); }

        .ac-calendar-section { margin-top: 40px; }
        .ac-year-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 40px 0 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #D4A500;
        }
        .ac-calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .ac-calendar-row {
          background: #f4f3ef;
          border: 1px solid #eef0f3;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .ac-calendar-row:hover { background: #fffaed; border-color: #D4A500; }
        .ac-calendar-info h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px;
        }
        .ac-calendar-info p { font-size: 13px; color: #666; margin: 0; }
        .ac-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #2B3490;
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .ac-download-btn:hover { background: #1e2570; transform: translateY(-2px); }

        .ac-note {
          background: #f4f3ef;
          border-left: 4px solid #2B3490;
          padding: 24px;
          border-radius: 8px;
          margin-top: 40px;
          font-size: 15px;
          color: #555;
          line-height: 1.7;
        }
        .ac-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .ac-contact-item h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: #D4A500; margin: 0;
        }
        .ac-contact-item p { font-size: 15px; margin: 8px 0 0; line-height: 1.6; }
        .ac-contact-item a { color: #D4A500; text-decoration: none; }
        .ac-contact-item a:hover { opacity: 0.8; }

        @media (max-width: 900px) {
          .ac-calendar-grid { grid-template-columns: 1fr; }
          .ac-contact-card { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section
          className="ac-hero"
          style={{ backgroundImage: "url('/banners/academic-calendar.png')", position: "relative" }}
        >
          <div className="responsive-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "72px 0" }}>
              <div className="ac-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 className="ac-hero-title">Academic Calendar</h1>
              <p className="ac-hero-tagline">Stay on track with semester schedules, exam timetables and important academic dates</p>
              <div className="ac-year-badge">Current AY: 2025–2026</div>
              <a href="https://www.jemexam.com/ksrmresult/results_notifications.php" target="_blank" rel="noopener noreferrer" className="ac-cta-button">
                <ExternalLinkIcon />View Exam Results
              </a>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
              KSRM College of Engineering follows the academic calendar prescribed by JNTUA (Jawaharlal Nehru
              Technological University Anantapur). The calendar includes important dates for semester classes,
              examinations, and academic activities. Download regulation-wise academic calendars below.
            </p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>
              Download Academic Calendars by Year
            </h2>
            <YearSection year="2025–2026" rows={calendars2025} />
            <YearSection year="2024–2025" rows={calendars2024} />
            <YearSection year="2023–2024" rows={calendars2023} />
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <div className="ac-note">
              Academic calendars are issued by the Examination Section. Dates are subject to revision by JNTUA.
              Please check college notices regularly for any amendments or changes to the schedule.
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <div className="ac-contact-card">
              <div className="ac-contact-item">
                <h4>Examination Section</h4>
                <p>For calendar queries and exam timetable information</p>
              </div>
              <div className="ac-contact-item">
                <h4>Phone</h4>
                <p><a href="tel:+918143731980">+91 8143731980 / 08562 295972</a></p>
              </div>
              <div className="ac-contact-item">
                <h4>Email</h4>
                <p><a href="mailto:principal@ksrmce.ac.in">principal@ksrmce.ac.in</a></p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
