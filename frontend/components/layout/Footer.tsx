"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react"
import { getPublicSiteSettings } from "@/lib/site-settings-api"
import { useLiveData } from "@/lib/use-live-data"
import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api"
import { getDepartmentProgrammesPublic, DepartmentProgramme } from "@/lib/department-programmes-api"

/**
 * Site Settings override the built-in defaults below, but only when actually
 * filled in - several of these settings ship empty, and a blank footer is worse
 * than the correct hardcoded value. `s()` returns the setting or the fallback.
 *
 * Polled, so a Site Settings edit reaches an already-open page without a
 * refresh. `initialValue: {}` keeps the defaults showing until the first
 * response, and a failed poll keeps the last good values rather than blanking.
 */
function useSiteSettings() {
  const settings = useLiveData<Record<string, string>>(
    () => getPublicSiteSettings(),
    [],
    { initialValue: {} },
  )
  return (key: string, fallback: string) => settings?.[key]?.trim() || fallback
}

/**
 * The three programme columns, grouped by level.
 *
 * Each row carries its department, so a programme links to that department's
 * page; anything without one falls back to Courses & Intake rather than
 * becoming a dead link. Names are shortened for the column - the CMS holds
 * "B.Tech - Computer Science & Engineering", which does not fit a footer.
 */
function useProgrammeColumns() {
  const rows = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    [],
  )

  const DEGREE = /^\s*(B\.?\s*Tech|M\.?\s*Tech|MTech|MBA|MCA|Diploma)\s*(-|in|)\s*/i

  /** "MTech - Geotechnical" and "M.Tech-Geotechnical" both read M.Tech. */
  const tidyDegree = (d: string) => (/^m\.?\s*tech$/i.test(d) ? "M.Tech" : /^b\.?\s*tech$/i.test(d) ? "B.Tech" : d)

  /**
   * Shortened for a ~200px column: "Engineering" abbreviates, and the degree
   * prefix is dropped ONLY when every course in the column carries the same
   * one - true of UG (all B.Tech) and Diploma.
   *
   * PG is not like that: it mixes M.Tech with MBA. Dropping the prefix there
   * turned "M.Tech - Structural Engineering" into "Structural Engg." and the
   * M.Tech courses stopped saying M.Tech at all, which is exactly how they
   * became impossible to find in that column.
   */
  const labelsFor = (names: string[]) => {
    const degrees = new Set(names.map((n) => n.match(DEGREE)?.[1]?.replace(/\s+/g, "").toLowerCase() ?? ""))
    const uniform = degrees.size === 1 && !degrees.has("")

    return names.map((n) => {
      const m = n.match(DEGREE)
      // Strip the degree in both cases, then put a tidied one back when the
      // column needs it. Stripping only in the uniform case produced
      // "M.Tech M.Tech - AIDS", because the degree was prepended to a string
      // that still carried it.
      const rest = (m ? n.slice(m[0].length) : n)
        .replace(/\bEngineering\b/gi, "Engg.")
        .replace(/\band\b/gi, "&")
        .replace(/\s+/g, " ")
        .trim()
      if (uniform || !m) return rest || n
      // Keep the degree, normalised, so "MTech - X" and "M.Tech-X" match.
      // No dash - "M.Tech Structural Engg." is two characters shorter than
      // "M.Tech – Structural Engg." and reads the same.
      return `${tidyDegree(m[1].replace(/\s+/g, ""))} ${rest}`.trim()
    })
  }

  const columnFor = (level: string, fallback: { label: string; href: string }[]) => {
    const forLevel = (rows ?? []).filter((r) => r.level === level)
    if (forLevel.length === 0) return fallback
    const labels = labelsFor(forLevel.map((r) => r.name))

    // Deduplicated on the label the reader actually sees, not on the record.
    // Two programme records can shorten to the same footer entry - the college
    // lists CSE and its specialisations separately, and the abbreviation that
    // makes them fit a 200px column is what collapses them - so the footer
    // showed the same line twice with no way to tell which was which.
    const seen = new Set<string>()
    return forLevel
      .map((r, i) => ({
        label: labels[i],
        href: r.department?.slug ? `/departments/${r.department.slug}` : "/academics/courses-intake",
      }))
      .filter((entry) => {
        const key = entry.label.toLowerCase().replace(/[^a-z0-9]/g, "")
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }

  return {
    ug: columnFor("UG", FALLBACK_UG),
    pg: columnFor("PG", FALLBACK_PG),
    diploma: columnFor("DIPLOMA", FALLBACK_DIPLOMA),
  }
}

/**
 * The phone and email in the footer, from Admin -> Contacts.
 *
 * The footer read site.contactPhone out of Site Settings - a key that has
 * never been set - so it always showed its own built-in default. Editing the
 * number in Contacts updated the Contact page while the footer, which appears
 * on every page, went on showing the old one. Two places held the same fact
 * and only one of them was the screen an admin would think to use.
 *
 * Contacts wins now, because that is where the college edits. Site Settings is
 * still honoured if the key is ever set, and the built-in default remains for
 * an unreachable API.
 */
function useFooterContact() {
  const channels = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic(undefined, "info").catch(() => [] as ContactChannel[]),
    [],
  )
  const pick = (matches: RegExp, field: "phones" | "emails") => {
    for (const c of channels ?? []) {
      if (!matches.test(c.name)) continue
      const values = (c[field] ?? []).map((v) => v.trim()).filter(Boolean)
      if (values.length) return values
    }
    return [] as string[]
  }
  return {
    phones: pick(/phone|mobile/i, "phones"),
    email: pick(/^e-?mail$/i, "emails")[0] ?? pick(/alternate|info/i, "emails")[0] ?? null,
  }
}

