"use client";

import { useState } from "react";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import {
  getDepartmentProgrammesPublic,
  DepartmentProgramme,
} from "@/lib/department-programmes-api";
import {
  getSyllabusProgrammesPublic,
  SyllabusProgramme,
  FALLBACK_SYLLABUS_PROGRAMMES,
} from "@/lib/syllabus-api";
import { useLiveData } from "@/lib/use-live-data";
import { resolveFileUrl } from "@/lib/api-base";

// A regulation code goes into a RegExp to find the documents uploaded for it,
// and the code is typed by an admin now rather than written here - so "R23+"
// or "R23 (new)" would otherwise be read as a pattern and either throw or
// match the wrong files.
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Does this document belong to this regulation? Matched on the filename.
 *
 * The word boundaries are written `\\b`, not `\b`. A template literal
 * processes escapes, so `\b` here would compile to a backspace character and
 * the regex would silently match nothing - which is how the MBA table, the
 * IQAC minutes and the academic-year parser each broke in turn.
 */
function docMatchesReg(title: string, code: string): boolean {
  // A boundary only where the code's own edge is a word character. "R23+"
  // ends in punctuation, and \b after it demands a word character next - so a
  // fixed \b...\b silently matched nothing for any code an admin ends in a
  // symbol. R18 still refuses to match an R18PG document, which is the whole
  // point of having the boundaries at all.
  const left = /^\w/.test(code) ? "\\b" : "";
  const right = /\w$/.test(code) ? "\\b" : "";
  return new RegExp(`${left}${escapeRegExp(code)}${right}`, "i").test(title);
}

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

/**
 * Is this phrase in this title, as a word rather than as letters inside one?
 *
 * The aliases include two-letter codes, and a plain substring test made "CE"
 * match "Computer **S-c-i-e**nce": every CSE syllabus was being listed under
 * Civil Engineering. The boundary is applied only at an end that is itself a
 * word character, so a code written "AI&ML" still matches.
 */
function containsWord(title: string, phrase: string): boolean {
  if (phrase.length < 2) return false;
  const left = /^\w/.test(phrase) ? "\\b" : "";
  const right = /\w$/.test(phrase) ? "\\b" : "";
  return new RegExp(`${left}${escapeRegExp(phrase)}${right}`, "i").test(title);
}

