"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import { getDownloadsPublic, Download, DownloadCategory } from "@/lib/downloads-api"
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api"
import { useLiveData } from "@/lib/use-live-data"

// Videos published to a page are stored as Gallery records tagged with this
// category (the Media file URL has no extension to sniff, so the tag is how
// PageResources knows to render a <video> instead of an <img>).
const VIDEO_CATEGORY = "__video__"

interface SectionData {
  docs: Download[]
  images: GalleryImage[]
  videos: GalleryImage[]
}

interface DocGroup {
  label: string | null
  items: Download[]
}

// Groups documents by groupLabel, preserving first-seen order; every
// unlabeled doc collects into a single trailing null group.
function groupDocs(docs: Download[]): DocGroup[] {
  const groups: DocGroup[] = []
  const byLabel = new Map<string, DocGroup>()
  const ungrouped: DocGroup = { label: null, items: [] }
  for (const d of docs) {
    const label = d.groupLabel?.trim() || null
    if (!label) {
      ungrouped.items.push(d)
      continue
    }
    let g = byLabel.get(label)
    if (!g) {
      g = { label, items: [] }
      byLabel.set(label, g)
      groups.push(g)
    }
    g.items.push(d)
  }
  if (ungrouped.items.length) groups.push(ungrouped)
  return groups
}

async function fetchSection(section: string, docsCategory?: DownloadCategory): Promise<SectionData> {
  const [routed, byCategory, images] = await Promise.all([
    getDownloadsPublic(undefined, undefined, section).catch(() => [] as Download[]),
    // Category-driven inclusion (e.g. every SYLLABUS doc shows on the
    // Syllabus page regardless of explicit page routing) - matches the
    // natural admin mental model "I set the category, it shows there".
    docsCategory ? getDownloadsPublic(docsCategory).catch(() => [] as Download[]) : Promise.resolve([] as Download[]),
    getGalleryPublic(undefined, undefined, section).catch(() => [] as GalleryImage[]),
  ])
  // Explicit page routing wins over category inclusion: a doc the admin routed
  // to a specific section (e.g. "examinations.results") must appear only there,
  // not also in a broader block that happens to match its category.
  const byCategoryUnrouted = byCategory.filter((d) => !d.pageSection || d.pageSection === section)
  const seen = new Set<number>()
  const docs = [...routed, ...byCategoryUnrouted].filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)))
  // Split video-tagged gallery records out so they render as <video> players.
  const videos = images.filter((g) => g.category === VIDEO_CATEGORY)
  const realImages = images.filter((g) => g.category !== VIDEO_CATEGORY)
  return { docs, images: realImages, videos }
}

const PR_STYLES = `
  .pr-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
  @media (max-width: 768px) { .pr-container { padding: 0 20px; } }
  .pr-head { text-align: center; }
  .pr-eyebrow { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #2B3490; text-transform: uppercase; }
  .pr-title { font-family: 'Rajdhani', sans-serif; font-size: 30px; font-weight: 700; color: #1a1a2e; margin: 8px 0 0; }
  .pr-gallery { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 180px; gap: 14px; margin-top: 28px; }
  @media (max-width: 1024px) { .pr-gallery { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 560px) { .pr-gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; } }
  .pr-videos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 28px; }
  @media (max-width: 760px) { .pr-videos { grid-template-columns: 1fr; } }
  .pr-video { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid #eef0f3; }
  .pr-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pr-video-cap { font-size: 14px; font-weight: 600; color: #444; margin-top: 8px; text-align: center; }
  .pr-tile { position: relative; overflow: hidden; border-radius: 12px; border: 1px solid #eef0f3; }
  .pr-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
  .pr-tile:hover img { transform: scale(1.06); }
  .pr-cap { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 12px; opacity: 0; transition: opacity 0.3s ease; background: linear-gradient(180deg, rgba(14,21,51,0) 55%, rgba(14,21,51,0.78) 100%); }
  .pr-tile:hover .pr-cap { opacity: 1; }
  .pr-cap span { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: #fff; }
  /* Full container width so admin-uploaded docs line up with the hand-built
     document rows on the same page (e.g. Examinations' Academic Calendars). */
  .pr-list { display: flex; flex-direction: column; gap: 8px; margin-top: 28px; }
  .pr-list.pr-embedded { margin-top: 8px; }
  .pr-group-head { font-size: 18px; font-weight: 700; color: #2B3490; border-left: 4px solid #D4A500; padding-left: 16px; margin: 32px 0 16px; }
  .pr-list > div:first-child .pr-group-head { margin-top: 0; }
  .pr-row { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; text-decoration: none; transition: all 0.2s ease; }
  .pr-row:hover { border-color: #D4A500; box-shadow: 0 8px 20px rgba(43,52,144,0.08); }
  .pr-icon { width: 40px; height: 40px; border-radius: 6px; background: #eef1ff; color: #2B3490; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pr-doc-title { display: block; font-size: 15px; font-weight: 600; color: #2B3490; line-height: 1.4; }
  .pr-doc-desc { display: block; font-size: 13px; color: #999; margin-top: 2px; }
  .pr-pill { margin-left: auto; flex-shrink: 0; color: #fff; background: #2B3490; padding: 5px 14px; border-radius: 4px; font-size: 13px; font-weight: 700; white-space: nowrap; }
  .pr-more { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: none; border: 1.5px solid #2B3490; color: #2B3490; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; padding: 8px 18px; border-radius: 6px; cursor: pointer; transition: background 0.15s, color 0.15s; }
  .pr-more:hover { background: #2B3490; color: #fff; }
`