type SvgIconProps = { size?: number; color?: string }

const IconFacebook = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const IconTwitterX = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.626 5.905-5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const IconInstagram = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
  </svg>
)

const IconYoutube = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2.8 12 2.8 12 2.8s-4.6 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.1 12 22.1 12 22.1s4.6 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.5 8.5v-7.6l6.5 3.8-6.5 3.8z" />
  </svg>
)

const IconLinkedin = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)

const EASE = [0.22, 1, 0.36, 1] as const

const currentYear = new Date().getFullYear()

/**
 * The programme columns, from Admin -> Academics.
 *
 * These were three hand-written lists and they had drifted from what the
 * college actually offers: the footer advertised BCA, M.Tech CSE, M.Tech Power
 * Electronics and M.Tech Thermal - none of which are in the programme list -
 * while omitting CSE (Data Science), AIML, M.Tech AIDS, Geotechnical, Power
 * Systems and Diploma in AIML, which are. Same facts in two places, and only
 * one of them maintained.
 *
 * Read from the same source as Academics -> Courses & Intake now, so adding a
 * programme there puts it in the footer too, and the two can no longer
 * disagree. The lists below remain only for an unreachable API.
 */
const FALLBACK_UG = [
  { label: "CSE",          href: "/departments/cse"   },
  { label: "CSE (AI & ML)", href: "/departments/cse"  },
  { label: "ECE",          href: "/departments/ece"   },
  { label: "EEE",          href: "/departments/eee"   },
  { label: "Civil",        href: "/departments/civil" },
  { label: "Mechanical",   href: "/departments/mech"  },
  { label: "BCA",          href: "/departments/cse"   },
]

const FALLBACK_PG = [
  { label: "M.Tech – CSE",              href: "/departments/cse"  },
  { label: "M.Tech – VLSI & ES",        href: "/departments/ece"  },
  { label: "M.Tech – Power Electronics", href: "/departments/eee" },
  { label: "M.Tech – Structural",       href: "/departments/civil" },
  { label: "M.Tech – Thermal",          href: "/departments/mech" },
  { label: "MBA",                       href: "/departments/mba"  },
]

const FALLBACK_DIPLOMA = [
  { label: "Diploma in Civil",          href: "/admissions/diploma" },
  { label: "Diploma in Mechanical",     href: "/admissions/diploma" },
  { label: "Diploma in EEE",            href: "/admissions/diploma" },
  { label: "Diploma in ECE",            href: "/admissions/diploma" },
  { label: "Diploma in Computer Engg.", href: "/admissions/diploma" },
]

const quickLinks = [
  { label: "About",               href: "/about"       },
  { label: "Admissions",          href: "/admissions"  },
  { label: "Placements",          href: "/placements"  },
  { label: "Research",            href: "/research"    },
  { label: "Campus Life",         href: "/campus-life" },
  { label: "Alumni",              href: "/alumni"      },
  { label: "Degree Verification", href: "/degree-verification" },
]

