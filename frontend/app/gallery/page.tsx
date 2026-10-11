"use client";

import { useMemo, useState } from "react";
import { resolveFileUrl, thumbProps } from "@/lib/api-base";
import { getGalleryPublic } from "@/lib/gallery-api";
import { getCampusVideosPublic } from "@/lib/homepage-api";
import { useLiveData } from "@/lib/use-live-data";
import { UPLOADED_MEDIA_STYLES } from "@/lib/uploaded-media-styles";
import CmsText from "@/components/CmsText";

interface GalleryImageDisplay {
  src: string;
  /** Video tiles render a <video> player instead of an <img>. */
  isVideo?: boolean;
  alt: string;
  cat: string;
}


/**
 * The filter buttons used to be this fixed list, which meant a category the
 * college actually used had no button unless it happened to be named here.
 * Thirteen "Campus Life" photographs were reachable only under "All" - there
 * was no tab that could show them.
 *
 * The tabs are built from the categories present now, so uploading a photo
 * under a new category creates its tab. These are the order the known ones
 * appear in; anything else follows, alphabetically.
 */
const FILTER_ORDER = ["Campus", "Campus Life", "Labs", "Sports", "Library", "Events", "Transport", "Videos"];
// Gallery rows tagged with this category hold a video, not a photo.
const VIDEO_CATEGORY = "__video__";


/** A YouTube watch/share link becomes its embeddable form; anything else is
 *  a file URL and is played directly. */
function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Every video the college has added through Admin -> Campus Videos, so the
  // Gallery is where all of them are - not just the ones uploaded as gallery
  // rows. Only those: the built-in clips used to fill in whenever there were
  // none, so removing the last video in the admin brought four old ones back.
  const cmsVideos = useLiveData<{ title: string; url: string }[]>(
    () =>
      getCampusVideosPublic()
        .then((r) => (r.visible ? r.items.map((v) => ({ title: v.title, url: v.youtubeUrl })) : [])),
    [],
  );
  const videos = cmsVideos ?? [];

  // Polled, so an image published in the admin appears here without a refresh.
  // Only what the admin publishes: the page used to start from the built-in
  // photos and return to them whenever the gallery was empty or still loading,
  // which is how a deleted photo appeared to come back.
  const images =
    useLiveData<GalleryImageDisplay[]>(
      () =>
        getGalleryPublic().then((items) => {
          // The CMS is the only source. A built-in set of legacy photos was
          // first merged in, then kept as a fallback for an empty gallery;
          // either way the admin could not delete those photos, because it
          // does not own them, so they kept reappearing. They are gone.
          //
          // Videos are stored as Gallery rows tagged "__video__" (a Media URL
          // has no extension to sniff). They render as <video> tiles under a
          // "Videos" filter rather than being dropped - the raw sentinel is
          // never shown as a category label.
          return items.map((i) =>
            i.category === VIDEO_CATEGORY
              ? { src: resolveFileUrl(i.imageUrl), alt: i.title, cat: "Videos", isVideo: true }
              : { src: resolveFileUrl(i.imageUrl), alt: i.title, cat: i.category || "Campus" },
          )
        }),
      [],
    ) ?? [];

  // Built from what is actually in the gallery, so no photo can end up in a
  // category with no tab to reach it by.
  const filters = useMemo(() => {
    const present = new Set(images.map((i) => i.cat).filter(Boolean));
    const known = FILTER_ORDER.filter((f) => present.has(f));
    const extra = [...present].filter((c) => !FILTER_ORDER.includes(c)).sort();
    return ["All", ...known, ...extra];
  }, [images]);

  const filteredImages = activeFilter === "All"
    ? images
    : images.filter(img => img.cat === activeFilter);

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .gal-hero { position: relative; background-image: url('/banners/gallery.webp'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .gal-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); pointer-events: none; }
        .gal-hero > * { position: relative; z-index: 2; }
        .gal-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .gal-breadcrumb a { color: #D4A500; text-decoration: none; }
        .gal-filters { display: flex; gap: 12px; margin: 32px 0; flex-wrap: wrap; }
        .gal-filter-btn { background: #f7f8fa; border: 1px solid #eef0f3; color: #2B3490; padding: 12px 24px; border-radius: 24px; font-weight: 600; font-family: 'Rajdhani', sans-serif; }
        .gal-filter-btn.active { background: #2B3490; color: #D4A500; border-color: #2B3490; }
        /* start, not stretch: a card is as tall as its own picture, so a short
           photo beside a tall notice is not padded out with empty grey. */
        .gal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; align-items: start; }
        .gal-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; }
        .gal-card-content { padding: 16px; }
        .gal-card-title { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .gal-video-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px; }
        .gal-video-wrap { border-radius: 8px; overflow: hidden; }
        .gal-video-wrap video { width: 100%; aspect-ratio: 16 / 9; object-fit: contain; background: #000; display: block; }
        ${UPLOADED_MEDIA_STYLES}

        @media (max-width: 1760px) { .gal-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .gal-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="gal-hero">
        <div className="responsive-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="gallery-page" slot="campus-gallery" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="gallery-page" slot="explore-life-at-k-s" /></p>
        </div>
      </section>

      <section style={{ padding: "48px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="gal-filters">
            {filters.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`gal-filter-btn${activeFilter === f ? " active" : ""}`}>{f}</button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <div className="gal-grid">
            {filteredImages.map((img, index) => (
              <div className="gal-card" key={`${img.src}-${index}`}>
                <div className={`gal-card-image um-frame${img.isVideo ? " um-video" : ""}`}>
                  {img.isVideo ? (
                    <video src={img.src} controls preload="metadata" onError={(e) => { e.currentTarget.style.display = "none" }} />
                  ) : (
                    <img {...thumbProps(img.src, "MEDIUM", (el) => { el.style.display = "none" })} alt={img.alt} loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="gal-card-content">
                  <h3 className="gal-card-title">{img.alt}</h3>
                  <span style={{ color: "#2B3490", fontWeight: 600, fontSize: 13 }}>{img.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 40px" }}><CmsText section="gallery-page" slot="campus-videos" /></h2>
          <div className="gal-video-grid">
            {videos.map((v) => {
              const embed = youtubeEmbed(v.url);
              return (
                <div className="gal-video-wrap" key={v.url}>
                  {embed ? (
                    <iframe
                      src={embed}
                      title={v.title || "Campus video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: "100%", aspectRatio: "16 / 9", border: 0, display: "block" }}
                    />
                  ) : (
                    /* Not autoplaying a CMS video: the built-in clips are
                       short silent loops, but a video the college uploads can
                       be anything, and four of them playing at once is not a
                       gallery. */
                    <video controls playsInline preload="metadata">
                      <source src={resolveFileUrl(v.url)} />
                    </video>
                  )}
                  {v.title && (
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", margin: "10px 0 0" }}>
                      {v.title}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
