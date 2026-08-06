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
  { title: "Admissions Office", phone: "+91 8143731960", email: "ksrmcengg@yahoo.co.in" },
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
          phone: c.phones[0] ?? null,
          email: c.emails[0] ?? null,
        }))
      : fallbackOffices.map((o) => ({ key: o.title, title: o.title, phone: o.phone, email: o.email }))

  return (
    <>
      {offices.map((d) => (
        <div className="contact-dept-card" key={d.key}>
          <h3>{d.title}</h3>
          {d.phone && (
            <>
              <p>Phone:</p>
              <a href={`tel:${d.phone}`}>{d.phone}</a>
            </>
          )}
          {d.email && (
            <>
              <p>Email:</p>
              <a href={`mailto:${d.email}`}>{d.email}</a>
            </>
          )}
        </div>
      ))}
    </>
  )
}
