"use client";

import PageResources from "@/components/PageResources";
import { resolveFileUrl } from "@/lib/api-base";
import CmsText from "@/components/CmsText";
import { useMemo } from "react";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import { useLiveData } from "@/lib/use-live-data";
import { getExamNotificationsPublic, ExamNotification } from "@/lib/exam-notifications-api";
import AcademicYear from "@/components/AcademicYear";

/**
 * The calendars listed here were invented rows: eleven of them, every single
 * one with href="#", so the whole page offered PDF buttons that downloaded
 * nothing. Meanwhile the college HAD uploaded eleven real calendars - filed
 * under Examinations, where this page never looked.
 *
 * Both buckets are read now and merged, deduplicated on the file URL, because
 * an academic calendar is an academic calendar wherever it was filed. Uploads
 * to either destination show up here.
 */

/** "Academic Calendar - B.Tech III & IV Semester AY 2025-26" -> "2025-2026". */
/**
 * The academic year a calendar belongs to, read from its title.
 *
 * An explicit "AY ..." marker wins over everything else, because these titles
 * carry several years and only one of them is the academic year:
 *
 *   "A. Calendar II B.Tech 2025 (R) 2025 (LE) AY 26 27"   -> AY 2026-27
 *   "A. Calendar IV B.Tech 2023 (R) 2024 (LE) AY26 27"    -> AY 2026-27
 *
 * The others are admission batches. Taking the first four-digit number - which
 * is what this did - filed this year's calendars under 2025 and 2023, so the
 * Examinations page showed AY 2026-27 while Academics showed nothing newer
 * than 2025-26 from the very same documents.
 *
 * Accepts the marker written loosely, because that is how it is typed:
 * "AY 26 27", "AY26 27", "AY 2026-27", "AY 2026-2027".
 */
function academicYearOf(title: string): string {
  const four = (y: string) => (y.length === 2 ? `20${y}` : y);

  // "AY" followed by two years, separated by a space, dash or slash.
  const marked = title.match(/AY\s*(\d{4}|\d{2})\s*[-–—/ ]\s*(\d{4}|\d{2})/i);
  if (marked) {
    const from = four(marked[1]);
    return `AY ${from}-${four(marked[2]).slice(2)}`;
  }

  // A plain span anywhere in the title: "2025-26", "2025 - 2026".
  const span = title.match(/(20\d{2})\s*[-–—]\s*(\d{2,4})/);
  if (span) {
    const from = span[1];
    const to = span[2].length === 2 ? span[2] : span[2].slice(2);
    return `AY ${from}-${to}`;
  }

  // A lone year is ambiguous - it is as likely to be the batch as the academic
  // year - so it is reported as the year it says and nothing is inferred.
  const single = title.match(/(20\d{2})/);
  return single ? single[1] : "Other";
}

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

