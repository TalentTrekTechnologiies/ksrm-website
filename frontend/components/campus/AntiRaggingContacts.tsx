"use client";

import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * Who to ring about ragging.
 *
 * The page carried two hardcoded cards - the national helpline and the college
 * switchboard - and no way for the college to change either, name whoever is
 * responsible, or publish an email. A student reading it got a switchboard
 * number and no person.
 *
 * Everything except the national helpline comes from Admin -> Contacts: add a
 * channel whose name mentions "anti-ragging" (or "ragging"), give it as many
 * phone numbers as it needs, an email, and it appears here. Several such
 * channels each get their own card, so a committee chairperson and a warden
 * can both be listed. Nothing here needs changing to do any of that.
 *
 * The national helpline is deliberately not editable: it is a Government of
 * India number that must be correct, and it is printed on the UGC posters this
 * page mirrors.
 */

const NATIONAL_HELPLINE = { label: "National Anti-Ragging Helpline", number: "1800-180-5522" };

/** A ten-digit number needs the country code or the link fails on roaming. */
function dialable(p: string): string {
  const d = p.replace(/\D/g, "");
  if (p.trim().startsWith("+")) return `+${d}`;
  return d.length === 10 ? `+91${d}` : d;
}

function Card({
  label,
  person,
  phones,
  emails,
}: {
  label: string;
  person?: string;
  phones: string[];
  emails: string[];
}) {
  return (
    <div className="ar-card">
      <div className="ar-icon" aria-hidden="true">
        📞
      </div>
      <div className="ar-label">{label}</div>
      {person && <div className="ar-person">{person}</div>}

      {/* One tel: link per number. An extension cannot be dialled from a tel:
          href, which is why the switchboard-plus-Ext line this page used to
          carry never worked from a phone. */}
      {phones.map((p) => (
        <a key={p} className="ar-line" href={`tel:${dialable(p)}`}>
          {p}
        </a>
      ))}
      {emails.map((e) => (
        <a key={e} className="ar-line ar-email" href={`mailto:${e}`}>
          {e}
        </a>
      ))}
    </div>
  );
}

export default function AntiRaggingContacts() {
  const channels = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic().catch(() => [] as ContactChannel[]),
    [],
  );

  // Matched on the name so the college can add a card without anyone touching
  // this file. "ragging" alone would also catch "Anti-Ragging Squad", which is
  // the point - any ragging-related contact belongs on this page.
  const cms = (channels ?? []).filter(
    (c) => /ragging/i.test(c.name) && ((c.phones?.length ?? 0) > 0 || (c.emails?.length ?? 0) > 0),
  );

  return (
    <>
      <style>{`
        .ar-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .ar-card {
          background: #e74c3c; color: #fff; border-radius: 12px; padding: 28px;
          text-align: center; display: flex; flex-direction: column; gap: 10px;
        }
        .ar-icon { font-size: 28px; }
        .ar-label {
          font-family: var(--font-rajdhani), sans-serif; font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1px; opacity: .9;
        }
        .ar-person { font-size: 15px; font-weight: 600; }
        .ar-line {
          font-family: var(--font-rajdhani), sans-serif; font-size: 22px; font-weight: 700;
          color: #fff; text-decoration: none; word-break: break-word;
        }
        .ar-line:hover { text-decoration: underline; }
        /* An address is long where a number is short; it would look broken at
           the number's size. */
        .ar-email { font-family: inherit; font-size: 15px; font-weight: 600; }
      `}</style>

      <div className="ar-grid">
        <Card label={NATIONAL_HELPLINE.label} phones={[NATIONAL_HELPLINE.number]} emails={[]} />
        {cms.map((c) => (
          <Card
            key={c.id}
            label={c.name}
            phones={c.phones ?? []}
            emails={c.emails ?? []}
          />
        ))}
      </div>

      {cms.length === 0 && (
        <p style={{ marginTop: 16, fontSize: 13.5, color: "#666" }}>
          The college&rsquo;s own anti-ragging contacts are published from Admin &rarr; Contacts.
        </p>
      )}
    </>
  );
}
