"use client"

import { FileText, Download as DownloadIcon } from "lucide-react"
import { getDownloadsPublic, Download } from "@/lib/downloads-api"
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api"
import { useLiveData } from "@/lib/use-live-data"

interface SectionData {
  docs: Download[]
  images: GalleryImage[]
}

async function fetchSection(section: string): Promise<SectionData> {
  const [docs, images] = await Promise.all([
    getDownloadsPublic(undefined, undefined, section).catch(() => [] as Download[]),
    getGalleryPublic(undefined, undefined, section).catch(() => [] as GalleryImage[]),
  ])
  return { docs, images }
}

/**
 * Drop-in block for any public page that shows the gallery images and
 * documents an admin routed to this page section (Gallery / Downloads admin →
 * "Show on page"), pulled live from the backend. Renders nothing until at
 * least one image or document exists, so adding it to a page is always safe.
 *
 * Usage: <PageResources section="edc" />
 */
export default function PageResources({
  section,
  galleryTitle = "Gallery",
  docsTitle = "Downloads & Resources",
  background = "#f7f8fa",
}: {
  section: string
  galleryTitle?: string
  docsTitle?: string
  background?: string
}) {
  const data = useLiveData<SectionData>(() => fetchSection(section), [section])

  if (!data) return null
  const { docs, images } = data
  if (docs.length === 0 && images.length === 0) return null

  return (
    <section style={{ width: "100%", background, padding: "56px 0" }}>
      <style>{`
        .pr-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .pr-container { padding: 0 20px; } }
        .pr-head { text-align: center; }
        .pr-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #2B3490; text-transform: uppercase; }
        .pr-title { font-family: 'Rajdhani', sans-serif; font-size: 30px; font-weight: 700; color: #1a1a2e; margin: 8px 0 0; }
        .pr-gallery { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 180px; gap: 14px; margin-top: 28px; }
        @media (max-width: 1024px) { .pr-gallery { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px) { .pr-gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; } }
        .pr-tile { position: relative; overflow: hidden; border-radius: 12px; border: 1px solid #eef0f3; }
        .pr-tile img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .pr-tile:hover img { transform: scale(1.06); }
        .pr-cap { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 12px; opacity: 0; transition: opacity 0.3s ease; background: linear-gradient(180deg, rgba(14,21,51,0) 55%, rgba(14,21,51,0.78) 100%); }
        .pr-tile:hover .pr-cap { opacity: 1; }
        .pr-cap span { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; color: #fff; }
        .pr-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 28px; }
        @media (max-width: 768px) { .pr-list { grid-template-columns: 1fr; } }
        .pr-row { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: all 0.2s ease; }
        .pr-row:hover { border-color: #D4A500; box-shadow: 0 10px 24px rgba(43,52,144,0.08); transform: translateY(-2px); }
        .pr-icon { width: 42px; height: 42px; border-radius: 10px; background: #eef0f6; color: #2B3490; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pr-dl { margin-left: auto; color: #2B3490; flex-shrink: 0; }
      `}</style>
      <div className="pr-container">
        {/* GALLERY */}
        {images.length > 0 && (
          <>
            <div className="pr-head">
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

        {/* DOWNLOADS */}
        {docs.length > 0 && (
          <>
            <div className="pr-head" style={{ marginTop: images.length > 0 ? "48px" : 0 }}>
              <div className="pr-eyebrow">Resources</div>
              <h2 className="pr-title">{docsTitle}</h2>
            </div>
            <div className="pr-list">
              {docs.map((d) => (
                <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="pr-row">
                  <span className="pr-icon"><FileText size={20} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#1a1a2e", lineHeight: 1.3 }}>{d.title}</span>
                    {d.description && <span style={{ display: "block", fontSize: "13px", color: "#888", marginTop: "2px" }}>{d.description}</span>}
                  </span>
                  <DownloadIcon size={18} className="pr-dl" />
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
