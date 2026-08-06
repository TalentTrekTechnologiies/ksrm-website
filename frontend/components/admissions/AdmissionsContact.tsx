"use client";

import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * Who to ring about admissions - on every admissions page.
 *
 * The Admissions, UG and PG pages carried no contact details at all: a
 * prospective student could read the whole of an admissions page and find no
 * way to ask a question. The diploma page had a single number and a note to
 * ourselves printed beside it.
 *
 * Admin -> Contacts wins when it holds an admissions record, so the college
 * edits this in one place for all four pages. The details below are what the
 * college supplied and show until then.
 */
const FALLBACK = {
  name: "Dr. S. L. Prathap Reddy",
  role: "Dean of Admissions",
  phones: ["8143731980", "9948101980", "9948201980", "9948301980"],
  email: "dean.admissions@ksrmce.ac.in",
};

/** "9948101980" -> "+91 99481 01980"; anything already formatted is left alone. */
function pretty(p: string): string {
  const d = p.replace(/\D/g, "");
  if (p.trim().startsWith("+")) return p.trim();
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : p.trim();
}

/** A bare ten-digit number needs the country code or the link fails on roaming. */
function dialable(p: string): string {
  const d = p.replace(/\D/g, "");
  if (p.trim().startsWith("+")) return `+${d}`;
  return d.length === 10 ? `+91${d}` : d;
}

export default function AdmissionsContact() {
  const channels = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic().catch(() => [] as ContactChannel[]),
    [],
  );

  const record = (channels ?? []).find((c) => /admission/i.test(c.name));
  const phones = record?.phones?.length ? record.phones : FALLBACK.phones;
  const email = record?.emails?.[0] ?? FALLBACK.email;

  return (
    <section style={{ padding: "64px 0", background: "#f4f3ef" }}>
      <style>{`
        .adm-contact {
          max-width: 1760px; margin: 0 auto; padding: 0 40px;
        }
        .adm-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px; padding: 40px; color: #fff;
        }
        .adm-contact-card h2 {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800; margin: 0 0 4px;
        }
        .adm-person { color: #FFE619; font-size: 16px; font-weight: 700; margin: 0 0 24px; }
        .adm-lines { display: flex; flex-wrap: wrap; gap: 12px; }
        .adm-lines a {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.12); color: #fff; text-decoration: none;
          padding: 12px 18px; border-radius: 8px; font-size: 15px; font-weight: 600;
          transition: background .2s;
        }
        .adm-lines a:hover { background: rgba(255,230,25,0.22); }
        @media (max-width: 768px) {
          .adm-contact { padding: 0 20px; }
          .adm-contact-card { padding: 28px 22px; }
          /* One per row on a phone, so a number is a comfortable tap target
             rather than three squeezed across. */
          .adm-lines { flex-direction: column; }
          .adm-lines a { width: 100%; }
        }
      `}</style>

      <div className="adm-contact">
        <div className="adm-contact-card">
          <h2>Admissions Enquiries</h2>
          <p className="adm-person">
            {FALLBACK.name} &middot; {FALLBACK.role}
          </p>

          <div className="adm-lines">
            {/* One tel: link per number. An extension cannot be dialled from a
                tel: href, which is why the switchboard-plus-Ext lines this
                site used to carry never worked from a phone. */}
            {phones.map((p) => (
              <a key={p} href={`tel:${dialable(p)}`}>
                <span aria-hidden="true">📞</span>
                {pretty(p)}
              </a>
            ))}
            <a href={`mailto:${email}`}>
              <span aria-hidden="true">✉️</span>
              {email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
