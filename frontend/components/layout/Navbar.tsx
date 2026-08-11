"use client"

import { mediaFile } from "@/lib/api-base";
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Send } from "lucide-react"

const socialLinks = [
  { Icon: "f", href: "https://facebook.com/ksrmceofficial", label: "Facebook" },
  { Icon: "𝕏", href: "https://twitter.com/ksrmceofficial", label: "Twitter" },
  { Icon: "◆", href: "https://instagram.com/ksrmceofficial", label: "Instagram" },
  { Icon: "▶", href: "https://youtube.com/ksrmceofficialmedia", label: "YouTube" },
]

interface NavChild {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  children?: NavChild[]
}

/**
 * Top-level headings keep their original names and their original sub-menus,
 * unchanged. The split is only about which ones stay on the row: a heading
 * that has sub-pages stays, and the ones that were only ever a single page
 * (Research, IIC, EDC, Examinations, Alumni, Gallery, Careers, Degree
 * Verification, News & Events) collect under "More" - which is an ordinary
 * dropdown, exactly like every other sub-menu here, not a separate panel.
 */
const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About KSRMCE", href: "/about#about-ksrmce" },
      { label: "Vision & Mission", href: "/about#vision" },
      // Renamed at the college's request. The section it jumps to keeps the
      // trust's full name as its heading; only the menu entry is shorter.
      { label: "Sponsoring Body", href: "/about#charities" },
      // Governance, top down: the body that governs, the people who lead, then
      // the two councils under them. The Academic Council and Finance
      // Committee were on the IQAC page behind an "Apex Bodies" tab until the
      // college asked for them here.
      { label: "Governing Body", href: "/about#governing-body" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "  ↳ Correspondent and Secretary", href: "/about/correspondent" },
      { label: "  ↳ Chairman", href: "/about/chairman" },
      { label: "  ↳ Vice Chairman & MD", href: "/about/managing-director" },
      { label: "  ↳ Principal", href: "/about/principal" },
      { label: "Academic Council", href: "/about#academic-council" },
      { label: "Finance Committee", href: "/about#finance-committee" },
      // Finance Officer hidden at the college's request - removed from here
      // and from the About page's Leadership grid. The profile page itself
      // still exists (not deleted), just unlinked.
      // Ombudsperson is not on this menu: the office exists to settle student
      // grievances, so it sits under Grievance Redressal where a student
      // looking for it would actually go. The page itself is unchanged.
      { label: "Strategic Plan", href: "/about#strategic" },
      { label: "Policy Documents", href: "/about#policies" },
    ],
  },
  {
    label: "Departments",
    href: "/departments",
    // Student Chapter links do NOT live here - moved to the "Professional
    // Chapters" entry under Campus Life instead, at the college's request.
    // The section itself (components/departments/StudentChapter.tsx) is
    // still part of each department's own page either way; this is only
    // about which menu points at it.
    children: [
      { label: "Civil Engineering", href: "/departments/civil" },
      { label: "Computer Science and Engineering", href: "/departments/cse" },
      { label: "Electrical and Electronics Engineering", href: "/departments/eee" },
      { label: "Electronics and Communication Engineering ", href: "/departments/ece" },
      { label: "Mechanical Engineering", href: "/departments/mech" },
      { label: "Humanities and Sciences", href: "/departments/hs" },
      { label: "Management Studies (MBA)", href: "/departments/mba" },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    children: [
      { label: "Courses & Intake", href: "/academics/courses-intake" },
      { label: "Academic Calendar", href: "/academics/academic-calendar" },
      { label: "Syllabus", href: "/academics/syllabus" },
      { label: "Regulations", href: "/academics/regulations" },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    children: [
      { label: "Overview", href: "/admissions" },
      { label: "UG Programs (B.Tech)", href: "/admissions/ug" },
      { label: "PG Programs (M.Tech & MBA)", href: "/admissions/pg" },
      { label: "Diploma Programs", href: "/admissions/diploma" },
      { label: "Fee Structure", href: "/academics/fee-structure" },
    ],
  },
  // Promoted out of "More" to the main bar at the college's request. It sits
  // between Admissions and Placements so the bar follows a student's path
  // through the college rather than listing pages in no particular order.
  //
  // It earns a main-bar slot on the same rule as its neighbours: the page has
  // real sections to jump to, so it opens a menu rather than being a bare
  // link. "More" is for pages with nothing underneath them.
  {
    label: "Examinations",
    href: "/examinations",
    children: [
      { label: "Latest Notifications", href: "/examinations#notifications" },
      { label: "Academic Calendars", href: "/examinations#calendars" },
      { label: "Exam Time Tables", href: "/examinations#timetables" },
      { label: "Question Papers", href: "/examinations#question-papers" },
      { label: "Results & Fee Payment", href: "/examinations#results" },
      { label: "Contact the COE", href: "/examinations#contact" },
    ],
  },
  {
    label: "Placements",
    href: "/placements",
    children: [
      { label: "Overview", href: "/placements/overview" },
      { label: "MoUs", href: "/placements/mous" },
      { label: "Trainings", href: "/placements/trainings" },
      { label: "Internships", href: "/placements/internships" },
      { label: "Our Recruiters", href: "/placements/our-recruiters" },
      { label: "Placements Record", href: "/placements/placements-record" },
    ],
  },
  {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      { label: "Campus Facilities", href: "/campus-life/campus-facilities" },
      { label: "Central Library", href: "/campus-life/library" },
      { label: "Hostels", href: "/campus-life/hostels" },
      { label: "Transport", href: "/campus-life/transport" },
      { label: "Health Facilities", href: "/campus-life/health-facilities" },
      { label: "Sports", href: "/campus-life/sports" },
      { label: "NSS", href: "/campus-life/nss" },
      { label: "Startup Cell", href: "/campus-life/startup-cell" },
      { label: "Industry Institute Interaction", href: "/campus-life/industry-institute-interaction" },
      { label: "Equal Opportunity Cell", href: "/campus-life/equal-opportunity-cell" },
      { label: "SEDG Cell", href: "/campus-life/sedg-cell" },
      { label: "Facilities for Differently-Abled", href: "/campus-life/facilities-for-differently-abled" },
      { label: "Anti-Ragging", href: "/campus-life/anti-ragging" },
      { label: "Grievance Redressal", href: "/campus-life/grievance" },
      // Moved off the About menu. A student with a complaint looks here, not
      // under the college's governance pages.
      { label: "  ↳ Ombudsperson", href: "/about/ombudsman" },
      { label: "Cultural Club", href: "/campus-life/cultural" },
      { label: "College Fest", href: "/campus-life/college-fest" },
      // Department-wise, at the college's request - not nested under
      // Departments. The navbar only goes one dropdown deep, so this follows
      // the same flat "heading, then indented ↳ links" convention already
      // used for Ombudsperson under Grievance Redressal and for Leadership's
      // own sub-pages under About. Each link jumps straight to that
      // department's Student Chapter section
      // (components/departments/StudentChapter.tsx), which renders nothing
      // until that department actually has one entered.
      { label: "Professional Chapters", href: "/campus-life/professional-chapters" },
      { label: "  ↳ Civil Engineering Student Chapter", href: "/departments/civil#student-chapter" },
      { label: "  ↳ CSE Student Chapter", href: "/departments/cse#student-chapter" },
      { label: "  ↳ EEE Student Chapter", href: "/departments/eee#student-chapter" },
      { label: "  ↳ ECE Student Chapter", href: "/departments/ece#student-chapter" },
      { label: "  ↳ Mechanical Student Chapter", href: "/departments/mech#student-chapter" },
      { label: "  ↳ H&S Student Chapter", href: "/departments/hs#student-chapter" },
      { label: "  ↳ MBA Student Chapter", href: "/departments/mba#student-chapter" },
      // Was here as five hardcoded club names, all linking out to a
      // department page with nothing chapter-specific on it. Real chapters
      // now live under Departments, one "  ↳ Student Chapter" link per
      // department, next to the pages an admin already edits for that
      // department - not a separate generic list to keep in sync with them.
    ],
  },
  {
    label: "IQAC",
    href: "/iqac",
    children: [
      { label: "NAAC", href: "/naac" },
    ],
  },
  {
    label: "Mandatory Disclosure",
    href: "/mandatory-disclosure",
    children: [
      { label: "Accreditation", href: "/accreditation" },
      { label: "UGC Autonomous", href: "/mandatory-disclosure#doc-ugc-autonomous" },
      { label: "Other Statutory Documents", href: "/mandatory-disclosure#doc-other-statutory-documents" },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
    children: [
      { label: "Contact Us", href: "/contact" },
      { label: "RTI Rules", href: mediaFile(174) },
    ],
  },
  {
    label: "More",
    href: "#",
    children: [
      { label: "KGCET", href: "/kgcet" },
      { label: "Research", href: "/research" },
      { label: "IIC", href: "/iic" },
      { label: "EDC", href: "/edc" },
      { label: "Alumni", href: "/alumni" },
      { label: "Gallery", href: "/gallery" },
      { label: "Careers", href: "/careers" },
      { label: "Degree Verification", href: "/degree-verification" },
      { label: "News & Events", href: "/news" },
    ],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const pathname = usePathname()

  // The row still scrolls sideways as a safety net for narrow laptops and
  // browser zoom, rather than wrapping onto a second line.
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    // Recompute once more after webfont layout settles (item widths shift).
    const t = setTimeout(updateArrows, 400)
    window.addEventListener("resize", updateArrows)
    return () => { clearTimeout(t); window.removeEventListener("resize", updateArrows) }
  }, [updateArrows, pathname])

  // Dropdowns render as position:fixed so they escape the scroll row's
  // overflow clip; a short close timer bridges the gap between the trigger
  // and the fixed menu so the pointer can travel between them.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current) }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setHoveredDropdown(null), 140)
  }

  const openDropdown = (label: string, triggerEl: HTMLElement) => {
    cancelClose()
    // Measured from the trigger itself, never assumed: the navbar sits below
    // the header and ticker, so a hardcoded offset lands the menu up in the
    // logo area instead of under the item that opened it.
    const r = triggerEl.getBoundingClientRect()
    setDropdownPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - 262)),
      top: r.bottom,
    })
    setHoveredDropdown(label)
  }

  const isActive = (href: string) => href !== "#" && (pathname === href || pathname.startsWith(href + "/"))

  return (
    <div style={{
      background: "#2B3490",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
    }}>
      <style>{`
        @media (max-width: 900px) {
          .navbar-desktop-wrap { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        .navbar-desktop { scrollbar-width: none; -ms-overflow-style: none; }
        /* The dropdown's scrollbar, unlike the nav row's, is deliberately
           visible - it is the only cue that there is more below the fold. */
        .nav-dropdown-panel { scrollbar-width: thin; scrollbar-color: #C7CBE8 transparent; }
        .nav-dropdown-panel::-webkit-scrollbar { width: 8px; }
        .nav-dropdown-panel::-webkit-scrollbar-thumb { background: #C7CBE8; border-radius: 4px; }
        .nav-dropdown-panel::-webkit-scrollbar-thumb:hover { background: #2B3490; }
        .navbar-desktop::-webkit-scrollbar { display: none; }
        /* Centre the row WITHOUT justify-content: center. On a scrolling flex
           container that centres by pushing overflow equally to both sides,
           and the left-hand overflow lands at a negative scroll offset that no
           scrollbar or arrow can reach - which is how "Home" disappeared on
           narrower screens. Auto margins collapse to zero the moment free
           space runs out, so the row centres when it fits and starts hard at
           the left edge when it does not, with every item reachable. */
        .navbar-desktop > :first-child { margin-left: auto; }
        .navbar-desktop > :last-child { margin-right: auto; }
        .nav-scroll-arrow {
          position: absolute; top: 0; height: 48px; width: 46px;
          display: flex; align-items: center;
          background: transparent; color: #FFE619; border: none; cursor: pointer;
          font-size: 28px; font-weight: 800; z-index: 20; line-height: 1;
          transition: color 0.15s;
        }
        .nav-scroll-arrow:hover { color: #ffffff; }
        /* navbar-blue fade (not a box) so the yellow arrow stays legible over items */
        .nav-scroll-arrow.left { left: 0; justify-content: flex-start; padding-left: 4px;
          background: linear-gradient(to right, #2B3490 60%, rgba(43,52,144,0)); }
        .nav-scroll-arrow.right { right: 0; justify-content: flex-end; padding-right: 4px;
          background: linear-gradient(to left, #2B3490 60%, rgba(43,52,144,0)); }
        .nav-top-link:hover { color: #FFE619 !important; }
        .nav-drop-item:hover { background: #f2f4ff; }
        .nav-apply:hover { background: #b71c1c !important; }
      `}</style>

      {/* Apply Now sits OUTSIDE the scrolling row, so the row can overflow
          without carrying the college's main call to action off the right-hand
          edge with it - which is what an eleventh nav item did. */}
      <div className="navbar-desktop-wrap" style={{ display: "flex", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 auto", minWidth: 0 }}>
        {canLeft && (
          <button className="nav-scroll-arrow left" aria-label="Scroll navigation left" onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}>‹</button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="navbar-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "2px",
            padding: "0 10px",
            height: "48px",
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            scrollBehavior: "smooth",
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href)
            const hasChildren = !!(item.children && item.children.length > 0)
            const isOpen = hoveredDropdown === item.label
            // "More" is a grouping label, not a destination, so it opens on
            // click as a button instead of navigating anywhere.
            const isButton = item.href === "#"

            const sharedStyle: React.CSSProperties = {
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "0 10px",
              height: "34px",
              borderRadius: "5px",
              // The original nav sat at 15px; the design asks for 10% more.
              // Eleven top-level items fit at this size because Apply Now no
              // longer competes for room inside the scrolling row, and the
              // horizontal padding was tightened to buy the space back.
              fontSize: "16.5px",
              fontWeight: 600,
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.2px",
              whiteSpace: "nowrap",
              textDecoration: "none",
              transition: "all 0.2s",
              flex: "0 0 auto",
            }

            return (
              <div
                key={item.label}
                // Full row height so the measured bottom edge is the navbar's
                // own bottom, and so the hover target covers the whole strip.
                style={{ display: "flex", alignItems: "center", height: "48px", flex: "0 0 auto" }}
                onMouseEnter={(e) => (hasChildren ? openDropdown(item.label, e.currentTarget) : (cancelClose(), setHoveredDropdown(null)))}
                onMouseLeave={scheduleClose}
              >
                {isButton ? (
                  <button
                    onClick={(e) => (isOpen ? setHoveredDropdown(null) : openDropdown(item.label, e.currentTarget))}
                    style={{
                      ...sharedStyle,
                      background: "#c62828",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    {item.label}
                    <ChevronDown size={13} strokeWidth={2.5} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="nav-top-link"
                    style={{
                      ...sharedStyle,
                      color: active || isOpen ? "#FFE619" : "rgba(255,255,255,0.9)",
                      background: isOpen ? "rgba(255,255,255,0.08)" : "transparent",
                      boxShadow: active ? "inset 0 -2px 0 #FFE619" : "none",
                    }}
                  >
                    {item.label}
                    {hasChildren && <ChevronDown size={13} strokeWidth={2.5} />}
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {canRight && (
          <button className="nav-scroll-arrow right" aria-label="Scroll navigation right" onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}>&rsaquo;</button>
        )}
        </div>

          <Link
            href="/admissions"
            className="nav-apply"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "6px",
              marginRight: "12px",
              padding: "0 13px",
              height: "34px",
              borderRadius: "5px",
              background: "#c62828",
              color: "#fff",
              fontSize: "16.5px",
              fontWeight: 700,
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.2px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flex: "0 0 auto",
              transition: "background 0.2s",
            }}
          >
            Apply Now
            <Send size={13} strokeWidth={2.5} />
          </Link>
      </div>

      {/* Dropdown menu — fixed-position so it escapes the scroll row's clip */}
      {(() => {
        const item = navItems.find((i) => i.label === hoveredDropdown && i.children && i.children.length)
        if (!item || !dropdownPos) return null
        return (
          <div
            style={{
              position: "fixed",
              left: dropdownPos.left,
              top: dropdownPos.top,
              background: "#fff",
              minWidth: "250px",
              boxShadow: "0 10px 28px rgba(0,0,0,0.18)",
              borderRadius: "0 0 8px 8px",
              zIndex: 1100,
              padding: "6px 0",
              display: "flex",
              flexDirection: "column",
              // About now carries 14 links. The menu is position:fixed, so it
              // simply ran past the bottom of the window and the last few
              // items were unreachable - no scrollbar, nothing to drag.
              // Cap it at whatever room is left below the trigger and let it
              // scroll. 12px keeps it off the very bottom edge.
              maxHeight: `calc(100vh - ${dropdownPos.top}px - 12px)`,
              overflowY: "auto",
              // Without this, reaching the end of the menu hands the wheel
              // back to the page, which scrolls away under the pointer.
              overscrollBehavior: "contain",
            }}
            className="nav-dropdown-panel"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="nav-drop-item"
                onClick={() => setHoveredDropdown(null)}
                target={child.href.startsWith("http") ? "_blank" : undefined}
                rel={child.href.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{
                  display: "block",
                  padding: "10px 20px",
                  color: "#2B3490",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "16.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )
      })()}

      {/* Mobile Hamburger */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px" }}>
        <button
          className="navbar-hamburger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "10px 8px",
          }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "#2B3490",
          maxHeight: "75vh",
          overflowY: "auto",
        }}>
          {navItems.map((item) => {
            const hasChildren = !!(item.children && item.children.length > 0)
            const isExpanded = expandedMobile === item.label
            const active = isActive(item.href)

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 14px",
                      fontSize: "15px",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "'Rajdhani', sans-serif",
                      color: active ? "#FFE619" : "#fff",
                      cursor: "pointer",
                      background: isExpanded ? "rgba(255,230,25,0.1)" : "transparent",
                    }}
                    onClick={() => setExpandedMobile(isExpanded ? null : item.label)}
                  >
                    <span>{item.label}</span>
                    <ChevronDown size={15} style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }} />
                  </div>
                  {isExpanded && (
                    <div style={{ background: "rgba(255,255,255,0.05)" }}>
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          target={child.href.startsWith("http") ? "_blank" : undefined}
                          rel={child.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          style={{
                            display: "block",
                            padding: "10px 14px 10px 36px",
                            fontSize: "14px",
                            fontWeight: 500,
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            fontFamily: "'Rajdhani', sans-serif",
                            textDecoration: "none",
                            color: "rgba(255,255,255,0.8)",
                          }}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "block",
                  padding: "13px 14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "'Rajdhani', sans-serif",
                  textDecoration: "none",
                  color: active ? "#FFE619" : "#fff",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}

          <div style={{ padding: "14px" }}>
            <Link
              href="/admissions"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "11px",
                borderRadius: "6px",
                background: "#c62828",
                color: "#fff",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Apply Now
              <Send size={15} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Mobile Social Links */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 14px",
            display: "flex",
            gap: "12px",
          }}>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                style={{ color: "#fff", fontSize: "17px", textDecoration: "none" }}
              >
                {link.Icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
