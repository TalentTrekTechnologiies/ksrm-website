"use client";

import { useMemo, useState } from "react";
import { resolveFileUrl } from "@/lib/api-base";
import { getGalleryPublic } from "@/lib/gallery-api";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";

interface GalleryImageDisplay {
  src: string;
  /** Video tiles render a <video> player instead of an <img>. */
  isVideo?: boolean;
  alt: string;
  cat: string;
}

const FALLBACK_IMAGES: GalleryImageDisplay[] = [
  { src: "/site-images/topview.webp", alt: "K.S.R.M. College aerial campus view", cat: "Campus" },
  { src: "/site-images/blocktop.webp", alt: "Main block aerial view", cat: "Campus" },
  { src: "/site-images/block.webp", alt: "Main administrative block", cat: "Campus" },
  { src: "/site-images/19.webp", alt: "Solar powered campus", cat: "Campus" },
  { src: "/site-images/22.webp", alt: "Solar parking facility", cat: "Campus" },
  { src: "/site-images/lab.webp", alt: "Robotics laboratory with ABB robotic arm", cat: "Labs" },
  { src: "/site-images/roboticslab.webp", alt: "Robotic 3D printing lab", cat: "Labs" },
  { src: "/site-images/ab.webp", alt: "Computer laboratory", cat: "Labs" },
  { src: "/site-images/labw.webp", alt: "Computer lab examination", cat: "Labs" },
  { src: "/site-images/lab2.webp", alt: "Chemistry laboratory", cat: "Labs" },
  { src: "/site-images/lab3.webp", alt: "Electrical engineering lab", cat: "Labs" },
  { src: "/site-images/volleyball.webp", alt: "Volleyball match", cat: "Sports" },
  { src: "/site-images/sportsg3.webp", alt: "Indoor badminton court", cat: "Sports" },
  { src: "/site-images/sportsground.webp", alt: "Basketball court", cat: "Sports" },
  { src: "/site-images/sportsground2.webp", alt: "Sports ground aerial view", cat: "Sports" },
  { src: "/site-images/library.webp", alt: "Central Library building", cat: "Library" },
  { src: "/site-images/studentsinlib.webp", alt: "Students reading in library", cat: "Library" },
  { src: "/site-images/studentsinlib2.webp", alt: "Students studying in library", cat: "Library" },
  { src: "/site-images/fest.webp", alt: "Award ceremony", cat: "Events" },
  { src: "/site-images/fest2.webp", alt: "Cultural fest performance", cat: "Events" },
  { src: "/site-images/event.webp", alt: "KGCET poster launch", cat: "Events" },
  { src: "/site-images/event2.webp", alt: "CONNECT 2K26 technical fest", cat: "Events" },
  { src: "/site-images/seminar.webp", alt: "Seminar in auditorium", cat: "Events" },
  { src: "/site-images/inaugaration.webp", alt: "Statue inauguration ceremony", cat: "Events" },
  { src: "/site-images/inaugaration2.webp", alt: "Event inauguration ribbon cutting", cat: "Events" },
  { src: "/site-images/achievements.webp", alt: "Achievement award", cat: "Events" },
  { src: "/site-images/activity.webp", alt: "College activity", cat: "Events" },
  { src: "/site-images/activity2.webp", alt: "Campus tour activity", cat: "Events" },
  { src: "/site-images/activity3.webp", alt: "Bharat Environment Program", cat: "Events" },
  { src: "/site-images/activity4.webp", alt: "INSPIRON 2K26 event", cat: "Events" },
  { src: "/site-images/KSR00001.webp", alt: "Campus event - day view", cat: "Events" },
  { src: "/site-images/KSR00007.webp", alt: "Campus gathering and activities", cat: "Events" },
  { src: "/site-images/KSR00014.webp", alt: "Students engaged in event", cat: "Events" },
  { src: "/site-images/KSR00016.webp", alt: "Campus life moment", cat: "Events" },
  { src: "/site-images/KSR00017.webp", alt: "College event participation", cat: "Events" },
  { src: "/site-images/KSR00019.webp", alt: "Campus event scene", cat: "Events" },
  { src: "/site-images/KSR00027.webp", alt: "Student activities on campus", cat: "Events" },
  { src: "/site-images/KSR00028.webp", alt: "Event with student participation", cat: "Events" },
  { src: "/site-images/KSR00048.webp", alt: "Campus gathering and networking", cat: "Events" },
  { src: "/site-images/KSR00053.webp", alt: "Event moment on campus", cat: "Events" },
  { src: "/site-images/KSR00058.webp", alt: "Students at campus event", cat: "Events" },
  { src: "/site-images/KSR00104.webp", alt: "Campus celebration event", cat: "Events" },
  { src: "/site-images/KSR00116.webp", alt: "Crowd at campus event", cat: "Events" },
  { src: "/site-images/KSR00140.webp", alt: "Event scene with students", cat: "Events" },
  { src: "/site-images/KSR00163.webp", alt: "Large campus event gathering", cat: "Events" },
  { src: "/site-images/KSR09989.webp", alt: "Campus activity highlight", cat: "Events" },
  { src: "/site-images/buses.webp", alt: "K.S.R.M. college bus fleet", cat: "Transport" },
  { src: "/site-images/KSR00001.webp", alt: "Inauguration ceremony with golden statue dedication", cat: "Events" },
  { src: "/site-images/KSR00007.webp", alt: "Campus event with faculty and staff", cat: "Events" },
  { src: "/site-images/KSR00014.webp", alt: "College event and gathering", cat: "Events" },
  { src: "/site-images/KSR00016.webp", alt: "Performance rewards recognition ceremony", cat: "Events" },
  { src: "/site-images/KSR00017.webp", alt: "Campus activity and team gathering", cat: "Campus" },
  { src: "/site-images/KSR00019.webp", alt: "College event moment", cat: "Events" },
  { src: "/site-images/KSR00027.webp", alt: "Campus gathering", cat: "Campus" },
  { src: "/Filtered/KSR00027 (1).webp", alt: "Campus moment", cat: "Campus" },
  { src: "/site-images/KSR00028.webp", alt: "Event photograph", cat: "Events" },
  { src: "/Filtered/KSR00028 (1).webp", alt: "Campus event", cat: "Events" },
  { src: "/site-images/KSR00048.webp", alt: "Campus activity", cat: "Campus" },
  { src: "/site-images/KSR00053.webp", alt: "College event", cat: "Events" },
  { src: "/site-images/KSR00058.webp", alt: "Campus gathering", cat: "Campus" },
  { src: "/site-images/KSR00104.webp", alt: "Event moment", cat: "Events" },
  { src: "/site-images/KSR00116.webp", alt: "Campus photo", cat: "Campus" },
  { src: "/site-images/KSR00140.webp", alt: "College event", cat: "Events" },
  { src: "/site-images/KSR00163.webp", alt: "Campus moment", cat: "Campus" },
  { src: "/site-images/KSR09989.webp", alt: "Campus activity", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.31 PM.jpeg", alt: "Campus event with faculty lineup", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.31 PM (1).jpeg", alt: "Construction/foundation laying ceremony", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.31 PM (2).jpeg", alt: "Campus event gathering", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.32 PM.jpeg", alt: "Campus moment", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.32 PM (1).jpeg", alt: "Event photograph", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.32 PM (2).jpeg", alt: "Campus gathering", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.33 PM.jpeg", alt: "College event", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.33 PM (1).jpeg", alt: "Campus photo", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.33 PM (2).jpeg", alt: "Event moment", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.34 PM.jpeg", alt: "Campus activity", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.34 PM (1).jpeg", alt: "College gathering", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.35 PM.jpeg", alt: "Campus event", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.35 PM (1).jpeg", alt: "Event photo", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.35 PM (2).jpeg", alt: "Campus moment", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.36 PM.jpeg", alt: "College event", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.36 PM (1).jpeg", alt: "Campus gathering", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.37 PM.jpeg", alt: "Event photograph", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.37 PM (1).jpeg", alt: "Campus photo", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.37 PM (2).jpeg", alt: "College activity", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.38 PM.jpeg", alt: "Campus event", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.38 PM (1).jpeg", alt: "Event moment", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.39 PM.jpeg", alt: "Campus gathering", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.39 PM (1).jpeg", alt: "College photo", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.39 PM (2).jpeg", alt: "Campus moment", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.40 PM.jpeg", alt: "Event photo", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.40 PM (1).jpeg", alt: "Campus activity", cat: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.41 PM.jpeg", alt: "College event", cat: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.41 PM (1).jpeg", alt: "Campus gathering", cat: "Campus" },
];

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

