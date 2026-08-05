"use client";

import CmsText from "@/components/CmsText";
import { resolveFileUrl } from "@/lib/api-base";
import Link from "next/link";
import PublicDocumentList from "@/components/PublicDocumentList";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * Ombudsperson.
 *
 * A page of its own rather than a block on About: the UGC (Redressal of
 * Grievances of Students) Regulations require this to be findable, and a
 * student appealing a grievance should reach it from the menu instead of
 * scrolling a long page.
 *
 * A static route, so it takes precedence over about/[slug] - which serves the
 * leadership profiles and would otherwise try to resolve "ombudsman" as one.
 *
 * The typed detail fields are a stand-in only. Once the appointment order is
 * uploaded under "About -> Ombudsman" the document replaces them outright: the
 * order is the authoritative record, and showing "To be notified" beside it
 * would contradict the very document being published.
 */
const DETAILS = [
  { label: "Ombudsperson", slot: "ombudsman.name" },
  { label: "Designation", slot: "ombudsman.designation" },
  { label: "Email", slot: "ombudsman.email" },
  { label: "Phone", slot: "ombudsman.phone" },
];

export default function OmbudspersonPage() {
  const docs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "about.ombudsman").catch(() => [] as Download[]),
    [],
  );
  const documents = docs ?? [];
  const hasDocuments = documents.length > 0;

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .om-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .om-container { padding: 0 20px; } }
        .om-hero {
          position: relative; background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          padding: 84px 0; overflow: hidden;
        }
        .om-hero::after {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .om-hero > * { position: relative; z-index: 2; }
        .om-crumb { font-size: 14.5px; color: rgba(255,255,255,0.7); margin-bottom: 10px; }
        .om-crumb a { color: #FFE619; text-decoration: none; }
        .om-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin: 0 0 36px; }
        .om-card { background: #fff; border: 1px solid #EADFC8; border-radius: 10px; padding: 20px 22px; }
        .om-label { font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #2B3490; margin: 0 0 6px; }
        .om-value { margin: 0; color: #1a1a2e; font-size: 15.5px; font-weight: 600; word-break: break-word; }
        .om-note { background: #f7f8fa; border-left: 4px solid #2B3490; border-radius: 0 10px 10px 0; padding: 18px 22px; color: #555; font-size: 15px; line-height: 1.7; }
        .om-note a { color: #2B3490; font-weight: 600; }
      `}</style>

      <section className="om-hero">
        <div className="om-container">
          <p className="om-crumb">
            <Link href="/about">About</Link> / Ombudsperson
          </p>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
            <CmsText section="about" slot="ombudsman.heading" />
          </h1>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="om-container">
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.85, maxWidth: 940, margin: "0 0 36px" }}>
            <CmsText section="about" slot="ombudsman.intro" multiline />
          </p>

          {hasDocuments ? (
            <div style={{ marginBottom: 36 }}>
              <PublicDocumentList
                items={documents.map((d) => ({
                  id: d.id,
                  title: d.title,
                  description: d.description,
                  href: resolveFileUrl(d.fileUrl),
                  actionLabel: "Open",
                }))}
              />
            </div>
          ) : (
            <div className="om-grid">
              {DETAILS.map((d) => (
                <div className="om-card" key={d.slot}>
                  <p className="om-label">{d.label}</p>
                  <p className="om-value">
                    <CmsText section="about" slot={d.slot} />
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="om-note">
            Raise your complaint with the college&apos;s{" "}
            <Link href="/campus-life/grievance">Grievance Redressal Committee</Link> first. The
            Ombudsperson is the appeal authority for a grievance that committee has not resolved.
          </p>
        </div>
      </section>
    </main>
  );
}
