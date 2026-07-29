"use client";

import Link from "next/link";
import { getCareersPublic, Career } from "@/lib/careers-api";
import { useLiveData } from "@/lib/use-live-data";
import PageResources from "@/components/PageResources";

function applyHref(o: { careerId: number | null; title: string; dept: string }) {
  const q = new URLSearchParams();
  if (o.careerId != null) q.set("careerId", String(o.careerId));
  q.set("title", o.title);
  if (o.dept && o.dept !== "—") q.set("dept", o.dept);
  return `/careers/apply?${q.toString()}`;
}

const whyJoin = [
  { icon: "📖", title: "Excellence in Education", desc: "Join an institution recognized for academic excellence" },
  { icon: "⚡", title: "Research Opportunities", desc: "Contribute to cutting-edge research initiatives" },
  { icon: "👥", title: "Supportive Culture", desc: "Work in a collaborative and supportive environment" },
  { icon: "🏆", title: "Career Growth", desc: "Access professional development and advancement opportunities" },
];

interface OpeningDisplay {
  careerId: number | null;
  title: string;
  dept: string;
  type: string;
  location: string;
}

const FALLBACK_OPENINGS: OpeningDisplay[] = [
  { careerId: null, title: "Assistant Professor - CSE", dept: "Computer Science & Engineering", type: "M.Tech/Ph.D. in Computer Science", location: "0-2 years" },
  { careerId: null, title: "Lab Technician - ECE", dept: "Electronics & Communication", type: "Diploma/B.Tech in Electronics", location: "2-3 years" },
  { careerId: null, title: "Administrative Officer", dept: "Administration", type: "Bachelor's Degree", location: "3-5 years" },
];

export default function CareersPage() {
  // Polled, so an opening published in the admin appears here without a
  // refresh. On an empty list or a failed fetch the fallback openings stay -
  // useLiveData keeps the last good value rather than blanking the page.
  const openings =
    useLiveData<OpeningDisplay[]>(
      () =>
        getCareersPublic().then((items: Career[]) =>
          items.length === 0
            ? FALLBACK_OPENINGS
            : items.map((o) => ({
                careerId: o.id,
                title: o.title,
                dept: o.department ?? "—",
                type: o.employmentType ?? "—",
                location: o.location ?? "—",
              })),
        ),
      [],
      { initialValue: FALLBACK_OPENINGS },
    ) ?? FALLBACK_OPENINGS;

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .car-hero { position: relative; background-image: url('/banners/careers.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .car-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); pointer-events: none; }
        .car-hero > * { position: relative; z-index: 2; }
        .car-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .car-breadcrumb a { color: #D4A500; text-decoration: none; }
        .car-whyjoin-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin: 32px 0; }
        .car-whyjoin-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; }
        .car-whyjoin-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; margin: 0 0 12px; display: flex; align-items: center; gap: 12px; }
        .car-whyjoin-card p { font-size: 15px; color: #666; margin: 0; }
        .car-opening-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
        .car-opening-title { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .car-cta-button { display: inline-block; background: #D4A500; color: #1a1a2e; padding: 16px 40px; border-radius: 8px; font-weight: 700; text-decoration: none; font-family: 'Rajdhani', sans-serif; border: none; margin: 24px 0; }
        @media (max-width: 1760px) { .car-whyjoin-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="car-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Careers at KSRM</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 600 }}>Join Our Team of Excellence</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Why Join KSRM?</h2>
          <div className="car-whyjoin-grid">
            {whyJoin.map((w) => (
              <div className="car-whyjoin-card" key={w.title}>
                <h3><span>{w.icon}</span>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Current Openings</h2>
          {openings.map((o) => (
            <div className="car-opening-card" key={o.title}>
              <p className="car-opening-title">{o.title}</p>
              <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}><span style={{ fontWeight: 600, color: "#2B3490" }}>Department:</span> {o.dept}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <p style={{ color: "#666", fontSize: 13, margin: 0 }}><span style={{ fontWeight: 600, color: "#2B3490" }}>Type:</span> {o.type}</p>
                <p style={{ color: "#666", fontSize: 13, margin: 0 }}><span style={{ fontWeight: 600, color: "#2B3490" }}>Location:</span> {o.location}</p>
              </div>
              <Link
                href={applyHref(o)}
                className="car-cta-button"
                style={{ marginTop: 12, marginBottom: 0, fontSize: 14, padding: "12px 24px" }}
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "linear-gradient(135deg, #2B3490, #1e2570)", textAlign: "center" }}>
        <div className="responsive-container">
          <h2 style={{ color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 24px" }}>Ready to Join KSRM?</h2>
          <Link href="/careers/apply" className="car-cta-button">Submit a General Application</Link>
        </div>
      </section>
    
      <PageResources section="careers" />
      </main>
  );
}
