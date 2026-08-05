"use client";

import { useMemo, useState } from "react";
import PageResources from "@/components/PageResources";
import { getResearchPublic, ResearchRecord } from "@/lib/research-api";
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";

// Videos published to a page are stored as Gallery rows tagged with this
// category (same sentinel PageResources uses). Kept in one place so the
// featured video and the full list below read from the same source.
const VIDEO_CATEGORY = "__video__";

const missions = [
  "Create a conducive environment for quality research and innovation",
  "Promote industry-academia collaboration and knowledge transfer",
  "Facilitate resource mobilization for research and development",
  "Ensure ethical research practices and compliance with integrity standards",
  "Support research scholars and supervisors in achieving excellence",
];

const committee = [
  { name: "Sri K. Madan Mohan Reddy", designation: "Vice Chairman", dept: "Administration" },
  { name: "Dr. K. Chandra Obul Reddy", designation: "Managing Director", dept: "Administration" },
  { name: "Dr. T. Nageswara Prasad", designation: "Principal", dept: "Academic Administration" },
  { name: "Dr. M. Venkatanarayana", designation: "Professor, ECE & Dean, R&D Cell", dept: "Electronics & Communication Engineering" },
  // Spelt as the Academic Council records him. He replaced Sri A. Ramprakash
  // Reddy as HoD, CSE.
  { name: "Dr. P. Venkata Kishore", designation: "Head of Department", dept: "Computer Science & Engineering" },
  { name: "Dr. B. Bhaskar Reddy", designation: "Head of Department", dept: "Electronics & Communication Engineering" },
  { name: "Dr. G. Chennakesava Reddy", designation: "Head of Department", dept: "Civil Engineering" },
  { name: "Dr. M. S. Priyadarshini", designation: "Head of Department", dept: "Electrical & Electronics Engineering" },
  { name: "Dr. D. Ravikanth", designation: "Head of Department", dept: "Mechanical Engineering" },
];

const policies = [
  { icon: "📋", name: "RDC Policy", desc: "Overall research and development cell policies and procedures", file: "/documents/research/RDC-Policy.pdf" },
  { icon: "🔬", name: "Research Promotion Policy", desc: "Policy for promoting research activities among faculty and students", file: "/documents/research/Research-Promotion-Policy.pdf" },
  { icon: "💰", name: "Seed Fund Policy", desc: "Guidelines for seed funding schemes to support research initiation", file: "/documents/research/Seed-Funding-Scheme-Policy.pdf" },
  { icon: "⚖️", name: "Code of Ethics for Research", desc: "Ethical guidelines for research conduct, plagiarism prevention, and integrity", file: "/documents/research/Code-of-Ethics-Research-Innovation.pdf" },
  { icon: "🚀", name: "Startup & Innovation Policy", desc: "Policy framework for startup development and innovation initiatives", file: "/documents/research/Startup-Policy-KSRM-BICF.doc" },
  { icon: "🔐", name: "Intellectual Property Rights (IPR) Policy", desc: "Guidelines for intellectual property protection and management", file: "/documents/research/IPR-Policy.pdf" },
  { icon: "🤝", name: "Consultancy Policy", desc: "Framework for faculty and institutional consultancy projects", file: "/documents/research/Consultancy-Policy.pdf" },
];

const additionalDocs = [
  { name: "RDC Policy Framework", file: "/documents/research/RDC-Policy.pdf" },
  { name: "Research & Development Cell Guidelines", file: "/documents/research/Research%20and%20Development%20Cell%20(1).pdf" },
  { name: "Seed Funding Scheme", file: "/documents/research/Seed%20Funding%20Scheme%20Policy%20(1)%20(1).pdf" },
  { name: "Co-Working Agreement", file: "/documents/research/Co-Working_Agreement_KSRM-BICF.docx" },
];

const tabs = [
  { label: "📖 About RDC", id: "about" },
  { label: "📚 Publications", id: "publications" },
  { label: "🎬 Videos & Documents", id: "resources" },
  { label: "🎯 Vision & Mission", id: "vision" },
  { label: "👥 Advisory Committee", id: "committee" },
  { label: "📋 Policies & Guidelines", id: "policies" },
  { label: "📞 Contact", id: "contact" },
];

const ALL_DEPARTMENTS = "All Departments";

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4A500" }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4A500" }}>
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4A500" }}>
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
}