const videos = [
  "/videos/flash-mob.mp4",
  "/videos/3d-robo.mp4",
  "/videos/sports-winners.mp4",
  "/videos/sivananda-smaranam-night-event.mp4",
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Polled, so an image published in the admin appears here without a refresh.
  // On an empty list or a failed fetch the fallback images stay - useLiveData
  // keeps the last good value rather than blanking the page.
  const images =
    useLiveData<GalleryImageDisplay[]>(
      () =>
        getGalleryPublic().then((items) => {
          if (items.length === 0) return FALLBACK_IMAGES
          // Merge, don't replace - the legacy fallback set (including every
          // /Filtered photo) stays visible until an admin actually replaces
          // that content through the CMS. A handful of real DB rows
          // previously wiped out the entire fallback set here since this
          // used to be a straight setImages(cmsOnly) - see the bug report.
          // Videos are stored as Gallery rows tagged "__video__" (a Media URL
          // has no extension to sniff). They render as <video> tiles under a
          // "Videos" filter rather than being dropped - the raw sentinel is
          // never shown as a category label.
          const cmsImages = items.map((i) =>
            i.category === VIDEO_CATEGORY
              ? { src: resolveFileUrl(i.imageUrl), alt: i.title, cat: "Videos", isVideo: true }
              : { src: resolveFileUrl(i.imageUrl), alt: i.title, cat: i.category || "Campus" },
          )
          const existingSrcs = new Set(cmsImages.map((i) => i.src))
          return [...cmsImages, ...FALLBACK_IMAGES.filter((i) => !existingSrcs.has(i.src))]
        }),
      [],
      { initialValue: FALLBACK_IMAGES },
    ) ?? FALLBACK_IMAGES;

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
        .gal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; }
        .gal-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; }
        .gal-card-image { width: 100%; height: 200px; }
        .gal-card-image img,
        .gal-card-image video { width: 100%; height: 200px; object-fit: cover; display: block; background: #000; }
        .gal-card-content { padding: 16px; }
        .gal-card-title { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .gal-video-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px; }
        .gal-video-wrap { border-radius: 8px; overflow: hidden; }
        .gal-video-wrap video { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }

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
                <div className="gal-card-image">
                  {img.isVideo ? (
                    <video src={img.src} controls preload="metadata" onError={(e) => { e.currentTarget.style.display = "none" }} />
                  ) : (
                    <img src={img.src} alt={img.alt} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none" }} />
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
            {videos.map((v) => (
              <div className="gal-video-wrap" key={v}>
                <video autoPlay loop muted playsInline>
                  <source src={v} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