function YearSection({ year, rows }: { year: string; rows: { title: string; reg: string; file: string }[] }) {
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
            <a href={r.file} className="ac-download-btn" target="_blank" rel="noopener noreferrer">
              <DownloadIcon />PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AcademicCalendarPage() {
  const filed = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "academics.calendar").catch(() => [] as Download[]),
    [],
  );
  const fromExams = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "examinations.calendars").catch(() => [] as Download[]),
    [],
  );

  // Calendars posted as exam NOTIFICATIONS rather than uploaded as documents.
  //
  // The Examinations page shows both, so a calendar added under Exam
  // Notifications -> Academic Calendars appeared there and nowhere else, and
  // the college had no way of knowing which of the two places they had used.
  // Reading both here means it does not matter which one an admin picks.
  const fromNotifications = useLiveData<ExamNotification[]>(
    () => getExamNotificationsPublic("CALENDAR").catch(() => [] as ExamNotification[]),
    [],
  );

  const years = useMemo(() => {
    // A notification carries its file on buttonUrl and its year as a field,
    // so it is reshaped to look like a document before merging - one list, one
    // grouping, one sort, rather than two half-lists rendered side by side.
    //
    // Its academicYear is authoritative when set: an admin picked it from a
    // dropdown, which beats reading a year out of a filename.
    const asDocuments: Download[] = (fromNotifications ?? [])
      .filter((n) => n.isPublished && n.isActive && n.buttonUrl)
      .map((n) => ({
        ...(n as unknown as Download),
        title: n.academicYear ? `${n.title} ${n.academicYear}` : n.title,
        fileUrl: n.buttonUrl as string,
        description: n.description,
      }));

    const seen = new Set<string>();
    const merged = [...(filed ?? []), ...(fromExams ?? []), ...asDocuments].filter((d) => {
      if (!d.fileUrl || seen.has(d.fileUrl)) return false;
      seen.add(d.fileUrl);
      return true;
    });

    const groups = new Map<string, { title: string; reg: string; file: string }[]>();
    for (const d of merged) {
      const year = academicYearOf(d.title);
      const rows = groups.get(year) ?? [];
      rows.push({ title: d.title, reg: d.description ?? "", file: resolveFileUrl(d.fileUrl) });
      groups.set(year, rows);
    }
    // Newest academic year first; "Other" last, since it has no year to sort on.
    return [...groups.entries()].sort((a, b) =>
      a[0] === "Other" ? 1 : b[0] === "Other" ? -1 : b[0].localeCompare(a[0]),
    );
  }, [filed, fromExams, fromNotifications]);

  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .ac-hero {
          position: relative;
          /* The banner existed in /banners all along and was never referenced,
             so this hero rendered as a flat navy block. */
          background-image: url('/banners/academic-calendar.webp');
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
          style={{ backgroundImage: "url('/banners/academic-calendar.webp')", position: "relative" }}
        >
          <div className="responsive-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "72px 0" }}>
              <div className="ac-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 className="ac-hero-title"><CmsText section="academics.calendar" slot="academic-calendar" /></h1>
              <p className="ac-hero-tagline"><CmsText section="academics.calendar" slot="stay-on-track-with-semester" /></p>
              <div className="ac-year-badge">Current AY: <AcademicYear /></div>
              <a href="https://www.jemexam.com/ksrmresult/results_notifications.php" target="_blank" rel="noopener noreferrer" className="ac-cta-button">
                <ExternalLinkIcon />View Exam Results
              </a>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}><CmsText section="academics.calendar" slot="k-s-r-m-college" multiline /></p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="academics.calendar" slot="download-academic-calendars-by-year" /></h2>
            {years.length === 0 && (
              <p style={{ color: "#666", fontSize: 15, fontStyle: "italic" }}>
                Academic calendars will be published here shortly.
              </p>
            )}
            {years.map(([year, rows]) => (
              <YearSection key={year} year={year} rows={rows} />
            ))}
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
                <h4><CmsText section="academics.calendar" slot="examination-section" /></h4>
                <p><CmsText section="academics.calendar" slot="for-calendar-queries-and-exam" /></p>
              </div>
              <div className="ac-contact-item">
                <h4><CmsText section="academics.calendar" slot="phone" /></h4>
                {/* The Examination Section's own number, not the admissions
                    line. This band answers calendar and timetable queries, and
                    it carried the admissions number and the Principal's
                    address - so anyone ringing about an exam reached the wrong
                    desk. */}
                <p><a href="tel:+919154925978">+91 91549 25978</a></p>
              </div>
              <div className="ac-contact-item">
                <h4><CmsText section="academics.calendar" slot="email" /></h4>
                <p><a href="mailto:ce@ksrmce.ac.in">ce@ksrmce.ac.in</a></p>
              </div>
            </div>
          </div>
        </section>
      
      {/* The calendars themselves are listed by academic year above. */}
      <PageResources section="academics.calendar" hideDocs />
      </main>
    </>
  );
}
