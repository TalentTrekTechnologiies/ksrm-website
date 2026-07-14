"use client";

import { useEffect, useState } from "react";
import { getGalleryPublic } from "@/lib/gallery-api";

interface GalleryImageDisplay {
  src: string;
  alt: string;
  cat: string;
}

const FALLBACK_IMAGES: GalleryImageDisplay[] = [
  { src: "/site-images/topview.jpg", alt: "KSRM College aerial campus view", cat: "Campus" },
  { src: "/site-images/blocktop.jpg", alt: "Main block aerial view", cat: "Campus" },
  { src: "/site-images/block.jpg", alt: "Main administrative block", cat: "Campus" },
  { src: "/site-images/19.jpg", alt: "Solar powered campus", cat: "Campus" },
  { src: "/site-images/22.jpg", alt: "Solar parking facility", cat: "Campus" },
  { src: "/site-images/lab.jpg", alt: "Robotics laboratory with ABB robotic arm", cat: "Labs" },
  { src: "/site-images/roboticslab.jpg", alt: "Robotic 3D printing lab", cat: "Labs" },
  { src: "/site-images/ab.jpg", alt: "Computer laboratory", cat: "Labs" },
  { src: "/site-images/labw.jpg", alt: "Computer lab examination", cat: "Labs" },
  { src: "/site-images/lab2.jpg", alt: "Chemistry laboratory", cat: "Labs" },
  { src: "/site-images/lab3.jpg", alt: "Electrical engineering lab", cat: "Labs" },
  { src: "/site-images/volleyball.jpg", alt: "Volleyball match", cat: "Sports" },
  { src: "/site-images/sportsg3.jpg", alt: "Indoor badminton court", cat: "Sports" },
  { src: "/site-images/sportsground.jpg", alt: "Basketball court", cat: "Sports" },
  { src: "/site-images/sportsground2.jpg", alt: "Sports ground aerial view", cat: "Sports" },
  { src: "/site-images/library.jpg", alt: "Central Library building", cat: "Library" },
  { src: "/site-images/studentsinlib.jpg", alt: "Students reading in library", cat: "Library" },
  { src: "/site-images/studentsinlib2.jpg", alt: "Students studying in library", cat: "Library" },
  { src: "/site-images/fest.jpg", alt: "Award ceremony", cat: "Events" },
  { src: "/site-images/fest2.jpg", alt: "Cultural fest performance", cat: "Events" },
  { src: "/site-images/event.jpg", alt: "KGCET poster launch", cat: "Events" },
  { src: "/site-images/event2.jpg", alt: "CONNECT 2K26 technical fest", cat: "Events" },
  { src: "/site-images/seminar.jpg", alt: "Seminar in auditorium", cat: "Events" },
  { src: "/site-images/inaugaration.jpg", alt: "Statue inauguration ceremony", cat: "Events" },
  { src: "/site-images/inaugaration2.jpg", alt: "Event inauguration ribbon cutting", cat: "Events" },
  { src: "/site-images/achievements.jpg", alt: "Achievement award", cat: "Events" },
  { src: "/site-images/activity.jpg", alt: "College activity", cat: "Events" },
  { src: "/site-images/activity2.jpg", alt: "Campus tour activity", cat: "Events" },
  { src: "/site-images/activity3.jpg", alt: "Bharat Environment Program", cat: "Events" },
  { src: "/site-images/activity4.jpg", alt: "INSPIRON 2K26 event", cat: "Events" },
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
  { src: "/site-images/buses.jpg", alt: "KSRM college bus fleet", cat: "Transport" },
  { src: "/site-images/KSR00001.webp", alt: "Inauguration ceremony with golden statue dedication", cat: "Events" },
  { src: "/site-images/KSR00007.webp", alt: "Campus event with faculty and staff", cat: "Events" },
  { src: "/site-images/KSR00014.webp", alt: "College event and gathering", cat: "Events" },
  { src: "/site-images/KSR00016.webp", alt: "Performance rewards recognition ceremony", cat: "Events" },
  { src: "/site-images/KSR00017.webp", alt: "Campus activity and team gathering", cat: "Campus" },
  { src: "/site-images/KSR00019.webp", alt: "College event moment", cat: "Events" },
  { src: "/site-images/KSR00027.webp", alt: "Campus gathering", cat: "Campus" },
  { src: "/Filtered/KSR00027 (1).JPG", alt: "Campus moment", cat: "Campus" },
  { src: "/site-images/KSR00028.webp", alt: "Event photograph", cat: "Events" },
  { src: "/Filtered/KSR00028 (1).JPG", alt: "Campus event", cat: "Events" },
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

const filters = ["All", "Campus", "Labs", "Sports", "Library", "Events", "Transport"];

const videos = [
  "/videos/flash-mob.mp4",
  "/videos/3d-robo.mp4",
  "/videos/sports-winners.mp4",
  "/videos/sivananda-smaranam-night-event.mp4",
];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [images, setImages] = useState<GalleryImageDisplay[]>(FALLBACK_IMAGES);

  useEffect(() => {
    let cancelled = false
    getGalleryPublic()
      .then((items) => {
        if (cancelled || items.length === 0) return
        // Merge, don't replace - the legacy fallback set (including every
        // /Filtered photo) stays visible until an admin actually replaces
        // that content through the CMS. A handful of real DB rows
        // previously wiped out the entire fallback set here since this
        // used to be a straight setImages(cmsOnly) - see the bug report.
        const cmsImages = items.map((i) => ({ src: i.imageUrl, alt: i.title, cat: i.category || "Campus" }))
        const existingSrcs = new Set(cmsImages.map((i) => i.src))
        setImages([...cmsImages, ...FALLBACK_IMAGES.filter((i) => !existingSrcs.has(i.src))])
      })
      .catch(() => {
        // Network/API failure - fallback images (already the initial state) stay.
      })
    return () => {
      cancelled = true
    }
  }, [])

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

        .gal-hero { position: relative; background-image: url('/banners/gallery.png'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
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
        .gal-card-image img { width: 100%; height: 200px; object-fit: cover; }
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
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>Campus Gallery</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Explore life at KSRM College of Engineering</p>
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
            {filteredImages.map((img) => (
              <div className="gal-card" key={img.src}>
                <div className="gal-card-image"><img src={img.src} alt={img.alt} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none" }} /></div>
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
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 40px" }}>Campus Videos</h2>
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
