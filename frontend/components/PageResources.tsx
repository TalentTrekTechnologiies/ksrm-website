"use client"

import { useMemo, useState } from "react"
import { resolveFileUrl } from "@/lib/api-base";
import PublicDocumentList, { PUBLIC_DOCUMENT_LIST_STYLES } from "@/components/PublicDocumentList"
import { getDownloadsPublic, Download, DownloadCategory } from "@/lib/downloads-api"
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api"
import { getPageTablesPublic, PageTable } from "@/lib/page-tables-api"
import { useLiveData } from "@/lib/use-live-data"

// Videos published to a page are stored as Gallery records tagged with this
// category (the Media file URL has no extension to sniff, so the tag is how
// PageResources knows to render a <video> instead of an <img>).
const VIDEO_CATEGORY = "__video__"

interface SectionData {
  docs: Download[]
  images: GalleryImage[]
  videos: GalleryImage[]
  tables: PageTable[]
}

/**
 * A table built in Page Content -> (page) -> Tables.
 *
 * Page Content offers the table editor on every page, but until now only the
 * Fee Structure page rendered one - so a table added anywhere else saved
 * successfully and appeared nowhere. Rendering them here puts them on every
 * page that already carries a PageResources block.
 */
function CmsPageTable({ table }: { table: PageTable }) {
  return (
    <div className="pr-table-block">
      {table.title && <h3 className="pr-table-title">{table.title}</h3>}
      <div className="pr-table-wrap">
        <table className="pr-table">
          <thead>
            <tr>
              {table.columns.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.footnote && <p className="pr-table-note">{table.footnote}</p>}
    </div>
  )
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

async function fetchSection(
  section: string,
  docsCategory?: DownloadCategory,
  fallback?: { sections?: string[]; titlePattern?: RegExp },
): Promise<SectionData> {
  // Every source below records whether it actually succeeded, rather than
  // collapsing a failure into an empty array.
  //
  // These were all `.catch(() => [])`, which resolves SUCCESSFULLY with
  // nothing - so useLiveData (which keeps the last good value only when a
  // fetcher REJECTS) stored the empty result and the section vanished until
  // the next successful poll. On the Examinations page that showed up as
  // documents disappearing and coming back on their own.
  //
  // A partial failure is still fine: if the gallery call fails but documents
  // load, the documents render. Only a total failure throws, which makes
  // useLiveData hold whatever was already on screen.
  const settled = <T,>(p: Promise<T[]>) =>
    p.then((v) => ({ ok: true, v }), () => ({ ok: false, v: [] as T[] }))

  const [routed, byCategory, fallbackDocs, images, tables] = await Promise.all([
    settled(getDownloadsPublic(undefined, undefined, section)),
    // Category-driven inclusion (e.g. every SYLLABUS doc shows on the
    // Syllabus page regardless of explicit page routing) - matches the
    // natural admin mental model "I set the category, it shows there".
    docsCategory ? settled(getDownloadsPublic(docsCategory)) : Promise.resolve({ ok: true, v: [] as Download[] }),
    fallback?.sections?.length
      ? settled(
          Promise.all(fallback.sections.map((s) => getDownloadsPublic(undefined, undefined, s).catch(() => [] as Download[]))).then((groups) =>
            groups.flat().filter((d) => !fallback.titlePattern || fallback.titlePattern.test(d.title)),
          ),
        )
      : Promise.resolve({ ok: true, v: [] as Download[] }),
    settled(getGalleryPublic(undefined, undefined, section)),
    settled(getPageTablesPublic(section)),
  ])

  if (!routed.ok && !byCategory.ok && !fallbackDocs.ok && !images.ok && !tables.ok) {
    throw new Error(`page resources unavailable for "${section}"`)
  }
  // Explicit page routing wins over category inclusion: a doc the admin routed
  // to a specific section (e.g. "examinations.results") must appear only there,
  // not also in a broader block that happens to match its category.
  const byCategoryUnrouted = byCategory.v.filter((d) => !d.pageSection || d.pageSection === section)
  // Dedupe by id (same row matched by both routing + category) AND by file URL,
  // so if the same document was accidentally added twice - e.g. once in the
  // global "Add Documents" and once in a department's Documents tab - it still
  // shows only once on the public page.
  const seenId = new Set<number>()
  const seenFile = new Set<string>()
  const docs = [...routed.v, ...byCategoryUnrouted, ...fallbackDocs.v].filter((d) => {
    if (seenId.has(d.id)) return false
    const fileKey = (d.fileUrl || "").trim().toLowerCase()
    if (fileKey && seenFile.has(fileKey)) return false
    seenId.add(d.id)
    if (fileKey) seenFile.add(fileKey)
    return true
  })
  // Split video-tagged gallery records out so they render as <video> players.
  const videos = images.v.filter((g) => g.category === VIDEO_CATEGORY)
  const realImages = images.v.filter((g) => g.category !== VIDEO_CATEGORY)
  return { docs, images: realImages, videos, tables: tables.v }
}

const PR_STYLES = `
  .pr-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
  @media (max-width: 768px) { .pr-container { padding: 0 20px; } }
  .pr-head { text-align: center; }
  /* Matches the standard public section heading (Rajdhani, 800, brand blue)
     used by every hand-built section, so admin-driven blocks read as part of
     the page rather than a bolted-on widget. */
  .pr-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2rem, 3vw, 2.6rem); font-weight: 800; color: #2B3490; margin: 0 0 40px; }
  .pr-gallery { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 180px; gap: 14px; margin-top: 28px; }
  @media (max-width: 1024px) { .pr-gallery { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 560px) { .pr-gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; } }
  .pr-videos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 28px; }
  @media (max-width: 760px) { .pr-videos { grid-template-columns: 1fr; } }
  .pr-video { width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid #eef0f3; }
  .pr-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pr-video-cap { font-size: 14px; font-weight: 600; color: #444; margin-top: 8px; text-align: center; }
  /* Loading placeholder. Height matches a real document row so the layout does
     not shift when the fetched rows replace it. */
  .pr-skel-row {
    height: 64px;
    border-radius: 10px;
    border: 1px solid #eef0f3;
    background: linear-gradient(90deg, #f4f5f8 25%, #eceef3 37%, #f4f5f8 63%);
    background-size: 400% 100%;
    animation: pr-skel-shimmer 1.4s ease infinite;
  }
  @keyframes pr-skel-shimmer {
    from { background-position: 100% 50%; }
    to   { background-position: 0 50%; }
  }
  /* A shimmer is decoration, not information - hold it still for anyone who
     has asked for reduced motion rather than animating a whole page of rows. */
  @media (prefers-reduced-motion: reduce) {
    .pr-skel-row { animation: none; }
  }
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
  ${PUBLIC_DOCUMENT_LIST_STYLES}
  .pr-more { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: none; border: 1.5px solid #2B3490; color: #2B3490; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; padding: 8px 18px; border-radius: 6px; cursor: pointer; transition: background 0.15s, color 0.15s; }
  .pr-more:hover { background: #2B3490; color: #fff; }

  .pr-table-block { margin: 0 0 32px; }
  .pr-table-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 2px solid #FFE619; }
  /* The table scrolls inside its own box rather than widening the page. */
  .pr-table-wrap { overflow-x: auto; border: 1px solid #eef0f3; border-radius: 8px; }
  .pr-table { width: 100%; min-width: 480px; border-collapse: collapse; font-size: 15px; }
  .pr-table thead th { background: #2B3490; color: #fff; padding: 14px 16px; text-align: left; font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
  .pr-table tbody td { padding: 12px 16px; border-bottom: 1px solid #eef0f3; color: #555; }
  .pr-table tbody tr:nth-child(odd) { background: #f7f8fa; }
  .pr-table tbody tr:last-child td { border-bottom: none; }
  .pr-table-note { margin: 10px 0 0; font-size: 13px; color: #666; }
`

/**
 * One grouped block of documents. Long lists (e.g. an AY with 100 uploads)
 * collapse to the first `maxVisible` rows behind a "Show all" toggle, so a page
 * cannot grow without bound as more documents are added over the years.
 */
/**
 * "Published 13 Aug 2026, 10:45 am" for a document row.
 *
 * Date AND time, because several documents are often published in one sitting
 * and the date alone cannot tell them apart. Rendered from the visitor's
 * locale; an unparseable value yields no meta line rather than "Invalid Date".
 */
function formatPublished(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `Published ${d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
}

/**
 * Placeholder shown while the first fetch is in flight.
 *
 * Deliberately mirrors the real document rows (same height, same spacing, same
 * container) so nothing jumps when the content arrives - the whole point is to
 * avoid the "empty, then suddenly files" effect, and a skeleton that is the
 * wrong size just trades one layout shift for another.
 *
 * aria-busy + a visually-hidden "Loading" line means a screen reader announces
 * the wait rather than reading an empty region.
 */
function PageResourcesSkeleton({
  embedded,
  heading,
  background,
  anchorId,
}: {
  embedded?: boolean
  heading?: string
  background?: string
  anchorId?: string
}) {
  const rows = (
    <div className={`pr-list${embedded ? " pr-embedded" : ""}`} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading documents…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="pr-skel-row" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  )

  if (embedded) {
    return (
      <>
        <style>{PR_STYLES}</style>
        {rows}
      </>
    )
  }

  return (
    <section id={anchorId} style={{ width: "100%", background, padding: "56px 0" }}>
      <style>{PR_STYLES}</style>
      <div className="pr-container">
        {heading && (
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              fontFamily: "'Rajdhani', sans-serif",
              margin: "0 0 28px",
            }}
          >
            {heading}
          </h2>
        )}
        {rows}
      </div>
    </section>
  )
}

function DocGroupBlock({ group, maxVisible }: { group: DocGroup; maxVisible: number }) {
  const [expanded, setExpanded] = useState(false)
  const overflowing = group.items.length > maxVisible
  const items = expanded || !overflowing ? group.items : group.items.slice(0, maxVisible)

  // A slug of the group name, so a nav item can link straight to this block
  // (e.g. Mandatory Disclosure -> Memorandum of Understandings). scroll-margin
  // keeps the heading clear of the sticky header when jumped to.
  const anchor = group.label
    ? "doc-" + group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : undefined

  return (
    <div id={anchor} style={anchor ? { scrollMarginTop: 100 } : undefined}>
      {group.label && <div className="pr-group-head">{group.label}</div>}
      <PublicDocumentList
        items={items.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          href: resolveFileUrl(d.fileUrl),
          // When it was published, on every document row. Nothing on the public
          // page previously said how old a file was, so a visitor could not
          // tell this year's timetable from last year's - and the admin had no
          // confirmation that a fresh upload had actually gone live.
          // PublicDocumentList already rendered a `meta` line; it was simply
          // never given one.
          meta: formatPublished(d.publishedAt),
          actionLabel: "Download",
        }))}
      />
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
  anchorId,
  heading,
  hideVideos = false,
  hideDocs = false,
  emptyText,
  fallbackSections,
  fallbackTitlePattern,
}: {
  section: string
  /** Also include every download of this category (not just page-routed ones). */
  docsCategory?: DownloadCategory
  galleryTitle?: string
  docsTitle?: string
  background?: string
  /**
   * Anchor + heading for pages that link to this block from a tab bar. Applied
   * to the section element itself rather than wrapped by the caller, because
   * this component renders nothing when the section is empty - a caller-side
   * wrapper would leave a dangling heading above blank space.
   */
  anchorId?: string
  heading?: string
  /** Rows shown per group before collapsing behind a "Show all" toggle. */
  maxVisible?: number
  /**
   * Render only the document rows (no section wrapper, heading, gallery or
   * videos) so a page can append admin-uploaded docs straight into an existing
   * list - e.g. Examinations → Time Tables.
   */
  embedded?: boolean
  /**
   * Skip the video rows entirely - for a page that renders the same routed
   * videos itself (the Research page shows them in one featured section), so
   * they aren't listed twice.
   */
  hideVideos?: boolean
  /**
   * Skip the document rows - the sibling of hideVideos, for a page that already
   * renders the same documents itself in a designed section. Without it the
   * syllabus page listed each syllabus once under its regulation card and again
   * in the block at the foot of the page.
   */
  hideDocs?: boolean
  /**
   * Shown in place of the section's normal content when nothing has been
   * uploaded yet, instead of the section disappearing entirely - for a page
   * whose other hand-built sections always show (with their own "will be
   * published shortly" message), where a block that vanishes until first
   * upload reads as broken rather than empty. Ignored when embedded, since
   * an embedded block has no section/heading of its own to show it in.
   */
  emptyText?: string
  /**
   * Extra page sections to scan when admins bulk-uploaded documents to a broad
   * page route instead of the exact subsection. Used sparingly on Examinations,
   * where filenames/titles usually say "calendar", "timetable", or "result".
   */
  fallbackSections?: string[]
  /**
   * Case-insensitive regex SOURCE, as a string (e.g. "time\\s*table|timetable")
   * - not a RegExp. This is a client component, and the Examinations page that
   * passes this is a server component: a RegExp is not one of the plain types
   * React can serialize across that boundary, so passing one fails the
   * production build ("Only plain objects... can be passed to Client
   * Components"). The pattern is compiled below instead.
   */
  fallbackTitlePattern?: string
}) {
  // Recompiled only when the source string changes, so the identity stays
  // stable for the fetch dependency below.
  const titlePattern = useMemo(
    () => (fallbackTitlePattern ? new RegExp(fallbackTitlePattern, "i") : undefined),
    [fallbackTitlePattern],
  )

  const data = useLiveData<SectionData>(
    () => fetchSection(section, docsCategory, { sections: fallbackSections, titlePattern }),
    [section, docsCategory, fallbackSections, titlePattern],
  )

  // `data` is null only while the FIRST fetch is in flight - useLiveData keeps
  // the last good value afterwards. This used to `return null` there, which is
  // indistinguishable from "this section has nothing in it": the page rendered
  // its heading over a blank gap, and the documents dropped in a moment later.
  // On the Examinations page - Latest Notifications, Academic Calendars, Exam
  // Time Tables - that read as "the files are missing", then they appeared.
  //
  // The site is a static export, so this content genuinely cannot exist until
  // the client fetch resolves. A skeleton is therefore the honest thing to
  // show: it reserves the space, says "loading" rather than "empty", and keeps
  // the layout from shifting when the real rows land.
  if (!data) return <PageResourcesSkeleton embedded={embedded} heading={heading} background={background} anchorId={anchorId} />

  const { images, tables } = data
  const videos = hideVideos ? [] : data.videos
  const docs = hideDocs ? [] : data.docs
  const isEmpty = docs.length === 0 && images.length === 0 && videos.length === 0 && tables.length === 0
  if (isEmpty && !(emptyText && !embedded)) return null

  const docsList =
    docs.length > 0 ? (
      <div className={`pr-list${embedded ? " pr-embedded" : ""}`}>
        {groupDocs(docs).map((grp) => (
          <DocGroupBlock key={grp.label ?? "__ungrouped__"} group={grp} maxVisible={maxVisible} />
        ))}
      </div>
    ) : null

  const tablesList =
    tables.length > 0 ? tables.map((t) => <CmsPageTable key={t.id} table={t} />) : null

  if (embedded) {
    if (!docsList && !tablesList) return null
    return (
      <>
        <style>{PR_STYLES}</style>
        {tablesList}
        {docsList}
      </>
    )
  }

  return (
    <section id={anchorId} style={{ width: "100%", background, padding: "56px 0" }}>
      <style>{PR_STYLES}</style>
      <div className="pr-container">
        {heading && (
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              fontFamily: "'Rajdhani', sans-serif",
              margin: "0 0 28px",
            }}
          >
            {heading}
          </h2>
        )}
        {isEmpty ? (
          <p style={{ color: "#666", fontSize: 15, fontStyle: "italic", margin: 0 }}>{emptyText}</p>
        ) : (
          <>
        {/* TABLES - built in Page Content, shown before documents. */}
        {tablesList}

        {/* VIDEOS */}
        {videos.length > 0 && (
          <>
            <div className="pr-head">
              <h2 className="pr-title">Videos</h2>
            </div>
            <div className="pr-videos">
              {videos.map((v) => (
                <div key={v.id} data-video-wrap>
                  <div className="pr-video">
                    {/* Hide the whole tile if the source 404s (e.g. an orphaned
                        __video__ row whose Media file was deleted) so the page
                        never shows a broken black box. */}
                    <video
                      src={resolveFileUrl(v.imageUrl)}
                      controls
                      preload="metadata"
                      onError={(e) => {
                        const wrap = e.currentTarget.closest("[data-video-wrap]") as HTMLElement | null
                        if (wrap) wrap.style.display = "none"
                      }}
                    />
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
              <h2 className="pr-title">{galleryTitle}</h2>
            </div>
            <div className="pr-gallery">
              {images.slice(0, 8).map((img) => (
                <div key={img.id} className="pr-tile">
                  {/* eslint-disable-next-line @next/next/no-img-element -- CMS/arbitrary image URL */}
                  <img src={resolveFileUrl(img.imageUrl)} alt={img.title} loading="lazy" decoding="async" onError={(e) => ((e.currentTarget.closest(".pr-tile") as HTMLElement | null)?.style.setProperty("display", "none"))} />
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
              <h2 className="pr-title">{docsTitle}</h2>
            </div>
            {docsList}
          </>
        )}
          </>
        )}
      </div>
    </section>
  )
}
