"use client";

import { useState } from "react";
import type { Department } from "@/types/department";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "vision-mission", label: "Vision & Mission" },
  { id: "specializations", label: "Specializations" },
  { id: "hod", label: "HOD" },
  { id: "faculty", label: "Faculty" },
  { id: "programmes", label: "Programmes" },
  { id: "labs", label: "Laboratories" },
  { id: "outcomes", label: "Outcomes" },
];

export default function DepartmentPage({ department }: { department: Department }) {
  const [activeTab, setActiveTab] = useState("about");

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) {
          .responsive-container { padding-left: 32px; padding-right: 32px; }
        }
        @media (max-width: 768px) {
          .responsive-container { padding-left: 20px; padding-right: 20px; }
        }
        @media (max-width: 480px) {
          .responsive-container { padding-left: 14px; padding-right: 14px; }
        }

        .dept-hero {
          position: relative;
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .dept-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        .dept-hero > * { position: relative; z-index: 2; }

        .dept-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #D4A500;
          margin-bottom: 16px;
        }
        .dept-hero-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.08;
          margin: 0;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .dept-hero-tagline {
          color: rgba(255,255,255,0.85);
          font-size: 18px;
          line-height: 1.6;
          margin: 16px 0 0;
          font-weight: 300;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }

        .dept-sticky-nav {
          position: sticky;
          top: 48px;
          background: #fff;
          border-bottom: 1px solid #eef0f3;
          z-index: 100;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dept-sticky-nav::-webkit-scrollbar { display: none; }
        .dept-nav-container {
          display: flex;
          gap: 8px;
          padding: 12px 5%;
          min-width: max-content;
        }
        .dept-nav-pill {
          padding: 10px 18px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dept-nav-pill.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .dept-nav-pill:hover { border-color: #2B3490; }

        .dept-section-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 24px;
        }
        .dept-section-title-sm {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.6rem, 2.8vw, 2.2rem);
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 24px;
        }

        .dept-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 16px;
          padding: 32px;
        }

        .dept-vision-quote {
          border-left: 4px solid #D4A500;
          padding-left: 24px;
          margin: 24px 0;
        }

        .dept-mission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-mission-item {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 16px;
          padding: 32px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .dept-mission-num {
          width: 32px; height: 32px;
          border-radius: 50px;
          background: #D4A500;
          color: #2B3490;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 700;
          flex-shrink: 0;
        }

        .dept-ai-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .dept-ai-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s;
        }
        .dept-ai-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .dept-ai-card p {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .dept-hod-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 48px;
        }
        @media (max-width: 768px) {
          .dept-hod-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }

        .dept-faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }
        @media (max-width: 1024px) {
          .dept-faculty-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        }
        @media (max-width: 640px) {
          .dept-faculty-grid { grid-template-columns: 1fr; }
        }
        .dept-faculty-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .dept-faculty-card.hod {
          border: 2px solid #D4A500;
          box-shadow: 0 8px 32px rgba(255, 230, 25, 0.12);
        }
        .dept-faculty-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.12);
        }
        .dept-faculty-photo {
          width: 100%;
          aspect-ratio: 3 / 3.5;
          border-radius: 12px 12px 0 0;
          overflow: hidden;
          background: linear-gradient(135deg, #2B3490, #1e2570);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .dept-faculty-hod-badge {
          position: absolute;
          top: 12px; right: 12px;
          background: #D4A500;
          color: #1a1a2e;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          letter-spacing: 0.5px;
          z-index: 10;
        }
        .dept-faculty-initials {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(255,230,25,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .dept-faculty-initials p {
          color: #D4A500;
          font-size: 20px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          margin: 0;
          letter-spacing: 1px;
        }
        .dept-faculty-info { padding: 20px; }
        .dept-faculty-info h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px; font-weight: 700; color: #1a1a2e;
          margin: 0 0 6px;
        }
        .dept-faculty-designation {
          color: #D4A500;
          font-size: 12px; font-weight: 700;
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .dept-faculty-qual { color: #777; font-size: 13px; margin: 0 0 12px; line-height: 1.4; }
        .dept-faculty-spec {
          display: inline-block;
          background: #eef1ff;
          color: #2B3490;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px; font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          line-height: 1.2;
        }

        .dept-programmes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-prog-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
          gap: 12px;
          margin-top: 8px;
        }

        .dept-labs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-lab-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .dept-lab-img { position: relative; width: 100%; height: 200px; overflow: hidden; }
        .dept-lab-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
        .dept-lab-body { padding: 20px; }
        .dept-lab-body h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0;
        }
        .dept-lab-body p { color: #666; font-size: 15px; line-height: 1.6; margin: 8px 0 0; }

        .dept-outcomes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-pos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .dept-po-item {
          background: #f7f8fa;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #eef0f3;
        }
        .dept-po-item h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px; font-weight: 700; color: #2B3490;
          margin: 0 0 6px;
        }
        .dept-po-item p { color: #555; font-size: 13px; line-height: 1.6; margin: 0; }

        @media (max-width: 900px) {
          .dept-programmes-grid, .dept-labs-grid, .dept-outcomes-grid,
          .dept-pos-grid, .dept-mission-grid, .dept-faculty-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        {/* HERO */}
        <section
          className="dept-hero"
          style={{ backgroundImage: `url('${department.heroImage}')` }}
        >
          <div className="responsive-container">
            <div className="dept-eyebrow">{department.shortName}</div>
            <h1 className="dept-hero-title">{department.name}</h1>
            <p className="dept-hero-tagline">{department.tagline}</p>
          </div>
        </section>

        {/* STICKY NAV */}
        <div className="dept-sticky-nav">
          <div className="dept-nav-container">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`dept-nav-pill ${activeTab === item.id ? "active" : ""}`}
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <section id="about" style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title">About the Department</h2>
            <p style={{ color: "#555", fontSize: 17, lineHeight: 1.8, margin: 0, maxWidth: 900 }}>
              {department.about}
            </p>
          </div>
        </section>

        {/* AI HIGHLIGHTS */}
        {department.aiHighlights?.length > 0 && (
          <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 48 }}>
                🤖 AI-Enabled Highlights
              </h2>
              <div className="dept-ai-grid">
                {department.aiHighlights.map((h, i) => (
                  <div className="dept-ai-card" key={i}>
                    <h3>✨ {h.title}</h3>
                    <p>{h.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VISION & MISSION */}
        <section id="vision-mission" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <div style={{ maxWidth: 820, marginBottom: 56 }}>
              <h2 className="dept-section-title">Vision</h2>
              <div className="dept-vision-quote">
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18, fontWeight: 600, color: "#2B3490",
                  lineHeight: 1.6, margin: 0,
                }}>
                  &quot;{department.vision}&quot;
                </p>
              </div>
            </div>
            <div>
              <h2 className="dept-section-title">Mission</h2>
              <div className="dept-mission-grid">
                {department.mission.map((m, i) => (
                  <div className="dept-mission-item" key={i}>
                    <div className="dept-mission-num">{i + 1}</div>
                    <p style={{ color: "#555", fontSize: 16, lineHeight: 1.7, margin: 0 }}>{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOD */}
        <section id="hod" style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 40 }}>Head of Department</h2>
            <div className="dept-hod-grid">
              <div>
                <div style={{
                  width: "100%", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden",
                  background: "linear-gradient(135deg, #2B3490, #1e2570)",
                  display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                }}>
                  {department.hod.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={department.hod.photo} alt={department.hod.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                  ) : null}
                </div>
                <div className="dept-card" style={{ marginTop: 24 }}>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                    {department.hod.name}
                  </h3>
                  <p style={{ color: "#2B3490", fontSize: 12, fontWeight: 700, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {department.hod.designation}
                  </p>
                  <p style={{ color: "#666", fontSize: 15, margin: "0 0 16px", borderTop: "1px solid #eef0f3", paddingTop: 12 }}>
                    {department.hod.qualification}
                  </p>
                  <a href={`mailto:${department.hod.email}`} style={{ color: "#2B3490", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>
                    {department.hod.email}
                  </a>
                </div>
              </div>
              <div style={{ paddingTop: 20 }}>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
                  Message
                </h3>
                {department.hod.message.map((p, i) => (
                  <p key={i} style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: "0 0 16px" }}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FACULTY */}
        <section id="faculty" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Our Faculty</h2>
            <div className="dept-faculty-grid">
              {department.faculty.map((f, i) => {
                const initials = f.name
                  .replace(/^(Dr\.|Sri\.|Smt\.)\s*/, "")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();
                const isHod = f.designation.toLowerCase().includes("head");
                return (
                  <div className={`dept-faculty-card ${isHod ? "hod" : ""}`} key={i}>
                    <div className="dept-faculty-photo">
                      {isHod && <div className="dept-faculty-hod-badge">HOD</div>}
                      {f.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.photo} alt={f.name} loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                      ) : (
                        <div className="dept-faculty-initials"><p>{initials}</p></div>
                      )}
                    </div>
                    <div className="dept-faculty-info">
                      <h3>{f.name}</h3>
                      <p className="dept-faculty-designation">{f.designation}</p>
                      <p className="dept-faculty-qual">{f.qualification}</p>
                      <div className="dept-faculty-spec">{f.specialization}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PROGRAMMES */}
        <section id="programmes" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Programmes Offered</h2>
            <div className="dept-programmes-grid">
              {department.programmes.map((p, i) => (
                <div className="dept-card" key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 17, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                    {p.name}
                  </h3>
                  <div className="dept-prog-details">
                    <div>
                      <p style={{ color: "#666", fontSize: 13, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Level</p>
                      <p style={{ color: "#1a1a2e", fontSize: 15, fontWeight: 600, margin: 0 }}>{p.level}</p>
                    </div>
                    <div>
                      <p style={{ color: "#666", fontSize: 13, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Intake</p>
                      <p style={{ color: "#1a1a2e", fontSize: 15, fontWeight: 600, margin: 0 }}>{p.intake}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LABORATORIES */}
        <section id="labs" style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Laboratories</h2>
            <div className="dept-labs-grid">
              {department.labs.map((lab, i) => (
                <div className="dept-lab-card" key={i}>
                  <div className="dept-lab-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lab.imageUrl} alt={lab.name} loading="lazy" />
                  </div>
                  <div className="dept-lab-body">
                    <h3>{lab.name}</h3>
                    <p>{lab.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUTCOMES: PEOs / PSOs / POs */}
        <section id="outcomes" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <div style={{ marginBottom: 56 }}>
              <h2 className="dept-section-title-sm">Programme Educational Objectives (PEOs)</h2>
              <div className="dept-outcomes-grid">
                {department.peos.map((peo) => (
                  <div className="dept-card" key={peo.code}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 17, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                      {peo.code}
                    </h3>
                    <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{peo.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 56 }}>
              <h2 className="dept-section-title-sm">Programme Specific Outcomes (PSOs)</h2>
              <div className="dept-outcomes-grid">
                {department.psos.map((pso) => (
                  <div className="dept-card" key={pso.code}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                      {pso.code}
                    </h3>
                    <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{pso.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="dept-section-title-sm">Programme Outcomes (POs) - NBA Standards</h2>
              <div className="dept-pos-grid">
                {department.pos.map((po) => (
                  <div className="dept-po-item" key={po.code}>
                    <h4>{po.code}: {po.title}</h4>
                    <p>{po.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