// Social links now come from Site Settings (with these as fallbacks) - built
// inside the component, see `socials` there.

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const colVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px", lineHeight: 1.2 }}>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "19px", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "0.6px", textTransform: "uppercase" }}>
        {children}
      </div>
      <div style={{ width: "24px", height: "2px", background: "#FFE619" }} />
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "5px",
        // 4px, not 7. At nine entries the UG column ran ~90px taller than the
        // others, and since the grid rows are as tall as their tallest cell,
        // every neighbouring column gained that much dead space beneath it.
        padding: "4px 0",
        lineHeight: 1.35,
        color: hovered ? "#FFE619" : "rgba(255,255,255,0.72)",
        fontSize: "15.5px",
        textDecoration: "none",
        transition: "color 0.2s ease",
      }}
    >
      {hovered && <ArrowRight size={13} strokeWidth={2.5} />}
      {label}
    </Link>
  )
}

function LinkColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <motion.div variants={colVariants} style={{ display: "flex", flexDirection: "column" }}>
      <ColHeading>{heading}</ColHeading>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {links.map((l, i) => <NavLink key={`${l.href}-${i}`} href={l.href} label={l.label} />)}
      </div>
    </motion.div>
  )
}

function SocialBtn({ Icon, href }: { Icon: (props: SvgIconProps) => React.ReactElement; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: hovered ? "#FFE619" : "rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={hovered ? "#1e2570" : "#ffffff"} {...({ strokeWidth: 1.8 } as any)} />
    </a>
  )
}

