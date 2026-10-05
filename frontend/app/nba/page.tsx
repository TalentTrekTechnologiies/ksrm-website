"use client";

import { useState } from "react";
import CmsText from "@/components/CmsText";
import ProtectedDocumentViewer from "@/components/ProtectedDocumentViewer";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import {
  getDepartmentProgrammesPublic,
  DepartmentProgramme,
} from "@/lib/department-programmes-api";
import { useLiveData } from "@/lib/use-live-data";
import { getPageTablesPublic, PageTable } from "@/lib/page-tables-api";
import { resolveFileUrl } from "@/lib/api-base";

/**
 * NBA - programme accreditation.
 *
 * A page of its own, beside IQAC rather than inside it: NBA accredits
 * individual programmes and NAAC accredits the institution, so a reviewer
 * arriving for one has no reason to look under the other. Both are cited by
 * URL in submissions, which is why this is a real route and not an anchor on
 * another page.
 *
 * The accredited programmes are read from the same programme rows that drive
 * Courses & Intake - a programme's own `accreditation` field - so the list
 * cannot drift from what the college publishes everywhere else, and adding an
 * accreditation there puts the branch on this page without a deploy.
 */
export default function NbaPage() {
  const programmes = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    [],
  );

  // Not PageResources: that block links straight to the file, which is the one
  // thing these documents must not do. They open in the viewer instead.
  const docs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "nba").catch(() => [] as Download[]),
    [],
  );
  const [reading, setReading] = useState<Download | null>(null);

  // Accredited Certificates: open PDFs, so they link straight to the file. Filed
  // under "nba-certificates" - a dash, so they sit outside the protected "nba"
  // section. Uploaded in Admin -> NBA -> Accredited Certificates.
  const certs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "nba-certificates").catch(() => [] as Download[]),
    [],
  );

  // Admin -> NBA -> More Sections: members, committees, an address - whatever
  // is asked for next. Nothing is rendered until one exists.
  const extras = useLiveData<PageTable[]>(
    () => getPageTablesPublic("nba").catch(() => [] as PageTable[]),
    [],
  );

  const accredited = (programmes ?? [])
    .filter((p) => p.isActive !== false && /nba/i.test(p.accreditation ?? ""))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .nba-hero {
          position: relative; background-image: url('/banners/courses-intake.webp');
          background-size: cover; background-position: center; background-color: #2B3490;
          min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .nba-hero::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(20,26,74,0.55) 0%, rgba(20,26,74,0.85) 100%);
        }
        .nba-hero > * { position: relative; z-index: 2; }

        .nba-badge-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; justify-content: center; }
        .nba-logo { width: 96px; height: 96px; object-fit: contain; }

        /* auto-fill, not auto-fit: a lone card stays the width of its
           neighbours in the other sections instead of spanning the page. */
        .nba-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 28px; }
        .nba-card {
          background: #fff; border: 1px solid #eef0f3; border-left: 4px solid #2B3490;
          border-radius: 10px; padding: 18px 20px;
        }
        .nba-card h3 {
          font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700;
          color: #1a1a2e; margin: 0 0 6px;
        }
        .nba-card p { color: #666; font-size: 13.5px; margin: 0; }
        .nba-tag {
          display: inline-block; margin-top: 10px; background: #eef1f8; color: #2B3490;
          border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 700;
        }
        .nba-doc {
          text-align: left; cursor: pointer; font: inherit; width: 100%;
          transition: box-shadow 0.2s, border-color 0.2s;
          display: block; text-decoration: none;
        }
        .nba-doc:hover { box-shadow: 0 6px 20px rgba(43,52,144,0.10); border-left-color: #D4A500; }
        .nba-extra { max-width: 1100px; margin: 0 auto 36px; }
        .nba-extra:last-child { margin-bottom: 0; }
        .nba-extra h2 {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(1.5rem, 2.6vw, 2rem); font-weight: 700;
          color: #1a1a2e; margin: 0 0 16px; text-align: center;
        }
        .nba-extra-wrap { overflow-x: auto; border: 1px solid #eef0f3; border-radius: 10px; background: #fff; }
        .nba-extra table { width: 100%; border-collapse: collapse; font-size: 14.5px; }
        .nba-extra th {
          background: #2B3490; color: #fff; text-align: left; padding: 11px 16px;
          font-family: 'Rajdhani', sans-serif; font-size: 15.5px; font-weight: 700; white-space: nowrap;
        }
        .nba-extra td { padding: 10px 16px; color: #444; border-top: 1px solid #eef0f3; vertical-align: top; }
        .nba-extra tbody tr:nth-child(even) td { background: #fafaf8; }
        .nba-extra-note { color: #666; font-size: 14px; line-height: 1.7; margin: 12px 0 0; white-space: pre-line; text-align: center; }
        .nba-empty {
          border: 1px dashed #e2e0d8; background: #f9f9f7; border-radius: 10px;
          padding: 22px; color: #999; font-size: 14px; text-align: center; margin-top: 28px;
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="nba-hero">
          <div className="responsive-container">
            <div style={{ padding: "72px 0 0" }}>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>
                <CmsText section="nba" slot="nba" />
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 760 }}>
                <CmsText section="nba" slot="national-board-of-accreditation" />
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <div className="nba-badge-row">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img src="/nba.png" alt="NBA" className="nba-logo" loading="lazy" decoding="async"
                   onError={(e) => { e.currentTarget.style.display = "none" }} />
              <p style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
                <CmsText section="nba" slot="k-s-r-m-college" multiline />
              </p>
            </div>
          </div>
        </section>

        {/* Accredited Certificates - the same cards as the documents below, but a
            plain link to the PDF. Hidden until one is uploaded. */}
        {(certs ?? []).length > 0 && (
          <section style={{ padding: "64px 0 0", background: "#ffffff" }}>
            <div className="responsive-container">
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: 0, textAlign: "center" }}>
                <CmsText section="nba" slot="certificates" />
              </h2>
              <div className="nba-grid">
                {(certs ?? []).map((c) => (
                  <a
                    key={c.id}
                    className="nba-card nba-doc"
                    href={resolveFileUrl(c.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h3>{c.title}</h3>
                    <span className="nba-tag">Open →</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section style={{ padding: "64px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: 0, textAlign: "center" }}>
              <CmsText section="nba" slot="accredited-programmes" />
            </h2>

            {accredited.length === 0 ? (
              <p className="nba-empty">
                Accredited programmes appear here once an accreditation is recorded
                against them in Admin &rarr; Academics &rarr; Programmes.
              </p>
            ) : (
              <div className="nba-grid">
                {accredited.map((p) => (
                  <div className="nba-card" key={p.id}>
                    <h3>{p.name}</h3>
                    {p.department?.name && <p>{p.department.name}</p>}
                    <span className="nba-tag">{p.accreditation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ padding: "0 0 72px", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px", textAlign: "center" }}>
              <CmsText section="nba" slot="documents" />
            </h2>

            {(docs ?? []).length === 0 ? (
              <p className="nba-empty">
                Documents appear here once they are uploaded to the NBA page.
              </p>
            ) : (
              <div className="nba-grid">
                {(docs ?? []).map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    className="nba-card nba-doc"
                    onClick={() => setReading(d)}
                  >
                    <h3>{d.title}</h3>
                    <span className="nba-tag">Read →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {(extras ?? []).length > 0 && (
          <section style={{ padding: "64px 0 72px", background: "#f4f3ef" }}>
            <div className="responsive-container">
              {(extras ?? []).map((t) => (
                <div className="nba-extra" key={t.id}>
                  {t.title && <h2>{t.title}</h2>}
                  {/* A block with no rows is a heading and a note - an
                      address, say - rather than an empty table. */}
                  {t.rows.some((r) => r.some((c) => c.trim())) && (
                    <div className="nba-extra-wrap">
                      <table>
                        <thead>
                          <tr>
                            {t.columns.map((c, i) => (
                              <th key={i}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.rows
                            .filter((r) => r.some((c) => c.trim()))
                            .map((r, ri) => (
                              <tr key={ri}>
                                {r.map((c, ci) => (
                                  <td key={ci}>{c}</td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {t.footnote && <p className="nba-extra-note">{t.footnote}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {reading && (
          <ProtectedDocumentViewer
            documentId={reading.id}
            title={reading.title}
            onClose={() => setReading(null)}
            /**
             * Deliberately the level with NO modulation and NO reading band.
             *
             * The page must look completely normal to read - that is the
             * requirement, and both of the alternatives failed it: the
             * modulation flickered, and the band covers most of the page.
             * What protects the capture here is layer 7 instead, which hides
             * the document at the moment a capture is started. That works for
             * the capture routes the browser gets warning of and does nothing
             * for the rest; docs/DOCUMENT-PROTECTION.md has the per-method
             * table, and it is not a guarantee.
             */
            protectionLevel="standard"
            /**
             * The figures are NOT blacked out while reading.
             *
             * Redaction hides them permanently and reveals one on hover, so a
             * capture taken at any moment carries at most one. It is the only
             * layer that survives a phone camera - and it costs the reader the
             * document, because every number on every page has to be pointed
             * at to be read. Asked for and rejected on exactly that ground.
             *
             * What is left is layer 7: the viewer blanks when a capture is
             * STARTED. That reaches the routes the browser hears about first -
             * the window losing focus to Snipping Tool, the Windows key that
             * opens Win+Shift+S - and cannot reach PrintScreen, where the
             * operating system has the pixels before the page is told.
             *
             * So: the document reads normally, some capture routes come out
             * blank, and PrintScreen does not. Set this to true to trade that
             * back the other way.
             */
            redactFigures={false}
            showNote={false}
            // No watermark, at the college's request - neither the moving one
            // nor the heavier one shown while a capture is in progress.
            watermarkOpacity={0}
            captureWatermarkOpacity={0}
          />
        )}
      </main>
    </>
  );
}
