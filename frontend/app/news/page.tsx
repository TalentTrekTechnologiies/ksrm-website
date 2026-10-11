"use client";

import { getNewsPublic } from "@/lib/news-api";
import NewsGrid, { toNewsItem, NewsItem } from "@/components/news/NewsGrid";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";

export default function NewsPage() {
  // Only what the CMS publishes. This page used to start from six built-in
  // sample articles and fall back to them whenever the list was empty or still
  // loading - so a deleted article seemed to come back, and an empty news page
  // showed stories that never happened.
  const richNews = useLiveData<NewsItem[]>(
    () => getNewsPublic().then(({ items }) => items.map(toNewsItem)),
    [],
  );

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .news-hero { position: relative; background-image: url('/banners/news.webp'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
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
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}><CmsText section="news-page" slot="news-events" /></h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 600 }}><CmsText section="news-page" slot="stay-updated-with-the-latest" /></p>
          </div>
        </div>
      </section>

      {/* Full listing. Cards lead with whatever media the item carries -
          newspaper clipping, interview video or document - and open a reader.
          The homepage's news strip is deliberately left as it was. */}
      <section style={{ padding: "56px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          {/* While loading, hold a screen of space so the footer is not shown
              and then shoved down when the articles arrive. */}
          {richNews === null ? <div aria-busy="true" style={{ minHeight: "80vh" }} /> : richNews.length > 0 ? (
            <NewsGrid items={richNews} />
          ) : (
            <p style={{ color: "#666", fontSize: 15, fontStyle: "italic", textAlign: "center", margin: "24px 0" }}>
              No news has been published yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
