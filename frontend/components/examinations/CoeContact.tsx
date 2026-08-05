"use client"

import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The Controller of Examinations' contact details.
 *
 * The numbers were hardcoded here, so a change of extension meant a code edit
 * and a redeploy - and the same office already exists as a Contact record,
 * which is where the college updates it. This reads that record and keeps the
 * built-in values only as a fallback, so the two can no longer disagree.
 *
 * Matched on the office name rather than an id: the two databases number their
 * rows differently, and a name survives a re-import.
 */
const OFFICE = /examination/i

const FALLBACK = {
  phones: ["+91 91549 25978", "+91 90321 58604"],
  emails: ["exams@ksrmce.ac.in"],
}

/** "9032158604" -> "+91 90321 58604"; anything already formatted is left alone. */
function pretty(p: string): string {
  const digits = p.replace(/[^\d]/g, "")
  if (p.trim().startsWith("+")) return p.trim()
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  return p.trim()
}

const linkStyle: React.CSSProperties = {
  background: "rgba(255,230,25,0.1)",
  color: "#2B3490",
  padding: "12px 16px",
  borderRadius: 4,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  gap: 8,
}

export default function CoeContact() {
  const channels = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic().catch(() => [] as ContactChannel[]),
    [],
  )

  const office = (channels ?? []).find((c) => OFFICE.test(c.name))
  const phones = office?.phones?.length ? office.phones : FALLBACK.phones
  const emails = office?.emails?.length ? office.emails : FALLBACK.emails

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* One tel: link per number - a phone cannot dial an extension from a
          tel: href, which is why the old switchboard-plus-Ext line never
          worked from a mobile. */}
      {phones.map((p) => (
        <a key={p} href={`tel:${p.replace(/[^\d+]/g, "")}`} style={linkStyle}>
          <span>📞</span>
          <span>{pretty(p)}</span>
        </a>
      ))}
      {emails.map((e) => (
        <a key={e} href={`mailto:${e}`} style={linkStyle}>
          <span>✉️</span>
          <span>{e}</span>
        </a>
      ))}
    </div>
  )
}
