"use client"

import { getDownloadsPublic, Download } from "@/lib/downloads-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * Accreditation and autonomy certificates, shown as the awarding body's logo.
 *
 * The page previously described the college's accreditations in prose with no
 * way to see the letters themselves - the documents existed only on the old
 * site. Each card is the body's logo over the document's name, and the whole
 * card opens the PDF.
 *
 * Documents come from the Mandatory Disclosure section rather than a list in
 * this file, so next year's EOA letter appears here by being uploaded, with no
 * code change. The logo is matched on the document's title; anything without a
 * recognised logo still appears, with its initials, rather than being dropped.
 */

// Matched against the document title, first hit wins.
//
// NAAC is deliberately tested BEFORE NBA. The combined "Accreditation Status
// (NAAC & NBA)" document names both bodies, and testing NBA first gave it the
// NBA logo - the same logo the separate "NBA Accreditation Letter" card
// already carries, so two different documents appeared under one identical
// badge. The combined status document leads with NAAC, and the NBA letter
// still matches NBA on its own, so each card now reads as its own thing.
const LOGOS: { match: RegExp; src: string; alt: string }[] = [
  { match: /\bUGC\b|autonom/i, src: "/ugc.webp", alt: "University Grants Commission" },
  { match: /\bNAAC\b/i, src: "/naac.png", alt: "NAAC" },
  { match: /\bNBA\b/i, src: "/nba.png", alt: "National Board of Accreditation" },
  { match: /\bNIRF\b/i, src: "/nirf.jpg", alt: "NIRF" },
  // A typographic wordmark, not AICTE's official emblem - see public/aicte.svg.
  { match: /\bAICTE\b|\bEOA\b/i, src: "/aicte.svg", alt: "AICTE Approved" },
]

function logoFor(title: string) {
  return LOGOS.find((l) => l.match.test(title))
}

function initials(title: string) {
  const m = title.match(/\b(AICTE|NAAC|NBA|UGC|NIRF|JNTUA|RTI)\b/i)
  return (m ? m[1] : title.slice(0, 4)).toUpperCase()
}

export default function AccreditationCertificates({
  /** Which page section the certificates are filed under. */
  section = "mandatory-disclosure",
  /**
   * Only these groups are certificates. They are the college's own tab names
   * from its Mandatory Disclosure page - the MoUs and general policies filed
   * alongside them are documents, not certificates, and stay off this block.
   */
  groups = ["Accreditation Status", "AICTE Approval Letters", "UGC Autonomous"],
  heading = "Certificates & Letters",
}: {
  section?: string
  groups?: string[]
  heading?: string
}) {
  const docs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, section).catch(() => [] as Download[]),
    [section],
  )

  const items = (docs ?? []).filter((d) => groups.includes(d.groupLabel ?? ""))
  if (items.length === 0) return null

  return (
    <section style={{ padding: "56px 0", background: "#f7f8fa" }}>
      <style>{`
        .ac-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .ac-container { padding: 0 20px; } }
        .ac-h2 { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.7rem, 3vw, 2.3rem); font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
        .ac-lead { color: #666; font-size: 15.5px; margin: 0 0 28px; }
        /* Flex-centred rather than an auto-fill grid: on a 1760px container
           auto-fill lays out roughly eight 210px tracks, so three certificates
           filled the first three and left the rest of the row visibly empty on
           the right. Centring wraps the same cards with balanced space on both
           sides, and still fills the row once more documents are uploaded. */
        .ac-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 18px; }
        .ac-card { flex: 0 1 250px; display: flex; flex-direction: column; align-items: center; text-align: center; background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 22px 18px 18px; text-decoration: none; transition: box-shadow .18s, transform .18s, border-color .18s; }
        .ac-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(43,52,144,.13); border-color: #dfe3ea; }
        .ac-logo { height: 72px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .ac-logo img { max-height: 72px; max-width: 150px; object-fit: contain; }
        .ac-initials { width: 66px; height: 66px; border-radius: 12px; background: linear-gradient(135deg,#2B3490,#1e2570); color: #FFE619; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center; letter-spacing: .5px; }
        .ac-title { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a2e; line-height: 1.3; }
        .ac-open { margin-top: 10px; color: #2B3490; font-size: 12.5px; font-weight: 700; }
      `}</style>

      <div className="ac-container">
        <h2 className="ac-h2">{heading}</h2>
        <p className="ac-lead">Click any certificate to open the document.</p>
        <div className="ac-grid">
          {items.map((d) => {
            const logo = logoFor(d.title)
            return (
              <a
                key={d.id}
                className="ac-card"
                href={d.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${d.title}`}
              >
                <span className="ac-logo">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static logo asset
                    <img src={logo.src} alt={logo.alt} loading="lazy" />
                  ) : (
                    <span className="ac-initials">{initials(d.title)}</span>
                  )}
                </span>
                <span className="ac-title">{d.title}</span>
                <span className="ac-open">Open PDF →</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
