"use client";

import { useState } from "react";

const filters = ["All", "Examinations", "Events", "Accreditation", "Rankings", "Placements"];

const newsItems = [
  { badge: "Examinations", badgeBg: "#eef1ff", badgeColor: "#2B3490", isNew: true, date: "2026-05-15", title: "KGCET 2K26 Results Announced", desc: "KGCET 2026 results have been announced. Students can check their results at the official portal.", href: "https://ksrmce.ac.in/KGCET2K26-Results.pdf" },
  { badge: "Events", badgeBg: "#fff3e0", badgeColor: "#f57c00", isNew: true, date: "2026-04-01", title: "Graduation Day 2026 Applications Open", desc: "Applications for Graduation Day 2026 are now open. Students who have completed their degree can apply.", href: "#" },
  { badge: "Events", badgeBg: "#fff3e0", badgeColor: "#f57c00", date: "2025-08-15", title: "Freshers Orientation 2025-26", desc: "Welcome to the new batch of 2025-26. Orientation program details have been announced.", href: "#" },
  { badge: "Accreditation", badgeBg: "#e8f5e9", badgeColor: "#388e3c", date: "2025-06-01", title: "NBA Accreditation Renewed", desc: "KSRM College of Engineering has successfully renewed NBA accreditation for multiple programmes.", href: "#" },
  { badge: "Rankings", badgeBg: "#fce4ec", badgeColor: "#c2185b", date: "2025-03-01", title: "NIRF Ranking 2025 Submitted", desc: "KSRM College has submitted its NIRF ranking data for 2025.", href: "https://ksrmce.ac.in/nirf.php" },
  { badge: "Events", badgeBg: "#fff3e0", badgeColor: "#f57c00", date: "2024-12-10", title: "Industry-Academia Meet 2024", desc: "Annual Industry-Academia meet held with participation from 20+ companies.", href: "#" },
];

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredNews = activeFilter === "All"
    ? newsItems
    : newsItems.filter(n => n.badge === activeFilter);

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .news-hero { position: relative; background-image: url('/gallery/Gallery _ KSRM College of Engineering_files/seminar.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .news-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
        .news-hero > * { position: relative; z-index: 2; }
        .news-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .news-breadcrumb a { color: #D4A500; text-decoration: none; }
        .news-filters { display: flex; gap: 12px; margin: 48px 0; flex-wrap: wrap; }
        .news-filter-btn { background: #f7f8fa; border: 1px solid #eef0f3; color: #666; padding: 12px 24px; border-radius: 24px; font-weight: 600; font-family: 'Rajdhani', sans-serif; font-size: 14px; }
        .news-filter-btn.active { background: #2B3490; color: #fff; border-color: #2B3490; }
        .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin: 32px 0; }
        .news-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; position: relative; }
        .news-badge { position: absolute; top: 12px; left: 12px; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; z-index: 10; }
        .news-new-badge { position: absolute; top: 12px; right: 12px; background: #FF6B6B; color: #fff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; z-index: 10; }
        .news-content { padding: 24px; }
        .news-date { font-size: 12px; color: #999; margin-bottom: 12px; display: block; }
        .news-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; line-height: 1.4; }
        .news-description { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 16px; }
        .news-read-more { color: #2B3490; text-decoration: none; font-weight: 600; }
        @media (max-width: 1024px) { .news-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .news-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="news-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <div className="news-breadcrumb"><a href="/">Home</a><span>/</span><span>News &amp; Events</span></div>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>News &amp; Events</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 300, maxWidth: 600 }}>Stay updated with the latest from KSRM</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="news-filters">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`news-filter-btn${activeFilter === f ? " active" : ""}`}>{f}</button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
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
        </div>
      </section>
    </main>
  );
}
