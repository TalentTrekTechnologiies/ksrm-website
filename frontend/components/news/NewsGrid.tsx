"use client"

import { useMemo, useState } from "react"
import { NewsArticle } from "@/lib/news-api"

/**
 * News presentation for the /news page.
 *
 * News here is more than plain articles: newspaper clippings, recorded
 * interviews and event coverage all live in the same list. So each card leads
 * with whatever media the item actually carries, labels its kind, and opens a
 * reader where the clipping is legible, the video plays and the document
 * downloads.
 *
 * The homepage's news strip is deliberately untouched - this is the full
 * listing page only.
 */

export interface NewsItem {
  id: number | string
  title: string
  content: string
  category: string
  date: string
  imageUrl?: string | null
  videoUrl?: string | null
  documentUrl?: string | null
}

const NEW_WINDOW_DAYS = 21

function isRecent(d: string) {
  return Date.now() - new Date(d).getTime() < NEW_WINDOW_DAYS * 86_400_000
}

function fmt(d: string) {
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

/** What the item actually is, inferred from the media attached to it. */
function kindOf(n: NewsItem): { label: string; icon: string } {
  if (n.videoUrl) return { label: "Interview / Video", icon: "🎥" }
  if (n.documentUrl && n.imageUrl) return { label: "Newspaper Article", icon: "📰" }
  if (n.documentUrl) return { label: "Document", icon: "📄" }
  if (n.imageUrl) return { label: "Coverage", icon: "🖼️" }
  return { label: "News", icon: "📰" }
}

export default function NewsGrid({ items }: { items: NewsItem[] }) {
  const [category, setCategory] = useState("All")
  const [open, setOpen] = useState<NewsItem | null>(null)

  // Filters come from the data, so a new category needs no code change.
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))],
    [items],
  )
  const visible = category === "All" ? items : items.filter((i) => i.category === category)

  return (
    <>
      <style>{`
        .ng-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
        .ng-chip { background: #f7f8fa; border: 1px solid #eef0f3; color: #2B3490; padding: 9px 20px; border-radius: 22px; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; }
        .ng-chip.on { background: #2B3490; color: #FFE619; border-color: #2B3490; }
        .ng-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px; }
        .ng-card { background: #fff; border: 1px solid #eef0f3; border-radius: 14px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; text-align: left; padding: 0; transition: box-shadow .2s, transform .2s; }
        .ng-card:hover { box-shadow: 0 12px 30px rgba(0,0,0,.09); transform: translateY(-3px); }
        .ng-media { position: relative; height: 178px; background: #eef1f6; }
        .ng-media img, .ng-media video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ng-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 40px; }
        .ng-kind { position: absolute; top: 10px; left: 10px; background: rgba(20,26,74,.86); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
        .ng-new { position: absolute; top: 10px; right: 10px; background: #E8112D; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px; letter-spacing: .5px; }
        .ng-body { padding: 16px 18px 20px; flex: 1; display: flex; flex-direction: column; }
        .ng-cat { color: #2B3490; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .ng-title { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #1a1a2e; margin: 6px 0 8px; line-height: 1.25; }
        .ng-desc { color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .ng-date { color: #999; font-size: 12.5px; margin-top: auto; }
        .ng-empty { text-align: center; padding: 60px 20px; color: #999; }

        .ng-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.72); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .ng-modal { background: #fff; border-radius: 14px; max-width: 860px; width: 100%; max-height: 90vh; overflow: auto; position: relative; }
        .ng-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: none; background: rgba(255,255,255,.94); font-size: 21px; cursor: pointer; z-index: 2; box-shadow: 0 2px 8px rgba(0,0,0,.25); }
        .ng-modal-media img { width: 100%; display: block; }
        .ng-modal-media video { width: 100%; display: block; background: #000; }
        .ng-modal-body { padding: 22px 26px 28px; }
        .ng-dl { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; background: #2B3490; color: #fff; text-decoration: none; padding: 11px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; }
      `}</style>

      <div className="ng-filters">
        {categories.map((c) => (
          <button key={c} className={`ng-chip${category === c ? " on" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="ng-empty">Nothing here yet.</p>
      ) : (
        <div className="ng-grid">
          {visible.map((n) => {
            const kind = kindOf(n)
            return (
              <button key={n.id} className="ng-card" onClick={() => setOpen(n)}>
                <div className="ng-media">
                  {n.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
                    <img src={n.imageUrl} alt={n.title} loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
                  ) : n.videoUrl ? (
                    <video src={n.videoUrl} preload="metadata" muted />
                  ) : (
                    <div className="ng-placeholder">{kind.icon}</div>
                  )}
                  <span className="ng-kind">{kind.icon} {kind.label}</span>
                  {isRecent(n.date) && <span className="ng-new">NEW</span>}
                </div>
                <div className="ng-body">
                  <span className="ng-cat">{n.category}</span>
                  <h3 className="ng-title">{n.title}</h3>
                  <p className="ng-desc">{n.content}</p>
                  <span className="ng-date">{fmt(n.date)}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {open && (
        <div className="ng-overlay" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="ng-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ng-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <div className="ng-modal-media">
              {open.videoUrl ? (
                <video src={open.videoUrl} controls autoPlay />
              ) : open.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS image URL
                <img src={open.imageUrl} alt={open.title} />
              ) : null}
            </div>
            <div className="ng-modal-body">
              <span className="ng-cat">{open.category}</span>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700, color: "#1a1a2e", margin: "6px 0 4px" }}>
                {open.title}
              </h2>
              <p style={{ color: "#999", fontSize: 13, margin: "0 0 14px" }}>{fmt(open.date)}</p>
              <p style={{ color: "#444", fontSize: 15.5, lineHeight: 1.75, whiteSpace: "pre-line", margin: 0 }}>{open.content}</p>
              {open.documentUrl && (
                <a className="ng-dl" href={open.documentUrl} target="_blank" rel="noopener noreferrer">
                  📄 Download attachment
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** Adapts an API article to what this grid renders. */
export function toNewsItem(n: NewsArticle): NewsItem {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category,
    date: n.date,
    imageUrl: n.imageUrl,
    videoUrl: n.videoUrl,
    documentUrl: n.documentUrl,
  }
}
