"use client"

import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * Renders a page's tour/feature videos from the CMS, falling back to the list
 * the page shipped with.
 *
 * These videos used to be hardcoded arrays of /videos/*.mp4 paths, so adding or
 * replacing one meant a code change and a redeploy. They are now Gallery
 * records tagged VIDEO_CATEGORY and routed to the page's section, managed from
 * Page Content -> (page) -> Videos.
 *
 * The fallback matters: it keeps every page looking exactly as it did if the
 * API is unreachable or the records are ever removed, so switching to the CMS
 * cannot leave a page blank.
 *
 * Pages using this should pass `hideVideos` to their <PageResources>, otherwise
 * the same videos render twice - once here and once in that block.
 */
const VIDEO_CATEGORY = "__video__"

export default function CmsVideos({
  section,
  fallback,
  gridClassName,
  itemClassName,
  showTitles = false,
}: {
  section: string
  /** Video paths the page shipped with, used when the CMS has none. */
  fallback: string[]
  gridClassName: string
  itemClassName: string
  /** Captions under each clip - off by default to match the original layouts. */
  showTitles?: boolean
}) {
  const cms = useLiveData<GalleryImage[]>(
    () =>
      getGalleryPublic(undefined, undefined, section)
        .then((rows) => rows.filter((g) => g.category === VIDEO_CATEGORY))
        .catch(() => [] as GalleryImage[]),
    [section],
  )

  const items =
    cms && cms.length > 0
      ? cms.map((g) => ({ key: String(g.id), src: g.imageUrl, title: g.title }))
      : fallback.map((src) => ({ key: src, src, title: "" }))

  if (items.length === 0) return null

  return (
    <div className={gridClassName}>
      {items.map((v) => (
        <div className={itemClassName} key={v.key}>
          {/* Hide a clip whose file has gone rather than showing a black box. */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={(e) => {
              const wrap = e.currentTarget.parentElement
              if (wrap) wrap.style.display = "none"
            }}
          >
            <source src={v.src} />
          </video>
          {showTitles && v.title && (
            <p style={{ fontSize: 14, fontWeight: 600, color: "#444", marginTop: 8, textAlign: "center" }}>{v.title}</p>
          )}
        </div>
      ))}
    </div>
  )
}
