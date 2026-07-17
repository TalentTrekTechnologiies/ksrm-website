"use client";

import { useMemo, useState } from "react";
import { getDownloadsPublic, Download, DownloadCategory } from "@/lib/downloads-api";
import { useLiveData } from "@/lib/use-live-data";

const CATEGORY_LABELS: Record<DownloadCategory, string> = {
  SYLLABUS: "Syllabus",
  QUESTION_PAPER: "Question Papers",
  BROCHURE: "Brochures",
  AFFIDAVIT: "Affidavits",
  FORM: "Forms",
  OTHER: "Other",
};

const FILTERS: ("All" | DownloadCategory)[] = ["All", "SYLLABUS", "QUESTION_PAPER", "BROCHURE", "AFFIDAVIT", "FORM", "OTHER"];

export default function DownloadsPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | DownloadCategory>("All");

  // Polled, so a file published in the admin appears here without a refresh.
  // The fetcher never rejects, so a failed request resolves to [] and still
  // marks the page loaded - the empty state below covers it, same as before.
  const data = useLiveData<Download[]>(
    () => getDownloadsPublic().catch(() => [] as Download[]),
    [],
  );
  const downloads = data ?? [];
  const loaded = data !== null;

  const filtered = useMemo(
    () => (activeFilter === "All" ? downloads : downloads.filter((d) => d.category === activeFilter)),
    [downloads, activeFilter],
  );

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .dl-hero { position: relative; background-image: url('/images/campus/07.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .dl-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); pointer-events: none; }
        .dl-hero > * { position: relative; z-index: 2; }
        .dl-filters { display: flex; gap: 12px; margin: 32px 0; flex-wrap: wrap; }
        .dl-filter-btn { background: #f7f8fa; border: 1px solid #eef0f3; color: #2B3490; padding: 12px 24px; border-radius: 24px; font-weight: 600; font-family: 'Rajdhani', sans-serif; }
        .dl-filter-btn.active { background: #2B3490; color: #D4A500; border-color: #2B3490; }
        .dl-list { display: flex; flex-direction: column; gap: 16px; margin: 32px 0; }
        .dl-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 20px 24px; }
        .dl-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .dl-desc { font-size: 14px; color: #666; margin: 0; }
        .dl-cat { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #2B3490; background: #eef1ff; padding: 4px 10px; border-radius: 6px; margin-bottom: 6px; display: inline-block; }
        .dl-link { flex-shrink: 0; background: #2B3490; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px; }
        .dl-empty { text-align: center; padding: 64px 20px; color: #999; }
        @media (max-width: 640px) { .dl-row { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <section className="dl-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Downloads</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 600 }}>Syllabi, question papers, brochures, forms and other documents</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0 72px", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="dl-filters">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`dl-filter-btn${activeFilter === f ? " active" : ""}`}>
                {f === "All" ? "All" : CATEGORY_LABELS[f]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="dl-empty">
              {loaded ? "No documents available in this category yet." : "Loading downloads..."}
            </div>
          ) : (
            <div className="dl-list">
              {filtered.map((d) => (
                <div className="dl-row" key={d.id}>
                  <div>
                    <span className="dl-cat">{CATEGORY_LABELS[d.category]}</span>
                    <h3 className="dl-title">{d.title}</h3>
                    {d.description && <p className="dl-desc">{d.description}</p>}
                  </div>
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="dl-link">Download</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
