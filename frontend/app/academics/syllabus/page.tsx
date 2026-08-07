"use client";

import { useState } from "react";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import {
  getDepartmentProgrammesPublic,
  DepartmentProgramme,
  ProgrammeLevel,
} from "@/lib/department-programmes-api";
import { useLiveData } from "@/lib/use-live-data";
import { resolveFileUrl } from "@/lib/api-base";

// Each regulation carries the code that appears in its syllabus filenames, so
// a card can find the PDFs uploaded for it. Without this the cards were purely
// decorative: every "Download PDF" button was href="#" and downloaded nothing.
const btechRegs = [
  // R26 applies to the batch admitted in AY 2026-27, so it leads the list.
  // R23 stays here rather than being retired: the three senior years are still
  // studying under it.
  { code: "R26", name: "R26 (AY 2026-27 intake)" },
  { code: "R23", name: "R23" },
  { code: "R20", name: "R20" },
  { code: "R18", name: "R18" },
  { code: "R15", name: "R15 (Archive)" },
];

const mtechRegs = [
  { code: "R22", name: "R22 (Current)" },
  { code: "R18PG", name: "R18PG" },
];

const mbaRegs = [
  { code: "R25", name: "R25 (Current)" },
  { code: "R19", name: "R19 (Archive)" },
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

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/**
 * The branches a programme is offered in, from Admin -> Academics.
 *
 * Not a hardcoded list: the college adds and retires specialisations, and a
 * syllabus page that has to be redeployed to show a new branch is a syllabus
 * page that will be wrong. The names come from the same programme rows that
 * drive Courses & Intake, so the two pages can never disagree.
 *
 * The short form is what appears in a filename - the college names these
 * "Computer Science and Engineering(R23)" - so it is what a document is
 * matched on.
 */
function branchAliases(name: string): string[] {
  // MBA has no specialisation text after the prefix - stripping it left
  // nothing to match a document against, so no MBA syllabus could ever be
  // found regardless of what was uploaded. Fall back to the full name.
  const stripped = name.replace(/^(B\.?Tech|M\.?Tech|MBA)\s*-?\s*/i, "").trim();
  const n = stripped || name.trim();
  const aliases = [n];
  const known: Record<string, string[]> = {
    "Computer Science & Engineering": ["Computer Science and Engineering", "CSE"],
    "Electronics & Communication Engineering": ["Electronics and Communication Engineering", "ECE"],
    "Electrical & Electronics Engineering": ["Electrical and Electronics Engineering", "EEE"],
    "Mechanical Engineering": ["Mechanical", "ME"],
    "Civil Engineering": ["Civil", "CE"],
    "CSE (AIML)": ["AIML", "AI & ML", "Artificial Intelligence and Machine Learning"],
    "CSE (Data Science)": ["Data Science", "AIDS"],
    "AIML": ["Artificial Intelligence and Machine Learning", "AI & ML"],
    "AIDS": ["Artificial Intelligence and Data Science", "Data Science"],
    "Power Systems": ["PS", "Power System"],
    "VLSI & Embedded Systems": ["VLSI", "Embedded Systems"],
    "Structural Engineering": ["Structural"],
    "Geotechnical Engineering": ["Geotechnical", "GE"],
  };
  return [...aliases, ...(known[n] ?? [])];
}

/** Does this document belong to this branch? Matched on the filename wording. */
function docMatchesBranch(title: string, name: string): boolean {
  const t = title.toLowerCase();
  return branchAliases(name).some((a) => a.length > 1 && t.includes(a.toLowerCase()));
}

/**
 * One branch, with its syllabus for each regulation.
 *
 * The page used to list regulations only, each card naming its branches in a
 * sentence - so a CSE student hunting for their syllabus read five paragraphs
 * of branch names to find which regulation mentioned theirs, then scanned an
 * undifferentiated pile of PDFs. Branch first, regulation second, which is the
 * order a student actually knows the answers in.
 */
function BranchPanel({
  branch,
  regs,
  docs,
}: {
  branch: string;
  regs: { code: string; name: string }[];
  docs: Download[];
}) {
  const mine = docs.filter((d) => docMatchesBranch(d.title, branch));
  const label = branch.replace(/^(B\.?Tech|M\.?Tech|MBA)\s*-?\s*/i, "").trim();

  return (
    <div className="syl-branch-card">
      <h4 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#2B3490", margin: "0 0 12px" }}>
        {label}
      </h4>

      {mine.length === 0 ? (
        <div className="syl-empty-state">
          <DownloadIcon />
          Syllabus not published yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {regs.map((r) => {
            // \\b, not \b: inside a template literal \b is the backspace
            // character, so the regex became /\x08R23\x08/ and matched nothing.
            const forReg = mine.filter((d) => new RegExp(`\\b${r.code}\\b`, "i").test(d.title));
            if (forReg.length === 0) return null;
            return (
              <div key={r.code}>
                <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: "#999", margin: "0 0 6px" }}>
                  {r.name}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {forReg.map((d) => (
                    <a key={d.id} href={resolveFileUrl(d.fileUrl)} className="syl-download-btn" target="_blank" rel="noopener noreferrer">
                      <span className="syl-doc-icon"><DownloadIcon /></span>
                      <span className="syl-doc-title">{d.title}</span>
                      <span className="syl-doc-arrow"><ChevronRight /></span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {/* A syllabus whose filename names no regulation still has to be
              reachable, or uploading one with a different naming convention
              would make it silently vanish. */}
          {(() => {
            const unmatched = mine.filter(
              (d) => !regs.some((r) => new RegExp(`\\b${r.code}\\b`, "i").test(d.title)),
            );
            if (unmatched.length === 0) return null;
            return (
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: "#999", margin: "0 0 6px" }}>
                  Other
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {unmatched.map((d) => (
                    <a key={d.id} href={resolveFileUrl(d.fileUrl)} className="syl-download-btn" target="_blank" rel="noopener noreferrer">
                      <span className="syl-doc-icon"><DownloadIcon /></span>
                      <span className="syl-doc-title">{d.title}</span>
                      <span className="syl-doc-arrow"><ChevronRight /></span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function ProgrammeAccordion({
  title,
  branches,
  regs,
  docs,
  defaultOpen,
}: {
  title: string;
  branches: string[];
  regs: { code: string; name: string }[];
  docs: Download[];
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
        {branches.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", marginTop: 16 }}>
            Branches will appear here once they are added in Admin &rarr; Academics.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
            {branches.map((b) => (
              <BranchPanel key={b} branch={b} regs={regs} docs={docs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SyllabusPage() {
  const docs = useLiveData<Download[]>(
    () => getDownloadsPublic("SYLLABUS").catch(() => [] as Download[]),
    [],
  );
  const syllabi = docs ?? [];

  // Branches come from the same programme rows that drive Courses & Intake, so
  // adding a specialisation there puts it on this page too - no deployment,
  // and the two pages cannot disagree about what the college offers.
  const programmes = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    [],
  );
  const named = (level: ProgrammeLevel, match: RegExp) =>
    [
      ...new Set(
        (programmes ?? [])
          .filter((p) => p.level === level && p.isActive !== false && match.test(p.name))
          .map((p) => p.name),
      ),
    ].sort();

  const btechBranches = named("UG", /./);
  // MBA is a PG programme but has its own regulations and no specialisations,
  // so it is listed separately rather than as an M.Tech branch.
  const mtechBranches = named("PG", /tech/i);
  const mbaBranches = named("PG", /mba/i);

  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .syl-hero {
          position: relative;
          background-image: url('/banners/syllabus.webp');
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
          display: flex; align-items: center; gap: 10px;
          background: #fff; color: #1a1a2e; padding: 9px 12px; border-radius: 8px;
          font-size: 13.5px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          text-decoration: none; border: 1px solid #eef0f3; cursor: pointer; transition: all 0.15s;
        }
        .syl-download-btn:hover { border-color: #D4A500; background: #fffaf0; }
        .syl-doc-icon {
          width: 26px; height: 26px; border-radius: 6px; background: #eef1ff; color: #2B3490;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .syl-doc-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .syl-doc-arrow { color: #D4A500; flex-shrink: 0; opacity: 0; transform: translateX(-3px); transition: all 0.15s; }
        .syl-download-btn:hover .syl-doc-arrow { opacity: 1; transform: translateX(0); }

        .syl-branch-card {
          background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 18px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .syl-branch-card:hover { box-shadow: 0 6px 20px rgba(43, 52, 144, 0.08); border-color: #dfe3f5; }
        .syl-empty-state {
          display: flex; align-items: center; gap: 10px;
          background: #f9f9f7; border: 1px dashed #e2e0d8; border-radius: 8px;
          padding: 12px 14px; color: #999; font-size: 12.5px;
        }

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
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}><CmsText section="syllabus" slot="syllabus" /></h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 700 }}><CmsText section="syllabus" slot="regulation-wise-syllabus-for-all" /></p>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}><CmsText section="syllabus" slot="k-s-r-m-college" multiline /></p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="syllabus" slot="download-syllabus-by-programme" /></h2>
            <div className="syl-accordion">
              <ProgrammeAccordion title="B.Tech (UG)" branches={btechBranches} regs={btechRegs} docs={syllabi} defaultOpen />
              <ProgrammeAccordion title="M.Tech (PG)" branches={mtechBranches} regs={mtechRegs} docs={syllabi} />
              <ProgrammeAccordion title="MBA" branches={mbaBranches} regs={mbaRegs} docs={syllabi} />
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <div className="syl-note">
              <p><CmsText section="syllabus" slot="for-regulation-wise-detailed-syllabus" multiline /></p>
            </div>
          </div>
        </section>

      {/* Documents only; each syllabus is already listed under its regulation
          card above, so hideDocs stops it appearing twice on the page. */}
      <PageResources section="syllabus" hideDocs />
      </main>
    </>
  );
}
