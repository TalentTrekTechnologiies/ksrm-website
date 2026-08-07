"use client"

import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The Principal / Admissions / Examination / Placement card grid on the
 * Contact page.
 *
 * Real ContactChannel rows now (group: "directory", managed from
 * Admin -> Contacts -> Office Directory) - previously a fixed four-item array
 * whose phone numbers weren't even wrapped in editable text, let alone
 * add/removable. The fallback below is that original array; it only renders
 * if the CMS has no directory rows at all, so this section can never go blank.
 */

const fallbackOffices = [
  { title: "Principal Office", phone: "+91 9000073434", email: "principal@ksrmce.ac.in" },
  { title: "Admissions Office", phone: "+91 8143731980", email: "dean.admissions@ksrmce.ac.in" },
  { title: "Examination Section", phone: "08562 295972", email: "principal@ksrmce.ac.in" },
  { title: "Training & Placement", phone: "+91 9000073434", email: "principal@ksrmce.ac.in" },
]

export default function OfficeDirectory() {
  const rows = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic(undefined, "directory").catch(() => [] as ContactChannel[]),
    [],
  )

  const offices =
    rows && rows.length > 0
      ? rows.map((c) => ({
          key: String(c.id),
          title: c.name,
          phones: c.phones,
          emails: c.emails,
        }))
      : fallbackOffices.map((o) => ({ key: o.title, title: o.title, phones: o.phone ? [o.phone] : [], emails: o.email ? [o.email] : [] }))

  return (
    <>
      {offices.map((d) => (
        <div className="contact-dept-card" key={d.key}>
          <h3>{d.title}</h3>
          {d.phones.length > 0 && (
            <>
              <p>Phone:</p>
              {d.phones.map((p) => (
                <a key={p} href={`tel:${p}`} style={{ display: "block" }}>{p}</a>
              ))}
            </>
          )}
          {d.emails.length > 0 && (
            <>
              <p>Email:</p>
              {d.emails.map((e) => (
                <a key={e} href={`mailto:${e}`} style={{ display: "block" }}>{e}</a>
              ))}
            </>
          )}
        </div>
      ))}
    </>
  )
}