/** Does this document belong to this branch? Matched on the filename wording. */
function docMatchesBranch(title: string, name: string): boolean {
  return branchAliases(name).some((a) => containsWord(title, a));
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
const BRANCH_CARD_MAX_VISIBLE = 4;

function BranchPanel({
  branch,
  matchWord,
  heading,
  regs,
  docs,
}: {
  /** The branch this card is for, or null for a course with no branches -
   *  BCA has one syllabus, not one per specialisation. */
  branch: string | null;
  /** For a branch-less course, the word its documents are named after, e.g.
   *  "BCA". Without it the card took every syllabus on the site, so BCA
   *  listed the CSE and ECE PDFs too. */
  matchWord?: string;
  /** What the card is titled. Defaults to the branch name. */
  heading?: string;
  regs: { code: string; name: string }[];
  docs: Download[];
}) {
  const [expanded, setExpanded] = useState(false);
  const mine =
    branch === null
      ? docs.filter((d) => (matchWord ? containsWord(d.title, matchWord) : false))
      : docs.filter((d) => docMatchesBranch(d.title, branch));
  // Falls back to the branch name: stripping the prefix off "MBA" leaves an
  // empty string, and the card was rendering with no title at all.
  const stripped = (branch ?? "").replace(/^(B\.?Tech|M\.?Tech|MBA)\s*-?\s*/i, "").trim();
  const label = heading ?? (stripped || branch || "");

  // Every card the same height regardless of how many files a branch has -
  // flatten regulation-then-other into one ordered list, cap it, and let
  // "View more" reveal the rest rather than the card growing to fit
  // whatever's uploaded (a branch with 20 files made its row's neighbours
  // tower over branches with 2).
  const groups: { label: string; items: Download[] }[] = [];
  for (const r of regs) {
    const forReg = mine.filter((d) => docMatchesReg(d.title, r.code));
    if (forReg.length > 0) groups.push({ label: r.name, items: forReg });
  }
  const unmatched = mine.filter((d) => !regs.some((r) => docMatchesReg(d.title, r.code)));
  if (unmatched.length > 0) groups.push({ label: "Other", items: unmatched });

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  let remaining = expanded ? Infinity : BRANCH_CARD_MAX_VISIBLE;
  const visibleGroups = groups
    .map((g) => {
      if (remaining <= 0) return null;
      const items = g.items.slice(0, remaining);
      remaining -= items.length;
      return { ...g, items };
    })
    .filter((g): g is { label: string; items: Download[] } => g !== null);
  const hiddenCount = total - visibleGroups.reduce((n, g) => n + g.items.length, 0);

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
          {visibleGroups.map((g) => (
            <div key={g.label}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: "#999", margin: "0 0 6px" }}>
                {g.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.items.map((d) => (
                  <a key={d.id} href={resolveFileUrl(d.fileUrl)} className="syl-download-btn" target="_blank" rel="noopener noreferrer">
                    <span className="syl-doc-icon"><DownloadIcon /></span>
                    <span className="syl-doc-title">{d.title}</span>
                    <span className="syl-doc-arrow"><ChevronRight /></span>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {hiddenCount > 0 && (
            <button type="button" className="syl-view-more" onClick={() => setExpanded(true)}>
              View {hiddenCount} more ↓
            </button>
          )}
          {expanded && total > BRANCH_CARD_MAX_VISIBLE && (
            <button type="button" className="syl-view-more" onClick={() => setExpanded(false)}>
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ProgrammeAccordion({
  title,
  matchWord,
  description,
  branches,
  regs,
  docs,
  defaultOpen,
}: {
  title: string;
  /** For a branch-less course, the word its documents are named after. */
  matchWord?: string;
  description?: string | null;
  /** Null when the programme lists no branches - one card carries the whole
   *  course, which is what BCA and Diploma need. An empty array is the other
   *  case: branches were asked for and none are set up yet. */
  branches: string[] | null;
  regs: { code: string; name: string }[];
  docs: Download[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const grid = (
    <div className="syl-branch-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
      {branches === null ? (
        <BranchPanel branch={null} matchWord={matchWord} heading={title} regs={regs} docs={docs} />
      ) : (
        branches.map((b) => <BranchPanel key={b} branch={b} regs={regs} docs={docs} />)
      )}
    </div>
  );

  return (
    <div className={`syl-accordion-item ${open ? "expanded" : ""}`}>
      <button className="syl-accordion-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <div className="syl-chevron"><ChevronDown /></div>
      </button>
      <div className="syl-accordion-content">
        {description && (
          <p style={{ fontSize: 13.5, color: "#666", margin: "16px 0 0", lineHeight: 1.6 }}>{description}</p>
        )}
        {branches !== null && branches.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", marginTop: 16 }}>
            Branches will appear here once they are added in Admin &rarr; Academics.
          </p>
        ) : (
          grid
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
  // The headings themselves, and the regulations under each, are now content:
  // the college renames "B.Tech (UG)", retires R15 and adds BCA without a
  // deploy. Until the CMS has rows the page falls back to the three headings
  // it has always shown, so nothing changes until someone fills it in.
  const cmsProgrammes = useLiveData<SyllabusProgramme[]>(
    () => getSyllabusProgrammesPublic().catch(() => [] as SyllabusProgramme[]),
    [],
  );
  const groups =
    cmsProgrammes && cmsProgrammes.length > 0
      ? cmsProgrammes
      : FALLBACK_SYLLABUS_PROGRAMMES;

  /**
   * The branches listed under a heading.
   *
   * Null when the programme names no level: that is a course with no
   * specialisations - BCA and Diploma have one syllabus, not one per branch -
   * and its card takes the documents directly.
   */
  const branchesFor = (group: SyllabusProgramme): string[] | null => {
    if (!group.level) return null;
    const needle = group.nameContains?.trim().toLowerCase();
    return [
      ...new Set(
        (programmes ?? [])
          .filter(
            (p) =>
              p.level === group.level &&
              p.isActive !== false &&
              (!needle || p.name.toLowerCase().includes(needle)),
          )
          .map((p) => p.name),
      ),
    ].sort();
  };

  const regsFor = (group: SyllabusProgramme) =>
    group.regulations
      .filter((r) => r.isActive !== false && !r.deletedAt)
      .map((r) => ({ code: r.code, name: r.label?.trim() || r.code }));

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
        .syl-view-more {
          align-self: flex-start; background: none; border: none; cursor: pointer;
          color: #2B3490; font-size: 12.5px; font-weight: 700; font-family: 'Rajdhani', sans-serif;
          padding: 4px 0; letter-spacing: .3px;
        }
        .syl-view-more:hover { color: #D4A500; }
        .syl-branch-grid { align-items: start; }

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
              {groups.map((group, i) => (
                <ProgrammeAccordion
                  key={group.id}
                  title={group.name}
                  matchWord={group.nameContains?.trim() || group.name}
                  description={group.description}
                  branches={branchesFor(group)}
                  regs={regsFor(group)}
                  docs={syllabi}
                  defaultOpen={i === 0}
                />
              ))}
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
