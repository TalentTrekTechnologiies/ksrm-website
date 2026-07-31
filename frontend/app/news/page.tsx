"use client";

import { mediaFile } from "@/lib/api-base";
import { useState } from "react";
import { getNewsPublic } from "@/lib/news-api";
import NewsGrid, { toNewsItem, NewsItem } from "@/components/news/NewsGrid";
import { useLiveData } from "@/lib/use-live-data";

const filters = ["All", "Examinations", "Events", "Accreditation", "Rankings", "Placements"];

interface NewsDisplay {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  isNew: boolean;
  date: string;
  title: string;
  desc: string;
  href: string;
}

// Fixed palette matching the existing 5 named categories - unknown/future
// categories fall back to a neutral gray rather than breaking the layout.
const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  Examinations: { bg: "#eef1ff", color: "#2B3490" },
  Events: { bg: "#fff3e0", color: "#f57c00" },
  Accreditation: { bg: "#e8f5e9", color: "#388e3c" },
  Rankings: { bg: "#fce4ec", color: "#c2185b" },
  Placements: { bg: "#e0f7fa", color: "#00838f" },
};
const DEFAULT_CATEGORY_STYLE = { bg: "#f0f0f0", color: "#666" };

const FALLBACK_NEWS: NewsDisplay[] = [
  { badge: "Examinations", badgeBg: "#eef1ff", badgeColor: "#2B3490", isNew: true, date: "2026-05-15", title: "KGCET 2K26 Results Announced", desc: "KGCET 2026 results have been announced. Students can check their results at the official portal.", href: mediaFile(173) },
  { badge: "Events", badgeBg: "#fff3e0", badgeColor: "#f57c00", isNew: true, date: "2026-04-01", title: "Graduation Day 2026 Applications Open", desc: "Applications for Graduation Day 2026 are now open. Students who have completed their degree can apply.", href: "#" },
  { badge: "Events", badgeBg: "#fff3e0", badgeColor: "#f57c00", isNew: false, date: "2025-08-15", title: "Freshers Orientation 2025-26", desc: "Welcome to the new batch of 2025-26. Orientation program details have been announced.", href: "#" },
  { badge: "Accreditation", badgeBg: "#e8f5e9", badgeColor: "#388e3c", isNew: false, date: "2025-06-01", title: "NBA Accreditation Renewed", desc: "K.S.R.M. College of Engineering has successfully renewed NBA accreditation for multiple programmes.", href: "#" },
  { badge: "Rankings", badgeBg: "#fce4ec", badgeColor: "#c2185b", isNew: false, date: "2025-03-01", title: "NIRF Ranking 2025 Submitted", desc: "KSRM College has submitted its NIRF ranking data for 2025.", href: "https://ksrmce.ac.in/nirf.php" },
  { badge: "Events", badgeBg: "#fff3e0", badgeColor: "#f57c00", isNew: false, date: "2024-12-10", title: "Industry-Academia Meet 2024", desc: "Annual Industry-Academia meet held with participation from 20+ companies.", href: "#" },
];

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Polled, so an article published in the admin appears here without a
  // refresh. On an empty list or a failed fetch the fallback news stay -
  // useLiveData keeps the last good value rather than blanking the page.
  //
  // This full listing page always renders published articles regardless
  // of the homepage teaser's visibility flag - that flag only controls
  // whether the homepage's "Latest News" section shows, not this page.
  const newsItems =
    useLiveData<NewsDisplay[]>(
      () =>
        getNewsPublic().then(({ items }) =>
          items.length === 0
            ? FALLBACK_NEWS
            : items.map((n) => {
                const style = CATEGORY_STYLES[n.category] ?? DEFAULT_CATEGORY_STYLE
                return {
                  badge: n.category,
                  badgeBg: style.bg,
                  badgeColor: style.color,
                  isNew: n.isFeatured,
                  date: n.date.slice(0, 10),
                  title: n.title,
                  desc: n.content.length > 160 ? `${n.content.slice(0, 160)}…` : n.content,
                  href: "#",
                }
              }),
        ),
      [],
      { initialValue: FALLBACK_NEWS },
    ) ?? FALLBACK_NEWS;

  // The redesigned grid needs the whole article (image, video, document), not
  // the flattened teaser shape above, so it reads from the API separately. The
  // old `newsItems` list still backs the fallback when the CMS is empty.
  const richNews = useLiveData<NewsItem[]>(
    () => getNewsPublic().then(({ items }) => items.map(toNewsItem)).catch(() => [] as NewsItem[]),
    [],
  );

  const filteredNews = activeFilter === "All"
    ? newsItems
    : newsItems.filter(n => n.badge === activeFilter);

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .news-hero { position: relative; background-image: url('/banners/news.png'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .news-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); pointer-events: none; }
        .news-hero > * { position: relative; z-index: 2; }
        .news-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .news-breadcrumb a { color: #D4A500; text-decoration: none; }
        .news-filters { display: flex; gap: 12px; margin: 48px 0; flex-wrap: wrap; }
        .news-filter-btn { background: #f7f8fa; border: 1px solid #eef0f3; color: #666; padding: 12px 24px; border-radius: 24px; font-weight: 600; font-family: 'Rajdhani', sans-serif; font-size: 15px; }
        .news-filter-btn.active { background: #2B3490; color: #fff; border-color: #2B3490; }
        .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin: 32px 0; }
        .news-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; position: relative; }
        .news-badge { position: absolute; top: 12px; left: 12px; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; z-index: 10; }
        .news-new-badge { position: absolute; top: 12px; right: 12px; background: #FF6B6B; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; z-index: 10; }
        .news-content { padding: 24px; }
        .news-date { font-size: 13px; color: #999; margin-bottom: 12px; display: block; }
        .news-title { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; line-height: 1.4; }
        .news-description { font-size: 15px; color: #666; line-height: 1.6; margin: 0 0 16px; }
        .news-read-more { color: #2B3490; text-decoration: none; font-weight: 600; }
        @media (max-width: 1024px) { .news-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .news-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="news-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>News &amp; Events</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 600 }}>Stay updated with the latest from K.S.R.M.</p>
          </div>
        </div>
      </section>

      {/* Full listing. Cards lead with whatever media the item carries -
          newspaper clipping, interview video or document - and open a reader.
          The homepage's news strip is deliberately left as it was. */}
      <section style={{ padding: "56px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          {richNews && richNews.length > 0 ? (
            <NewsGrid items={richNews} />
          ) : (
            <>
              <div className="news-filters">
                {filters.map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)} className={`news-filter-btn${activeFilter === f ? " active" : ""}`}>{f}</button>
                ))}
              </div>
              <div className="news-grid">
                {filteredNews.map((n) => (
                  <div className="news-card" key={n.title}>
                    <div className="news-badge" style={{ background: n.badgeBg, color: n.badgeColor }}>{n.badge}</div>
                    {n.isNew && <div className="news-new-badge">🆕 NEW</div>}
                    <div className="news-content">
                      <span className="news-date">{n.date}</span>
                      <h3 className="news-title">{n.title}</h3>
                      <p className="news-description">{n.desc}</p>
                      <a href={n.href} className="news-read-more">Read More →</a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
