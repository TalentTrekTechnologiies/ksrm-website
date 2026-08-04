"use client"

import type { ReactElement } from "react"
import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The Address / Phone / Email cards at the top of the Contact page.
 *
 * These used to be a fixed six-item array; only the wording inside each box
 * was editable. Deleting a card's text left an empty box behind - the icon and
 * shell stayed because nothing controlled how many boxes there were. They are
 * now real ContactChannel rows (group: "info", managed from Admin -> Contacts
 * -> Info Row), so removing one removes the box.
 *
 * The fallback below is what shipped before this was CMS-driven. It only
 * renders if the CMS has no info-row rows at all, so an empty database or an
 * unreachable API can never blank this section of the page - the worst case is
 * the page looking exactly as it always did.
 */

const fallbackCards = [
  { icon: "map-pin", title: "Address", content: "K.S.R.M. College of Engineering, Kadapa – 516 003, Andhra Pradesh, India" },
  { icon: "phone", title: "Phone", content: "+91 9000073434", href: "tel:+91 9000073434" },
  { icon: "phone", title: "Alternate", content: "08562 295972", href: "tel:08562 295972" },
  { icon: "phone", title: "Alternate", content: "+91 8143731980", href: "tel:+91 8143731980" },
  { icon: "mail", title: "Email", content: "ksrmcengg@yahoo.co.in", href: "mailto:ksrmcengg@yahoo.co.in" },
  { icon: "mail", title: "Alternate", content: "principal@ksrmce.ac.in", href: "mailto:principal@ksrmce.ac.in" },
]

function IconMapPin() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>)
}
function IconPhone() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" /></svg>)
}
function IconMail() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>)
}
const icons: Record<string, () => ReactElement> = { "map-pin": IconMapPin, phone: IconPhone, mail: IconMail }

interface Card {
  key: string
  icon: string
  title: string
  content: string
  href?: string
}

/** address/phones/emails, whichever is populated, decides the icon - not a stored field, so it can never disagree with the data. */
function toCard(c: ContactChannel): Card | null {
  if (c.address) return { key: String(c.id), icon: "map-pin", title: c.name, content: c.address }
  if (c.phones[0]) return { key: String(c.id), icon: "phone", title: c.name, content: c.phones[0], href: `tel:${c.phones[0]}` }
  if (c.emails[0]) return { key: String(c.id), icon: "mail", title: c.name, content: c.emails[0], href: `mailto:${c.emails[0]}` }
  return null
}

export default function ContactInfoRow() {
  const rows = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic(undefined, "info").catch(() => [] as ContactChannel[]),
    [],
  )

  const cards: Card[] =
    rows && rows.length > 0
      ? rows.map(toCard).filter((c): c is Card => c !== null)
      : fallbackCards.map((c, i) => ({ key: `fallback-${i}`, ...c }))

  return (
    <>
      {cards.map((c) => {
        const Icon = icons[c.icon]
        return (
          <div className="contact-info-card" key={c.key}>
            <div className="contact-info-icon"><Icon /></div>
            <div className="contact-info-content">
              <h3>{c.title}</h3>
              {c.href ? <a href={c.href}>{c.content}</a> : <p>{c.content}</p>}
            </div>
          </div>
        )
      })}
    </>
  )
}
