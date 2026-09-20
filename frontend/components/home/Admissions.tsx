"use client"

import { motion } from "framer-motion"
import { resolveFileUrl } from "@/lib/api-base";
import Container from "@/components/ui/Container"
import {
  getSectionPublic,
  getAdmissionProgramsPublic,
  AdmissionsContent,
  AdmissionsPoster,
  AdmissionProgram,
} from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"
import { formatAcademicYearShort } from "@/lib/academic-year"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/** The poster shipped with the build, used until the CMS carries one. */
const FALLBACK_POSTER: AdmissionsPoster = {
  url: "/admissions-2026-poster.webp",
  alt: "K.S.R.M. College of Engineering - Admissions Open 2026-27",
}

const FALLBACK_ADMISSIONS: AdmissionsContent = {
  badge: `ADMISSIONS ${formatAcademicYearShort()}`,
  heading: "Begin Your Engineering Journey",
  subtitle: "EAPCET Code: K.S.R.M. | Kadapa, Andhra Pradesh",
  helplinePhones: [
    { display: "+91-9000073434", href: "tel:+919000073434" },
    { display: "+91-8143731980", href: "tel:+918143731980" },
  ],
  helplineEmail: "ksrmcengg@yahoo.co.in",
  poster: FALLBACK_POSTER,
}

const FALLBACK_PROGRAMS: AdmissionProgram[] = [
  {
    id: -1,
    section: "homepage_admission_programs",
    icon: "B.Tech Programmes",
    imageUrl: "/b-tech-banner.webp",
    mediaId: null,
    title: "B.Tech Engineering",
    description: "750+ Seats | 8 Branches | 4 Years",
    tags: ["CSE", "ECE", "EEE", "CIVIL", "MECH", "AI&ML", "DS", "AIML"],
    linkUrl: "/admissions/ug",
    linkText: "View UG Courses",
    sortOrder: 0,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    deletedBy: null,
    version: 1,
  },
  {
    id: -2,
    section: "homepage_admission_programs",
    icon: "Diploma / Polytechnic",
    imageUrl: "/diploma-banner.webp",
    mediaId: null,
    title: "Diploma Programmes",
    description: "Lateral Entry Available | 3 Years | EAPCET Eligible",
    tags: ["Civil", "Mechanical", "ECE", "EEE", "CSE"],
    linkUrl: "/admissions/diploma",
    linkText: "View Diploma Courses",
    sortOrder: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    deletedBy: null,
    version: 1,
  },
]

interface AdmissionsState {
  admissions: AdmissionsContent
  programs: AdmissionProgram[]
}

const PROGRAM_LINKS = [
  {
    match: ["b.tech", "btech", "undergraduate", "ug"],
    href: "/admissions/ug",
    text: "View UG Courses",
  },
  {
    match: ["diploma", "polytechnic"],
    href: "/admissions/diploma",
    text: "View Diploma Courses",
  },
  {
    match: ["m.tech", "mtech", "mba", "postgraduate", "pg"],
    href: "/admissions/pg",
    text: "View PG Courses",
  },
]

function normalizeProgram(program: AdmissionProgram): AdmissionProgram {
  const title = program.title.trim()
  const normalizedTitle = title.toLowerCase()
  const localRoute = PROGRAM_LINKS.find((route) =>
    route.match.some((term) => normalizedTitle.includes(term)),
  )

  return {
    ...program,
    imageUrl: resolveFileUrl(program.imageUrl?.trim() || "") || "/b-tech-banner.webp",
    title: title || "Admission Programme",
    description: program.description?.trim() || null,
    tags: program.tags.filter((tag) => tag.trim()).map((tag) => tag.trim()),
    linkUrl: localRoute?.href || program.linkUrl?.trim() || "/admissions",
    linkText: localRoute?.text || program.linkText?.trim() || "Learn More",
  }
}

/**
 * The poster to show: the one in the CMS, else the one in the build.
 *
 * A saved record from before the field existed has no poster at all, so the
 * section would otherwise open on a blank card the first time anyone edits
 * anything else on it.
 */
function normalizePoster(poster: AdmissionsPoster | null | undefined): AdmissionsPoster {
  const url = resolveFileUrl(poster?.url?.trim() || "")
  if (!url) return FALLBACK_POSTER

  return {
    url,
    alt: poster?.alt?.trim() || FALLBACK_POSTER.alt,
    href: resolveFileUrl(poster?.href?.trim() || "") || url,
  }
}

