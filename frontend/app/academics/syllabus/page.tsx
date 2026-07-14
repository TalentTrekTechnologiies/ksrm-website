"use client";

import { useState } from "react";
import PageResources from "@/components/PageResources";

const btechRegs = [
  { name: "R23UG (Current)", branches: "Computer Science & Engineering, CSE (AI & ML), CSE (Data Science), CSE (AI & ML Specialisation), Electronics & Communication Engineering, Electrical & Electronics Engineering, Civil Engineering, Mechanical Engineering" },
  { name: "R20UG", branches: "All B.Tech Branches" },
  { name: "R18UG", branches: "All B.Tech Branches" },
  { name: "R15UG (Archive)", branches: "All B.Tech Branches" },
];

const mtechRegs = [
  { name: "R22PG (Current)", branches: "All Specialisations" },
  { name: "R18PG", branches: "All Specialisations" },
];

const mbaRegs = [
  { name: "R25 (Current)", branches: "Management Studies" },
  { name: "R19 (Archive)", branches: "Management Studies" },
];

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function AccordionItem({
  title,
  regs,
  defaultOpen,
}: {
  title: string;
  regs: { name: string; branches: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`syl-accordion-item ${open ? "expanded" : ""}`}>
      <button className="syl-accordion-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <div className="syl-chevron"><ChevronDown /></div>
      </button>
      <div className="syl-accordion-content">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
          {regs.map((r) => (
            <div key={r.name} style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: 8, padding: 16 }}>
              <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#2B3490", margin: "0 0 12px" }}>{r.name}</h4>
              <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px", lineHeight: 1.6 }}>
                <strong>Branches:</strong><br />{r.branches}
              </p>
              <a href="#" className="syl-download-btn" target="_blank" rel="noopener noreferrer">
                <DownloadIcon />Download PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SyllabusPage() {
  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width:  1720px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .syl-hero {
          position: relative;
          background-image: url('/banners/syllabus.png');
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }
        .syl-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        .syl-hero > * { position: relative; z-index: 2; }
        .syl-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #D4A500;
        }
        .syl-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 24px;
        }
        .syl-breadcrumb a { color: #D4A500; text-decoration: none; }
        .syl-breadcrumb a:hover { opacity: 0.8; }
        .syl-breadcrumb span { color: #D4A500; }

        .syl-accordion { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
        .syl-accordion-item { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; overflow: hidden; }
        .syl-accordion-header {
          background: #2B3490; color: #fff; padding: 20px 24px; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700;
          transition: all 0.2s; border: none; width: 100%;
        }
        .syl-accordion-header:hover { background: #1e2570; }
        .syl-accordion-header .syl-chevron {
          width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .syl-accordion-item.expanded .syl-accordion-header .syl-chevron { transform: rotate(180deg); }
        .syl-accordion-content {
          padding: 0 24px; background: #f4f3ef; max-height: 0; overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .syl-accordion-item.expanded .syl-accordion-content { max-height: 2000px; padding: 24px; }
        .syl-download-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #D4A500; color: #2B3490; padding: 8px 14px; border-radius: 6px;
          font-size: 13px; font-weight: 700; font-family: 'Rajdhani', sans-serif;
          text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
        }
        .syl-download-btn:hover { background: #ffd700; transform: translateY(-2px); }

        .syl-note {
          background: #f4f3ef; border-left: 4px solid #2B3490; padding: 24px;
          border-radius: 8px; margin-top: 40px;
        }
        .syl-note p { color: #555; font-size: 16px; line-height: 1.7; margin: 0; }

        @media (max-width: 900px) {
          .syl-accordion-header { font-size: 15px; padding: 16px 20px; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="syl-hero">
          <div className="responsive-container">
            <div style={{ padding: "72px 0" }}>
              <div className="syl-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Syllabus</h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 700 }}>Regulation-wise syllabus for all programmes</p>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
              KSRM College of Engineering follows the academic syllabus prescribed by Jawaharlal Nehru Technological
              University Anantapur (JNTUA). Detailed regulation-wise syllabi are available for download below for
              all B.Tech, M.Tech and MBA programmes. The syllabi are designed to meet NBA accreditation standards
              and equip students with industry-relevant knowledge and skills.
            </p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>
              Download Syllabus by Programme
            </h2>
            <div className="syl-accordion">
              <AccordionItem title="B.Tech" regs={btechRegs} defaultOpen />
              <AccordionItem title="M.Tech" regs={mtechRegs} />
              <AccordionItem title="MBA" regs={mbaRegs} />
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <div className="syl-note">
              <p>For regulation-wise detailed syllabus PDFs, visit the Academics section or contact the respective
              department. Syllabi are issued by JNTUA and are subject to periodic updates. Please verify with the
              department for any recent amendments.</p>
            </div>
          </div>
        </section>

      <PageResources section="syllabus" docsCategory="SYLLABUS" docsTitle="Syllabus Downloads" />
      </main>
    </>
  );
}