export default function Footer() {
  const s = useSiteSettings()
  const contact = useFooterContact()
  const programmes = useProgrammeColumns()
  const footerEmail = contact.email ?? s("site.contactEmail", "info@ksrmce.ac.in")
  const socials = [
    { Icon: IconFacebook, href: s("site.socialFacebook", "https://facebook.com/ksrmceofficial") },
    { Icon: IconTwitterX, href: s("site.socialTwitter", "https://twitter.com/ksrmceofficial") },
    { Icon: IconInstagram, href: s("site.socialInstagram", "https://instagram.com/ksrmceofficial") },
    { Icon: IconYoutube, href: s("site.socialYoutube", "http://youtube.com/ksrmceofficialmedia") },
    // No hardcoded LinkedIn default - render it only once a URL is set, rather
    // than shipping an icon that links nowhere.
    { Icon: IconLinkedin, href: s("site.socialLinkedin", "") },
  ].filter((x) => x.href)

  return (
    <footer style={{ width: "100%", background: "#1e2570", color: "#ffffff", paddingTop: "56px" }}>
      <style>{`
        /* Six columns, sized for what each actually holds: the college block
           and the contact block carry a logo and a map, the four link columns
           only need room for a programme name. The old ratios were tuned when
           those lists were hand-written and shorter. */
        /* Three blocks: the college, the four link columns, the contact card. */
        .footer-grid {
          display: grid;
          grid-template-columns: 1.15fr 3.2fr 1.25fr;
          gap: 28px;
          max-width: 1760px;
          margin: 0 auto;
          padding: 0 40px;
          align-items: start;
        }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          /* Column gap only. A row gap did nothing here - there is a single
             row - while adding to the block's height. */
          gap: 0 24px;
          align-items: start;
        }
        .footer-bottom-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 1760px;
          margin: 0 auto;
          padding: 0 40px;
        }
        /* Ordered widest-first. These used to read 1100 -> 720 -> 768, and
           because 768 comes after 720 and both match below 720px, the two
           column layout never applied at all: the footer jumped straight from
           three columns to one, which is the gap of empty space at tablet
           width. */
        /* Widest-first. The college block and the contact card pair up on the
           top row and the four link columns take the full width below, so
           nothing short ever shares a row with something tall. */
        @media (max-width: 1180px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px 26px; padding: 0 28px; }
          .footer-links { grid-column: 1 / -1; }
        }
        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: 1fr; gap: 28px; padding: 0 20px; }
          .footer-links { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 20px; }
        }
        @media (max-width: 420px) {
          .footer-grid { padding: 0 16px; gap: 24px; }
          .footer-links { grid-template-columns: 1fr; gap: 22px; }
        }

        @media (max-width: 460px) {
          .footer-grid         { padding: 0 14px; gap: 24px; }
          .footer-bottom-inner {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
            padding: 0 14px;
            margin-bottom: 80px;
          }
          .footer-bottom-inner > div { text-align: center; margin-left: 0; }
          .footer-bottom-inner > div:first-child span,
          .footer-bottom-inner > div:last-child span {
            display: block;
            word-break: break-word;
          }
        }

        /* Stack the copyright + "Powered by" bar on phones/tablets so the
           right-hand text can't run off the edge of the screen. */
        @media (max-width: 640px) {
          .footer-bottom-inner { flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 0 16px; }
          .footer-bottom-inner > div { text-align: center; }
          .footer-bottom-inner span { display: block; word-break: break-word; }
        }
      `}</style>

      {/* MAIN GRID */}
      <motion.div
        className="footer-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* COL 1 — College Info */}
        <motion.div variants={colVariants}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "58px", height: "58px", borderRadius: "50%",
              background: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <img src="/logo.png" alt="K.S.R.M. Logo" loading="lazy" decoding="async" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "23px", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>
                K.S.R.M.
              </div>
              <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
                College of Engineering
              </div>
            </div>
          </div>

          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 14px" }}>
            46+ years of engineering excellence in Kadapa, Andhra Pradesh.
          </p>

          {/* ACCREDITATIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "16px" }}>
            {["UGC Autonomous", "NAAC A+", "NBA Accredited", "AICTE Approved", "ISO 9001:2015 Certified"].map((a) => (
              <span key={a} style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.55)" }}>{a}</span>
            ))}
          </div>

          {/* SOCIAL ICONS */}
          <div style={{ display: "flex", gap: "10px" }}>
            {socials.map(({ Icon, href }) => (
              <SocialBtn key={href} Icon={Icon} href={href} />
            ))}
          </div>
        </motion.div>

        {/* The four link columns are one group.
            They used to be four siblings of the college block and the contact
            block, which are far taller - a logo, five accreditations and the
            socials on one side, an address and an embedded map on the other.
            A grid row is as tall as its tallest cell, so every short link
            column got a band of empty space underneath it. Grouped, the four
            sit in their own row and are all much the same height. */}
        <motion.div className="footer-links" variants={colVariants}>
          <LinkColumn heading="UG Programs" links={programmes.ug} />
          <LinkColumn heading="PG Programs" links={programmes.pg} />
          <LinkColumn heading="Diploma" links={programmes.diploma} />
          <LinkColumn heading="Quick Links" links={quickLinks} />
        </motion.div>

        {/* COL 6 — Contact + Map */}
        <motion.div variants={colVariants}>
          <ColHeading>Contact</ColHeading>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
            <MapPin size={15} color="#FFE619" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, whiteSpace: "pre-line" }}>
              {s("site.contactAddress", "K.S.R.M. College of Engineering,\nKadapa, AP – 516005")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
            <Phone size={15} color="#FFE619" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, whiteSpace: "pre-line" }}>
              {contact.phones.length
                ? contact.phones.join("\n")
                : s("site.contactPhone", "+91 9000073434\n08562 295972")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Mail size={15} color="#FFE619" strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <a href={`mailto:${footerEmail}`} style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
              {footerEmail}
            </a>
          </div>

          <iframe
            src={s(
              "site.googleMapsEmbedUrl",
              "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.125530584371!2d78.76410318567737!3d14.477480402447771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb373e15c65e6b7%3A0x2b13242197e9d9fa!2zS1NSTSDgsJXgsL7gsLLgsYfgsJzgsY0!5e0!3m2!1ste!2sin!4v1479195998208",
            )}
            width="100%"
            height="150"
            style={{ border: "none", borderRadius: "8px", display: "block", opacity: 0.9 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </motion.div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "44px", padding: "12px 0" }}>
        <div className="footer-bottom-inner" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1760px",
          margin: "0 auto",
          padding: "0 40px",
          gap: "16px",
        }}>
          {/* LEFT: Copyright + Kandula Trust */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {s("site.footerCopyright", `© ${currentYear} K.S.R.M. College of Engineering. All Rights Reserved.`)}
            </span>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.4px" }}>
              A unit of Sri Kandula Obul Reddy Charities
            </span>
          </div>

          {/* RIGHT: Powered by - no nowrap so it wraps instead of overflowing
              the screen on mobile (space-between already right-aligns it on
              desktop). */}
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              Powered by Talent Trek Technologies
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}