/**
 * One grouped block of documents. Long lists (e.g. an AY with 100 uploads)
 * collapse to the first `maxVisible` rows behind a "Show all" toggle, so a page
 * cannot grow without bound as more documents are added over the years.
 */
function DocGroupBlock({ group, maxVisible }: { group: DocGroup; maxVisible: number }) {
  const [expanded, setExpanded] = useState(false)
  const overflowing = group.items.length > maxVisible
  const items = expanded || !overflowing ? group.items : group.items.slice(0, maxVisible)

  return (
    <div>
      {group.label && <div className="pr-group-head">{group.label}</div>}
      {items.map((d) => (
        <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="pr-row">
          <span className="pr-icon"><FileText size={19} /></span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span className="pr-doc-title">{d.title}</span>
            {d.description && <span className="pr-doc-desc">{d.description}</span>}
          </span>
          <span className="pr-pill">Download →</span>
        </a>
      ))}
      {overflowing && (
        <button type="button" className="pr-more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show all ${group.items.length} documents ↓`}
        </button>
      )}
    </div>
  )
}

/**
 * Drop-in block for any public page that shows the gallery images and
 * documents an admin routed to this page section (Gallery / Downloads admin →
 * "Show on page"), pulled live from the backend. Renders nothing until at
 * least one image or document exists, so adding it to a page is always safe.
 *
 * Usage: <PageResources section="edc" />
 *        <PageResources section="examinations.timetables" embedded />
 */
export default function PageResources({
  section,
  docsCategory,
  galleryTitle = "Gallery",
  docsTitle = "Downloads & Resources",
  background = "#f7f8fa",
  embedded = false,
  maxVisible = 6,
}: {
  section: string
  /** Also include every download of this category (not just page-routed ones). */
  docsCategory?: DownloadCategory
  galleryTitle?: string
  docsTitle?: string
  background?: string
  /** Rows shown per group before collapsing behind a "Show all" toggle. */
  maxVisible?: number
  /**
   * Render only the document rows (no section wrapper, heading, gallery or
   * videos) so a page can append admin-uploaded docs straight into an existing
   * list - e.g. Examinations → Time Tables.
   */
  embedded?: boolean
}) {
  const data = useLiveData<SectionData>(() => fetchSection(section, docsCategory), [section, docsCategory])

  if (!data) return null
  const { docs, images, videos } = data
  if (docs.length === 0 && images.length === 0 && videos.length === 0) return null

  const docsList =
    docs.length > 0 ? (
      <div className={`pr-list${embedded ? " pr-embedded" : ""}`}>
        {groupDocs(docs).map((grp) => (
          <DocGroupBlock key={grp.label ?? "__ungrouped__"} group={grp} maxVisible={maxVisible} />
        ))}
      </div>
    ) : null

  if (embedded) {
    if (!docsList) return null
    return (
      <>
        <style>{PR_STYLES}</style>
        {docsList}
      </>
    )
  }

  return (
    <section style={{ width: "100%", background, padding: "56px 0" }}>
      <style>{PR_STYLES}</style>
      <div className="pr-container">
        {/* VIDEOS */}
        {videos.length > 0 && (
          <>
            <div className="pr-head">
              <div className="pr-eyebrow">Videos</div>
              <h2 className="pr-title">Videos</h2>
            </div>
            <div className="pr-videos">
              {videos.map((v) => (
                <div key={v.id}>
                  <div className="pr-video">
                    <video src={v.imageUrl} controls preload="metadata" />
                  </div>
                  {v.title && <div className="pr-video-cap">{v.title}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* GALLERY */}
        {images.length > 0 && (
          <>
            <div className="pr-head" style={{ marginTop: videos.length > 0 ? "48px" : 0 }}>
              <div className="pr-eyebrow">Gallery</div>
              <h2 className="pr-title">{galleryTitle}</h2>
            </div>
            <div className="pr-gallery">
              {images.slice(0, 8).map((img) => (
                <div key={img.id} className="pr-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL */}
                  <img src={img.imageUrl} alt={img.title} loading="lazy" onError={(e) => ((e.currentTarget.closest(".pr-tile") as HTMLElement | null)?.style.setProperty("display", "none"))} />
                  <div className="pr-cap"><span>{img.title}</span></div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* DOWNLOADS - grouped by groupLabel (e.g. "AY 2025-26", "B.Tech")
            when set; ungrouped docs render last under no heading. */}
        {docsList && (
          <>
            <div className="pr-head" style={{ marginTop: images.length > 0 ? "48px" : 0 }}>
              <div className="pr-eyebrow">Resources</div>
              <h2 className="pr-title">{docsTitle}</h2>
            </div>
            {docsList}
          </>
        )}
      </div>
    </section>
  )
}
