"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import {
  getSectionPublic,
  getAdmissionProgramsPublic,
  AdmissionsContent,
  AdmissionProgram,
} from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const FALLBACK_ADMISSIONS: AdmissionsContent = {
  badge: "ADMISSIONS 2025-26",
  heading: "Begin Your Engineering Journey",
  subtitle: "EAPCET Code: KSRM | Kadapa, Andhra Pradesh",
  helplinePhones: [
    { display: "+91-9000073434", href: "tel:+919000073434" },
    { display: "+91-8143731980", href: "tel:+918143731980" },
  ],
  helplineEmail: "ksrmcengg@yahoo.co.in",
}

const FALLBACK_PROGRAMS: AdmissionProgram[] = [
  {
    id: -1,
    section: "homepage_admission_programs",
    icon: "B.Tech Programmes",
    imageUrl: "/b-tech-banner.png",
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
    imageUrl: "/diploma-banner.png",
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
    imageUrl: program.imageUrl?.trim() || "/b-tech-banner.png",
    title: title || "Admission Programme",
    description: program.description?.trim() || null,
    tags: program.tags.filter((tag) => tag.trim()).map((tag) => tag.trim()),
    linkUrl: localRoute?.href || program.linkUrl?.trim() || "/admissions",
    linkText: localRoute?.text || program.linkText?.trim() || "Learn More",
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
          font-size: 40px;
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

        .admissions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          max-width: 1140px;
          margin: 0 auto;
          align-items: stretch;
          padding: 0 16px;
        }

        .admissions-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.10);
          display: flex;
          flex-direction: column;
          max-width: 540px;
        }

        .admissions-card-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          object-position: center top;
          display: block;
          background: #f0f0f0;
          flex-shrink: 0;
        }

        .admissions-card-panel {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          padding: 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
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
          max-width: 1140px;
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

        @media (max-width: 768px) {
          .admissions-heading { font-size: 32px; }
          .admissions-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .admissions-card { max-width: none; }
          .admissions-card-image { height: 200px; }
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

        {/* CARDS GRID */}
        <div className="admissions-grid">
          {programs.map((program) => (
            <div key={program.id}>
              <div className="admissions-card">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="admissions-card-image"
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