function normalizeAdmissions(content: AdmissionsContent | null | undefined): AdmissionsContent {
  if (!content) return FALLBACK_ADMISSIONS

  return {
    badge: content.badge?.trim() || FALLBACK_ADMISSIONS.badge,
    heading: content.heading?.trim() || FALLBACK_ADMISSIONS.heading,
    subtitle: content.subtitle?.trim() || FALLBACK_ADMISSIONS.subtitle,
    helplinePhones: content.helplinePhones?.length ? content.helplinePhones : FALLBACK_ADMISSIONS.helplinePhones,
    helplineEmail: content.helplineEmail?.trim() || FALLBACK_ADMISSIONS.helplineEmail,
    poster: normalizePoster(content.poster),
  }
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

async function fetchAdmissions(): Promise<AdmissionsState> {
  const [section, programsList] = await Promise.all([
    getSectionPublic("admissions"),
    getAdmissionProgramsPublic(),
  ])
  return {
    admissions: normalizeAdmissions(section?.content),
    programs: programsList.length > 0 ? programsList.map(normalizeProgram) : FALLBACK_PROGRAMS,
  }
}

export default function Admissions({
  previewData,
}: {
  previewData?: { admissions?: AdmissionsContent; programs?: AdmissionProgram[] }
}) {
  const live = useLiveData(fetchAdmissions, [], { skip: !!previewData })
  const admissions = previewData?.admissions ?? live?.admissions ?? FALLBACK_ADMISSIONS
  const programs = previewData?.programs ?? live?.programs ?? FALLBACK_PROGRAMS
  const poster = normalizePoster(admissions.poster)

  return (
    <section
      style={{
        width: "100%",
        background: "#ffffff",
        padding: "40px 0",
        borderTop: "1px solid #f1f5f9",
      }}
    >
      <style>{`
        .admissions-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .admissions-badge {
          display: inline-block;
          background: #2B3490;
          color: #FFE619;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .admissions-heading {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(23px, 6.4vw, 40px);
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 8px;
          line-height: 1.2;
        }

        .admissions-subtitle {
          font-size: 16px;
          color: #999;
          margin: 0;
        }

        /* One row, always.
           This used to be a three-column grid, so the fourth programme the
           college added started a second row, the fifth a third, and the
           homepage grew by 400px every time someone uploaded a card. Laying
           the cards out along a single scrolling row means the section is the
           same height with three programmes or thirty - the row scrolls
           sideways instead of the page growing downwards.
           minmax(300px, 1fr): while the cards fit they share the width evenly
           and nothing scrolls, which is what it looks like today. */
        .admissions-grid {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(300px, 1fr);
          gap: 28px;
          max-width: 1760px;
          margin: 0 auto;
          align-items: stretch;
          /* Vertical padding, because overflow clips at the padding box and
             the cards lift and cast a shadow on hover. */
          padding: 14px 16px 18px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x proximity;
          scrollbar-width: thin;
          /* Keeps a sideways swipe in the row instead of turning into the
             browser's back gesture. */
          overscroll-behavior-x: contain;
        }

        .admissions-grid > * { scroll-snap-align: start; }

        .admissions-poster-card {
          display: block;
          position: relative;
          /* One height for every card in the row, poster included, so the
             section is a predictable band rather than as tall as whatever was
             uploaded. */
          height: 340px;
          background: #eef1f6;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.10);
          border: 1px solid #eef0f3;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .admissions-poster-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(43, 52, 144, 0.18);
        }

        /* The poster is a notice, not a decoration: cropping it to fill the
           card cut the heading off "SPOT ADMISSIONS 2026-27" and sliced the
           body text mid-sentence. Contain shows whatever was uploaded whole,
           whichever shape it is. */
        /* Absolute so the poster fills the card without setting its height:
           a portrait poster would otherwise make the whole section as tall as
           itself. It is shown whole inside whatever space the row has. */
        .admissions-poster-card img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        /* A programme card is its poster. The blue panel used to sit below the
           image, which made every card twice as tall as it needed to be and
           left the image squeezed into a strip at the top. It is now an
           overlay: the card shows the poster, and the details appear over it
           on hover. */
        .admissions-card {
          position: relative;
          background: #eef1f6;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.10);
          width: 100%;
          height: 340px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .admissions-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 36px rgba(43, 52, 144, 0.18);
        }

        .admissions-card-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .admissions-card-panel {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(43, 52, 144, 0.95) 0%, rgba(30, 37, 112, 0.97) 100%);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        /* Only where there is a cursor to hover with. focus-within matters as
           much as hover: the button inside is a real link, and hiding it
           behind a pointer would put it out of reach of the keyboard. */
        @media (hover: hover) and (pointer: fine) {
          .admissions-card:hover .admissions-card-panel,
          .admissions-card:focus-within .admissions-card-panel { opacity: 1; }
        }

        /* A touch screen has no hover, so the details cannot be hidden behind
           one. They sit in a strip along the bottom instead, over a gradient,
           leaving most of the poster visible. */
        @media (hover: none) {
          .admissions-card-panel {
            opacity: 1;
            inset: auto 0 0 0;
            padding-top: 48px;
            background: linear-gradient(180deg, rgba(20, 26, 74, 0) 0%, rgba(20, 26, 74, 0.93) 42%);
          }
          /* Scoped through the card, because the unqualified
             .admissions-branches rule is defined further down this stylesheet
             and would otherwise win on source order and put the chips back. */
          .admissions-card .admissions-branches { display: none; }
          /* The label repeats the title, and on a strip every line costs
             poster. Title, one info line and the button are enough. */
          .admissions-card .admissions-card-label { display: none; }
          .admissions-card .admissions-card-panel { padding: 36px 18px 16px; }
        }

        .admissions-card-label {
          display: inline-block;
          background: rgba(255, 255, 255, 0.12);
          color: #FFE619;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          width: fit-content;
        }

        .admissions-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .admissions-branches {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .admissions-branch-pill {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }

        .admissions-info {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 12px;
          line-height: 1.4;
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .admissions-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #FFE619 0%, #FFD700 100%);
          color: #2B3490;
          padding: 12px 28px;
          border-radius: 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          width: fit-content;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(255, 230, 25, 0.2);
        }

        .admissions-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(43, 52, 144, 0.1);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .admissions-button:active::before {
          animation: ripple 0.6s ease-out;
        }

        .admissions-button:hover {
          background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(255, 230, 25, 0.4);
        }

        .admissions-helpline {
          text-align: center;
          padding: 20px 24px;
          background: #f7f8fa;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          margin-top: 36px;
          max-width: 1760px;
          margin-left: auto;
          margin-right: auto;
          font-size: 16px;
          color: #666;
        }

        .admissions-helpline a {
          color: #2B3490;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .admissions-helpline a:hover {
          color: #1e1e47;
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          /* Still one row - a card at a time, swiped, with the next one
             peeking so it is obvious there is more. */
          .admissions-grid {
            grid-auto-columns: minmax(260px, 78vw);
            gap: 18px;
            scroll-snap-type: x mandatory;
          }
          .admissions-poster-card { height: 320px; }
          .admissions-card { height: 320px; }
        }

        @media (max-width: 768px) {
          .admissions-heading { font-size: clamp(19px, 5.1vw, 32px); }
          .admissions-card-image { height: 150px; }
          .admissions-card-panel { padding: 18px 20px; }
        }
      `}</style>

      <Container>
        {/* HEADER */}
        <motion.div
          className="admissions-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="admissions-badge">{admissions.badge}</div>
          <h2 className="admissions-heading">{admissions.heading}</h2>
          <p className="admissions-subtitle">{admissions.subtitle}</p>
        </motion.div>

        {/* CARDS GRID — poster + programme cards, all three side by side */}
        <div className="admissions-grid">
          <a
            href={poster.href || poster.url}
            target="_blank"
            rel="noopener noreferrer"
            title={poster.alt}
            className="admissions-poster-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-supplied poster */}
            <img src={poster.url} alt={poster.alt} loading="lazy" />
          </a>
          {programs.map((program) => (
            <div key={program.id}>
              <div className="admissions-card">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="admissions-card-image"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.background = "#e5e5e5"
                    img.style.opacity = "0.3"
                  }}
                />

                <div className="admissions-card-panel">
                  <div>
                    {program.icon && <div className="admissions-card-label">{program.icon}</div>}
                    <h3 className="admissions-card-title">{program.title}</h3>

                    <div className="admissions-branches">
                      {program.tags.map((branch) => (
                        <span key={branch} className="admissions-branch-pill">
                          {branch}
                        </span>
                      ))}
                    </div>

                    {program.description && <div className="admissions-info">{program.description}</div>}
                  </div>

                  <a
                    href={program.linkUrl}
                    target={isExternalUrl(program.linkUrl) ? "_blank" : undefined}
                    rel={isExternalUrl(program.linkUrl) ? "noopener noreferrer" : undefined}
                    className="admissions-button"
                    download={program.linkUrl.endsWith(".pdf") || undefined}
                  >
                    <span>{program.linkText ?? "Learn More"}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HELPLINE */}
        <motion.div
          className="admissions-helpline"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          📞 Admissions Helpline:{" "}
          {admissions.helplinePhones.map((phone, i) => (
            <span key={phone.href}>
              <a href={phone.href}>{phone.display}</a>
              {i < admissions.helplinePhones.length - 1 && " | "}
            </span>
          ))}
          {" | "}
          ✉️{" "}
          <a href={`mailto:${admissions.helplineEmail}`}>{admissions.helplineEmail}</a>
        </motion.div>
      </Container>
    </section>
  )
}