export default function ResearchPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // No departmentId argument = every department's research, whereas a
  // department page passes its own id and gets only its own. Research is
  // entered per-department (the admin has no global "add research" screen), so
  // without this the institution's own output appeared nowhere on its Research
  // page. Polled like the rest of the public site, so a record published in a
  // department's workspace shows up here without a refresh.
  const records = useLiveData<ResearchRecord[]>(
    () => getResearchPublic().catch(() => [] as ResearchRecord[]),
    [],
  );
  const [deptFilter, setDeptFilter] = useState<string>(ALL_DEPARTMENTS);

  // Research videos = videos routed to the Research page via the Media
  // Library's "Show on page". Polled, so uploading one makes it appear and
  // deleting one makes it disappear here without a refresh - which the static
  // hard-coded clip never did.
  const researchVideos = useLiveData<GalleryImage[]>(
    () =>
      getGalleryPublic(undefined, undefined, "research")
        .then((rows) => rows.filter((g) => g.category === VIDEO_CATEGORY))
        .catch(() => [] as GalleryImage[]),
    [],
  );

  const departments = useMemo(() => {
    const names = new Set((records ?? []).map((r) => r.department).filter(Boolean));
    return [ALL_DEPARTMENTS, ...Array.from(names).sort()];
  }, [records]);

  const visible = useMemo(() => {
    const all = records ?? [];
    return deptFilter === ALL_DEPARTMENTS ? all : all.filter((r) => r.department === deptFilter);
  }, [records, deptFilter]);

  return (
    <div>
      <style>{`
        .rdc-hero-btn {
          padding: 10px 20px; border: none; border-radius: 8px; background: #2B3490;
          color: #D4A500; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: all 0.3s; font-size: 15px;
        }
        .rdc-hero-btn:hover { background: #1e2570; }
        .rdc-policy-card { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); border-radius: 8px; padding: 24px; color: #fff; display: flex; flex-direction: column; gap: 12px; transition: all 0.3s; }
        .rdc-policy-card:hover { transform: translateY(-4px); }
        .rdc-policy-link {
          margin-top: auto; display: flex; align-items: center; gap: 8px; color: #D4A500;
          text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 12px;
          border-radius: 4px; background: rgba(255,230,25,0.1);
        }
        .rdc-committee-card {
          background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px;
          text-align: center; position: relative;
        }
        .rdc-doc-link {
          display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff;
          border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #2B3490;
        }
        .rdc-contact-link {
          display: flex; align-items: center; gap: 12px; justify-content: center; color: #2B3490;
          text-decoration: none; font-weight: 600; font-size: 15px; padding: 8px 12px;
          background: rgba(255,230,25,0.1); border-radius: 4px;
        }
        .rdc-filter-btn {
          padding: 8px 16px; border: 1px solid #ccc; border-radius: 20px; background: #fff;
          color: #444; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
        }
        .rdc-filter-btn:hover { border-color: #2B3490; color: #2B3490; }
        .rdc-pub-card {
          background: #fff; border: 1px solid #ddd; border-left: 4px solid #D4A500;
          border-radius: 8px; padding: 20px 22px; transition: box-shadow 0.2s;
        }
        .rdc-pub-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
        .rdc-pub-type {
          background: #2B3490; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase; padding: 3px 9px; border-radius: 4px;
        }
        .rdc-pub-dept {
          background: #eef1ff; color: #2B3490; font-size: 12px; font-weight: 700;
          padding: 3px 9px; border-radius: 4px;
        }
      `}</style>

      {/* HERO */}
      <section
        style={{
          backgroundImage: "url('/banners/research.png')", backgroundSize: "cover", backgroundPosition: "center",
          backgroundColor: "#2B3490", padding: "80px 0", color: "#fff", position: "relative", overflow: "hidden",
          minHeight: 320, display: "flex", alignItems: "flex-end",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)" }} />
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#D4A500", fontWeight: 600, margin: "0 0 8px" }}><CmsText section="research" slot="research-excellence" /></p>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 16px", fontFamily: "'Rajdhani', sans-serif" }}><CmsText section="research" slot="research-development-cell-rdc" /></h1>
          <p style={{ fontSize: 18, color: "#D4A500", fontWeight: 600, margin: "0 0 24px" }}><CmsText section="research" slot="advancing-knowledge-through-research-innovation" /></p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#e0e0e0", margin: 0, maxWidth: 600 }}><CmsText section="research" slot="the-research-and-development-cell" multiline /></p>
        </div>
      </section>

      {/* STICKY TAB BAR */}
      <section style={{ padding: "40px 0", background: "#f4f3ef", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {tabs.map((t, _i) => (
              <button key={t.id} className="rdc-hero-btn" onClick={() => scrollTo(t.id)}><CmsText section="research" slot={`tabs.${_i}.label`} /></button>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }} id="about">
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}><CmsText section="research" slot="about-the-research-development-cell" /></h2>
          <div style={{ background: "#f9f9f9", borderLeft: "4px solid #D4A500", borderRadius: 8, padding: 28, fontSize: 16, lineHeight: 1.9, color: "#444" }}>
            <p style={{ margin: "0 0 16px" }}><CmsText section="research" slot="the-research-and-development-cell-2" multiline /></p>
            <p style={{ margin: "0 0 16px" }}><CmsText section="research" slot="rdc-encourages-faculty-to-conceive" multiline /></p>
            <p style={{ margin: 0 }}><CmsText section="research" slot="rdc-ensures-that-researchers-understand" multiline /></p>
          </div>
        </div>
      </section>

      {/* PUBLICATIONS - aggregated from every department's CMS records */}
      <section style={{ padding: "80px 0", background: "#f4f3ef", borderTop: "1px solid #e8e8e8" }} id="publications">
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}><CmsText section="research" slot="research-publications" /></h2>
          <p style={{ color: "#666", fontSize: 15, margin: "0 0 28px" }}><CmsText section="research" slot="publications-projects-and-patents-from" /></p>

          {records === null ? (
            <p style={{ color: "#888", fontSize: 15 }}><CmsText section="research" slot="loading-research-records" /></p>
          ) : records.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 28, color: "#666", fontSize: 15 }}>
              No research records have been published yet. They appear here as departments add them.
            </div>
          ) : (
            <>
              {departments.length > 2 && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                  {departments.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDeptFilter(d)}
                      className="rdc-filter-btn"
                      style={
                        deptFilter === d
                          ? { background: "#2B3490", color: "#D4A500", borderColor: "#2B3490" }
                          : undefined
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              <p style={{ color: "#666", fontSize: 14, margin: "0 0 16px" }}>
                Showing <strong style={{ color: "#2B3490" }}>{visible.length}</strong>{" "}
                {visible.length === 1 ? "record" : "records"}
                {deptFilter !== ALL_DEPARTMENTS ? ` in ${deptFilter}` : ""}
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                {visible.map((r) => (
                  <article key={r.id} className="rdc-pub-card">
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span className="rdc-pub-type">{r.type}</span>
                      <span className="rdc-pub-dept">{r.department}</span>
                      <span style={{ color: "#888", fontSize: 13, fontWeight: 600 }}>{r.year}</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a2e", margin: "0 0 6px", lineHeight: 1.45 }}>
                      {r.title}
                    </h3>
                    <p style={{ color: "#555", fontSize: 14, margin: "0 0 6px" }}>{r.authors}</p>
                    {r.journal && (
                      <p style={{ color: "#777", fontSize: 14, fontStyle: "italic", margin: "0 0 8px" }}>{r.journal}</p>
                    )}
                    {(r.doiOrLink || r.attachmentUrl) && (
                      <a
                        href={r.doiOrLink || r.attachmentUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rdc-contact-link"
                        style={{ justifyContent: "flex-start", display: "inline-flex", fontSize: 14 }}
                      >
                        {r.doiOrLink ? "View publication" : "Download attachment"}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* INNOVATION HEADING */}
      <section style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 40px" }}><CmsText section="research" slot="innovation-student-projects" /></h2>
        </div>
      </section>

      {/* RESEARCH VIDEOS - every video routed to the Research page, all in one
          place in the featured style. Polled, so uploads/deletes reflect. Falls
          back to the static clip only when none have been added. The documents
          list below intentionally omits videos (hideVideos) so they aren't
          shown twice. */}
      <section id="resources" style={{ padding: "80px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 40px", textAlign: "center" }}><CmsText section="research" slot="research-videos" /></h2>
          {researchVideos && researchVideos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: researchVideos.length === 1 ? "1fr" : "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 28,
                maxWidth: researchVideos.length === 1 ? 720 : 1200,
                margin: "0 auto",
              }}
            >
              {researchVideos.map((v) => (
                // Hide the whole tile if the video file can't load (e.g. the
                // underlying media was deleted but this published row lingers),
                // so a removed video never shows as a dead black box.
                <div key={v.imageUrl} data-research-video>
                  <div style={{ borderRadius: 8, overflow: "hidden", background: "#000" }}>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video
                      controls
                      loop
                      muted
                      playsInline
                      onError={(e) => {
                        const tile = (e.currentTarget.closest("[data-research-video]") as HTMLElement | null)
                        if (tile) tile.style.display = "none"
                      }}
                      style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}
                    >
                      <source src={v.imageUrl} type="video/mp4" />
                    </video>
                  </div>
                  {v.title && (
                    <p style={{ textAlign: "center", marginTop: 12, fontWeight: 600, color: "#2B3490" }}>{v.title}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 8, overflow: "hidden", maxWidth: 720, margin: "0 auto" }}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
                <source src="/videos/3d-robo.mp4" type="video/mp4" />
              </video>
            </div>
          )}
        </div>
      </section>

      {/* Documents (and any images) routed to the Research page. Videos are
          hidden here - they're all shown in the single section above. */}
      <PageResources
        section="research"
        background="#f4f3ef"
        heading="📄 Research Papers & Documents"
        galleryTitle="Research Gallery"
        docsTitle="Research Papers & Documents"
        hideVideos
      />

      {/* VISION & MISSION */}
      <section style={{ padding: "80px 0", background: "#f4f3ef", borderTop: "1px solid #e8e8e8" }} id="vision">
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}><CmsText section="research" slot="vision-mission" /></h2>
          <div style={{ background: "#fff", border: "2px solid #D4A500", borderRadius: 8, padding: 24, marginBottom: 48 }}>
            <h3 style={{ color: "#2B3490", fontWeight: 700, margin: "0 0 12px" }}><CmsText section="research" slot="vision" /></h3>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, margin: 0 }}><CmsText section="research" slot="to-establish-a-robust-mechanism" multiline /></p>
          </div>
          <h3 style={{ color: "#2B3490", fontWeight: 700, margin: "0 0 20px", fontSize: 18 }}><CmsText section="research" slot="our-missions" /></h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {missions.map((m, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: "#2B3490", fontWeight: 700, marginBottom: 8 }}>MISSION {i + 1}</div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>{m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVISORY COMMITTEE */}
      <section style={{ padding: "80px 0", background: "#fff", borderTop: "1px solid #e8e8e8" }} id="committee">
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px", display: "flex", alignItems: "center", gap: 12 }}>
            <UsersIcon />
            Advisory Committee
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {committee.map((c, i) => (
              <div className="rdc-committee-card" key={c.name}>
                <div style={{ position: "absolute", top: 12, right: 12, background: "#D4A500", color: "#2B3490", borderRadius: "50%", width: 24, height: 24, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12, color: "#D4A500", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>COMMITTEE MEMBER</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}><CmsText section="research" slot={`committee.${i}.name`} /></h3>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", fontWeight: 600 }}><CmsText section="research" slot={`committee.${i}.designation`} /></p>
                <p style={{ fontSize: 12, color: "#999", margin: 0 }}><CmsText section="research" slot={`committee.${i}.dept`} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLICIES */}
      <section style={{ padding: "80px 0", background: "#f4f3ef", borderTop: "1px solid #e8e8e8" }} id="policies">
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}><CmsText section="research" slot="policies-guidelines" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {policies.map((p, _i) => (
              <div className="rdc-policy-card" key={p.name}>
                <div style={{ fontSize: 28 }}>{p.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#D4A500" }}><CmsText section="research" slot={`policies.${_i}.name`} /></h3>
                <p style={{ fontSize: 13, color: "#d0d0d0", lineHeight: 1.6, margin: 0 }}><CmsText section="research" slot={`policies.${_i}.desc`} /></p>
                <a href={p.file} download className="rdc-policy-link"><DownloadIcon />Download PDF</a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 60 }}>
            <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 24px" }}><CmsText section="research" slot="additional-resources-documents" /></h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {additionalDocs.map((d, _i) => (
                <a href={d.file} download className="rdc-doc-link" key={d.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: "#eef1ff", borderRadius: 6 }}>
                    <FileIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}><CmsText section="research" slot={`additionalDocs.${_i}.name`} /></p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#999" }}>Download →</p>
                  </div>
                  <span style={{ color: "#D4A500" }}><DownloadIcon /></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "80px 0", background: "#fff", borderTop: "1px solid #e8e8e8" }} id="contact">
        <div style={{ maxWidth: 1760, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}><CmsText section="research" slot="contact-rdc" /></h2>
          <div style={{ background: "#eef1ff", borderRadius: 8, padding: "16px 24px", marginBottom: 24, fontSize: 14, color: "#2B3490", fontWeight: 600, display: "inline-block" }}>
            📍 K.S.R.M. College of Engineering, Cuddapah – 516003, Andhra Pradesh
          </div>
          <div style={{ background: "#f9f9f9", border: "2px solid #D4A500", borderRadius: 8, padding: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}><CmsText section="research" slot="dr-m-venkatanarayana" /></h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", fontWeight: 600 }}><CmsText section="research" slot="dean-research-development-cell" /></p>
            <p style={{ fontSize: 12, color: "#999", margin: "0 0 20px" }}><CmsText section="research" slot="professor-electronics-communication-engineering" /></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="tel:+919440425221" className="rdc-contact-link"><PhoneIcon />+91 94404 25221</a>
              <a href="mailto:dean.rdc@ksrmce.ac.in" className="rdc-contact-link"><MailIcon />dean.rdc@ksrmce.ac.in</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
