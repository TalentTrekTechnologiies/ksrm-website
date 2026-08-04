"use client"

import { motion } from "framer-motion"
import Container from "@/components/ui/Container"
import { coursesIntake } from "@/data/academics/coursesIntake"
import { Award, BookOpen } from "lucide-react"
import Link from "next/link"
import CmsText from "@/components/CmsText"
import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api"
import { getDepartmentProgrammesPublic, DepartmentProgramme } from "@/lib/department-programmes-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * Headings for each CMS level, in the order they should appear. The static
 * table used free-text headings ("B.Tech (4 Years)"); these are the same
 * groupings keyed off the ProgrammeLevel enum instead.
 */
const LEVEL_GROUPS: { level: "UG" | "PG" | "DIPLOMA" | "PHD"; label: string; regulation: string }[] = [
  { level: "UG", label: "B.Tech (4 Years)", regulation: "R23" },
  { level: "PG", label: "M.Tech / MBA (2 Years)", regulation: "R23" },
  { level: "DIPLOMA", label: "Diploma (3 Years)", regulation: "SBTET" },
  { level: "PHD", label: "Ph.D (Research)", regulation: "JNTUA" },
]

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export default function CoursesIntakeTemplate() {
  // Every programme across every department. Adding one under Departments ->
  // Programmes (with its intake) makes it appear here, so the seat counts on
  // this page and on the department's own page can no longer disagree. The
  // fetcher never rejects: an unreachable API falls back to the built-in
  // table rather than emptying the page.
  const cmsProgrammes = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    [],
  )

  const cmsGroups = LEVEL_GROUPS.map((g) => ({
    level: g.label,
    regulation: g.regulation,
    intake: (cmsProgrammes ?? [])
      .filter((p) => p.level === g.level)
      .map((p) => ({
        branch: p.name,
        // Falls back to the department's short name when no code is set, so
        // the column is never blank for want of a value someone has not typed.
        code: p.code || p.department?.shortName || p.department?.name || "",
        intake: p.intake,
        // Never inferred - an accreditation claim is only shown if an admin
        // actually recorded one against this programme.
        accreditation: p.accreditation ?? "",
      })),
  })).filter((g) => g.intake.length > 0)

  // Real CMS data wins; otherwise the page reads exactly as it always has.
  const programmes = cmsGroups.length > 0 ? cmsGroups : coursesIntake.programmes

  // The admissions phone and email come from the Contacts module rather than
  // a copy kept here: the college's number already lives there, and a second
  // copy is the thing that goes stale. Falls back to the built-in values when
  // no matching contact record exists.
  const contacts = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic(undefined, "directory").catch(() => [] as ContactChannel[]),
    [],
  )
  const admissions = (contacts ?? []).find((c) => /admission/i.test(c.name))
  const admissionsPhone = admissions?.phones?.join(" / ") || coursesIntake.contactAdmissions.phone
  const admissionsEmail = admissions?.emails?.[0] || coursesIntake.contactAdmissions.email

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .ci-hero {
          position: relative;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 60%, #0d1033 100%);
          overflow: hidden;
        }
        .ci-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(60deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 18px);
        }
        .ci-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #FFE619;
        }
        .ci-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 24px;
          font-family: "DM Sans", sans-serif;
        }
        .ci-breadcrumb a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .ci-breadcrumb a:hover {
          opacity: 0.8;
        }
        .ci-breadcrumb span {
          color: #FFE619;
        }
        .ci-approvals-strip {
          background: #FFE619;
          padding: 24px 0;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ci-approval-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #2B3490;
          color: #fff;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
        }
        .ci-eapcet-box {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          padding: 32px;
          border-radius: 12px;
          text-align: center;
          margin-top: 40px;
        }
        .ci-eapcet-label {
          font-size: 15px;
          opacity: 0.9;
        }
        .ci-eapcet-code {
          font-family: "Rajdhani", sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #FFE619;
          margin: 12px 0 0;
        }
        .ci-table-section {
          margin-top: 40px;
        }
        .ci-table-title {
          font-family: "Rajdhani", sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 40px 0 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #FFE619;
        }
        .ci-table-wrapper {
          overflow-x: auto;
          border: 1px solid #eef0f3;
          border-radius: 8px;
        }
        .ci-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 15px;
        }
        .ci-table thead th {
          background: #2B3490;
          color: #fff;
          padding: 16px;
          text-align: left;
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ci-table tbody td {
          padding: 14px 16px;
          border-bottom: 1px solid #eef0f3;
          color: #555;
        }
        .ci-table tbody tr:nth-child(odd) {
          background: #f4f3ef;
        }
        .ci-table tbody tr:hover {
          background: #fffaed;
        }
        .ci-branch-name {
          font-weight: 600;
          color: #1a1a2e;
        }
        .ci-code-badge {
          display: inline-block;
          background: #eef1ff;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
        }
        .ci-intake-number {
          font-family: "Rajdhani", sans-serif;
          font-weight: 700;
          color: #2B3490;
          font-size: 16px;
        }
        .ci-nba-badge {
          display: inline-block;
          background: #FFE619;
          color: #2B3490;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          font-family: "Rajdhani", sans-serif;
        }
        .ci-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px;
          padding: 40px;
          color: #fff;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }
        .ci-contact-item h4 {
          font-family: "Rajdhani", sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #FFE619;
          margin: 0;
        }
        .ci-contact-item p {
          font-size: 15px;
          margin: 8px 0 0;
          line-height: 1.6;
        }
        .ci-contact-item a {
          color: #FFE619;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .ci-contact-item a:hover {
          opacity: 0.8;
        }
        @media (max-width: 900px) {
          .ci-contact-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .ci-table {
            font-size: 13px;
          }
          .ci-table thead th,
          .ci-table tbody td {
            padding: 10px;
          }
        }
      `}</style>

      {/* HERO */}
      <section
        className="ci-hero"
        style={{
          backgroundImage: `url('/images/campus/04.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(43, 52, 144, 0.85)' }} />
        <Container>
          <div style={{ padding: "72px 0", position: "relative", zIndex: 1 }}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="ci-eyebrow" style={{ marginBottom: 16 }}>
                Academics
              </motion.div>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.08,
                  margin: 0,
                }}
              >
                <CmsText section="academics.courses-intake" slot="courses-offered-intake" />
              </motion.h1>
              <motion.p
                variants={fadeUp}
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 18,
                  lineHeight: 1.6,
                  margin: "16px 0 0",
                  fontWeight: 400,
                  maxWidth: 700,
                }}
              >
                <CmsText section="academics.courses-intake" slot="aicte-approved-programmes-with-strong" />
              </motion.p>

              <motion.div variants={fadeUp} className="ci-breadcrumb">
                <Link href="/">Home</Link>
                <span>/</span>
                <Link href="/academics">Academics</Link>
                <span>/</span>
                <span><CmsText section="academics.courses-intake" slot="courses-offered-intake" /></span>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* APPROVALS STRIP */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="ci-approvals-strip">
        {coursesIntake.approvals.map((approval, idx) => (
          <motion.div key={idx} variants={fadeUp} className="ci-approval-badge">
            <Award size={16} />
            {/* The array only fixes how many badges render; each label is
                editable at Page Content -> Academics -> Courses & Intake. */}
            <CmsText section="academics.courses-intake" slot={`approvals.${idx}`} />
          </motion.div>
        ))}
      </motion.section>

      {/* INTRO & EAPCET */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}
            >
              <CmsText section="academics.courses-intake" slot="k-s-r-m-college" multiline />
            </motion.p>

            <motion.div variants={fadeUp} className="ci-eapcet-box">
              <div className="ci-eapcet-label">Common Entrance Test Code</div>
              <div className="ci-eapcet-code">
                <BookOpen size={40} style={{ display: "inline", marginRight: 12 }} />
                <CmsText section="academics.courses-intake" slot="eapcetCode" />
              </div>
              <p style={{ margin: "8px 0 0", opacity: 0.9 }}><CmsText section="academics.courses-intake" slot="use-this-code-during-eapcet" /></p>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* PROGRAMMES */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            {programmes.map((prog, progIdx) => {
              const totalIntake = prog.intake.reduce((sum, entry) => sum + entry.intake, 0)

              return (
                <motion.div key={progIdx} variants={fadeUp}>
                  <h3 className="ci-table-title">{prog.level}</h3>
                  <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
                    Regulation: <strong>{prog.regulation}</strong> | Total Intake: <strong className="ci-intake-number">{totalIntake} seats</strong>
                  </p>

                  <div className="ci-table-wrapper">
                    <table className="ci-table">
                      <thead>
                        <tr>
                          <th>Branch / Programme</th>
                          <th>Code</th>
                          <th>Intake</th>
                          <th>Accreditation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prog.intake.map((entry, entryIdx) => (
                          <tr key={entryIdx}>
                            <td className="ci-branch-name">{entry.branch}</td>
                            <td>
                              <span className="ci-code-badge">{entry.code}</span>
                            </td>
                            <td className="ci-intake-number">{entry.intake}</td>
                            <td>
                              {entry.accreditation ? (
                                <span className="ci-nba-badge">{entry.accreditation}</span>
                              ) : (
                                <span style={{ color: "#999" }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="ci-contact-card"
          >
            <div className="ci-contact-item">
              <h4><CmsText section="academics.courses-intake" slot="admissions-office" /></h4>
              <p>For enquiries regarding courses and admissions</p>
            </div>
            <div className="ci-contact-item">
              <h4>Phone</h4>
              <p>
                <a href={`tel:${admissionsPhone.split("/")[0].trim()}`}>
                  {admissionsPhone}
                </a>
              </p>
            </div>
            <div className="ci-contact-item">
              <h4>Email</h4>
              <p>
                <a href={`mailto:${admissionsEmail}`}>{admissionsEmail}</a>
              </p>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
