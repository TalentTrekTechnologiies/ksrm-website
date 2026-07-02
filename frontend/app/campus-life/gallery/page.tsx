"use client";

import { useState } from "react";

const galleryPhotos = [
  { src: "/Filtered/KSR00001.JPG", alt: "Inauguration ceremony with golden statue dedication", category: "Events" },
  { src: "/Filtered/KSR00007.JPG", alt: "Campus event with faculty and staff", category: "Events" },
  { src: "/Filtered/KSR00014.JPG", alt: "College event and gathering", category: "Events" },
  { src: "/Filtered/KSR00016.JPG", alt: "Performance rewards recognition ceremony", category: "Events" },
  { src: "/Filtered/KSR00017.JPG", alt: "Campus activity and team gathering", category: "Campus" },
  { src: "/Filtered/KSR00019.JPG", alt: "College event moment", category: "Events" },
  { src: "/Filtered/KSR00027.JPG", alt: "Campus gathering", category: "Campus" },
  { src: "/Filtered/KSR00027 (1).JPG", alt: "Campus moment", category: "Campus" },
  { src: "/Filtered/KSR00028.JPG", alt: "Event photograph", category: "Events" },
  { src: "/Filtered/KSR00028 (1).JPG", alt: "Campus event", category: "Events" },
  { src: "/Filtered/KSR00048.JPG", alt: "Campus activity", category: "Campus" },
  { src: "/Filtered/KSR00053.JPG", alt: "College event", category: "Events" },
  { src: "/Filtered/KSR00058.JPG", alt: "Campus gathering", category: "Campus" },
  { src: "/Filtered/KSR00104.JPG", alt: "Event moment", category: "Events" },
  { src: "/Filtered/KSR00116.JPG", alt: "Campus photo", category: "Campus" },
  { src: "/Filtered/KSR00140.JPG", alt: "College event", category: "Events" },
  { src: "/Filtered/KSR00163.JPG", alt: "Campus moment", category: "Campus" },
  { src: "/Filtered/KSR09989.JPG", alt: "Campus activity", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.31 PM.jpeg", alt: "Campus event with faculty lineup", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.31 PM (1).jpeg", alt: "Construction/foundation laying ceremony", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.31 PM (2).jpeg", alt: "Campus event gathering", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.32 PM.jpeg", alt: "Campus moment", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.32 PM (1).jpeg", alt: "Event photograph", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.32 PM (2).jpeg", alt: "Campus gathering", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.33 PM.jpeg", alt: "College event", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.33 PM (1).jpeg", alt: "Campus photo", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.33 PM (2).jpeg", alt: "Event moment", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.34 PM.jpeg", alt: "Campus activity", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.34 PM (1).jpeg", alt: "College gathering", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.35 PM.jpeg", alt: "Campus event", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.35 PM (1).jpeg", alt: "Event photo", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.35 PM (2).jpeg", alt: "Campus moment", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.36 PM.jpeg", alt: "College event", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.36 PM (1).jpeg", alt: "Campus gathering", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.37 PM.jpeg", alt: "Event photograph", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.37 PM (1).jpeg", alt: "Campus photo", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.37 PM (2).jpeg", alt: "College activity", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.38 PM.jpeg", alt: "Campus event", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.38 PM (1).jpeg", alt: "Event moment", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.39 PM.jpeg", alt: "Campus gathering", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.39 PM (1).jpeg", alt: "College photo", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.39 PM (2).jpeg", alt: "Campus moment", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.40 PM.jpeg", alt: "Event photo", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.40 PM (1).jpeg", alt: "Campus activity", category: "Campus" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.41 PM.jpeg", alt: "College event", category: "Events" },
  { src: "/Filtered/WhatsApp Image 2026-07-02 at 2.59.41 PM (1).jpeg", alt: "Campus gathering", category: "Campus" },
];

const categories = ["All", "Campus", "Events"];

export default function CampusGalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPhotos =
    activeCategory === "All" ? galleryPhotos : galleryPhotos.filter((photo) => photo.category === activeCategory);

  return (
    <main style={{ background: "#ffffff" }}>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
          padding: "60px 40px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <h1
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              margin: "0 0 16px",
            }}
          >
            Campus Photo Gallery
          </h1>
          <p style={{ fontSize: 18, margin: "0 0 24px", opacity: 0.95 }}>
            Memorable Moments & Events
          </p>
          <div style={{ display: "flex", gap: 8, fontSize: 14, justifyContent: "center" }}>
            <a href="/" style={{ color: "#D4A500", textDecoration: "none" }}>
              Home
            </a>
            <span>/</span>
            <a href="/campus-life" style={{ color: "#D4A500", textDecoration: "none" }}>
              Campus Life
            </a>
            <span>/</span>
            <span>Photo Gallery</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{ padding: "72px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <p
            style={{
              color: "#555",
              fontSize: 16,
              lineHeight: 1.8,
              margin: 0,
              maxWidth: 820,
            }}
          >
            Explore our comprehensive photo gallery showcasing the vibrant campus life at KSRM College of Engineering. From academic events and ceremonies to cultural celebrations and student activities, these images capture the essence of our thriving community and commitment to excellence.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "40px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "24px",
                  border: "1.5px solid #eef0f3",
                  background: activeCategory === cat ? "#2B3490" : "#fff",
                  color: activeCategory === cat ? "#fff" : "#555",
                  fontSize: "14px",
                  fontWeight: "600",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              margin: "0 0 48px",
              textAlign: "center",
            }}
          >
            {activeCategory === "All" ? "All Photos" : activeCategory}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {filteredPhotos.map((photo, index) => (
              <div
                key={index}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: "#f4f3ef",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(43, 52, 144, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  style={{
                    width: "100%",
                    height: "auto",
                    minHeight: "220px",
                    objectFit: "cover",
                    display: "block",
                  }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section style={{ padding: "72px 0", background: "#F5EFE4" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <div
            style={{
              background: "#2B3490",
              color: "#fff",
              padding: 28,
              borderLeft: "4px solid #D4A500",
              borderRadius: 8,
              fontSize: 15,
              lineHeight: 1.8,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>📸</span>
            <span>
              These photos capture the spirit of KSRM College of Engineering - from academic excellence and cultural celebrations to groundbreaking ceremonies and student achievements. Each moment represents our commitment to holistic development and community engagement.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
