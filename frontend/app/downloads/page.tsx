"use client";

import { useMemo, useState } from "react";
import PublicDocumentList from "@/components/PublicDocumentList";
import { getDownloadsPublic, Download, DownloadCategory } from "@/lib/downloads-api";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";

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
        .dl-empty { text-align: center; padding: 64px 20px; color: #999; }
      `}</style>

      <section className="dl-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}><CmsText section="downloads-page" slot="downloads" /></h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 600 }}><CmsText section="downloads-page" slot="syllabi-question-papers-brochures-forms" /></p>
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
            <PublicDocumentList
              items={filtered.map((d) => ({
                id: d.id,
                title: d.title,
                description: d.description,
                meta: CATEGORY_LABELS[d.category],
                href: d.fileUrl,
                actionLabel: "Download",
              }))}
            />
          )}
        </div>
      </section>
    </main>
  );
}
