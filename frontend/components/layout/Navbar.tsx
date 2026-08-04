"use client"

import { mediaFile } from "@/lib/api-base";
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const socialLinks = [
  { Icon: "f", href: "https://facebook.com/ksrmceofficial", label: "Facebook" },
  { Icon: "𝕏", href: "https://twitter.com/ksrmceofficial", label: "Twitter" },
  { Icon: "◆", href: "https://instagram.com/ksrmceofficial", label: "Instagram" },
  { Icon: "▶", href: "https://youtube.com/ksrmceofficialmedia", label: "YouTube" },
]

interface NavItem {
  label: string
  href: string
  children?: Array<{ label: string; href: string }>
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About KSRMCE", href: "/about#about-ksrmce" },
      { label: "Vision & Mission", href: "/about#vision" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "  ↳ Secretary cum Correspondent", href: "/about/correspondent" },
      { label: "  ↳ Chairman", href: "/about/chairman" },
      { label: "  ↳ Vice Chairman & MD", href: "/about/managing-director" },
      { label: "  ↳ Principal", href: "/about/principal" },
      { label: "Board of Studies", href: "/about#jbos" },
      { label: "Strategic Plan", href: "/about#strategic" },
      { label: "Policy Documents", href: "/about#policies" },
      { label: "Mandatory Disclosure", href: "/mandatory-disclosure" },
    ],
  },
  {
    label: "Departments",
    href: "/departments",
    children: [
      { label: "Civil Engineering", href: "/departments/civil" },
      { label: "Computer Science & Engineering", href: "/departments/cse" },
      { label: "Electrical & Electronics", href: "/departments/eee" },
      { label: "Electronics & Communication", href: "/departments/ece" },
      { label: "Mechanical Engineering", href: "/departments/mechanical" },
      { label: "Humanities & Sciences", href: "/departments/hs" },
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
      { label: "Faculty", href: "/academics/faculty" },
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
  { label: "Research", href: "/research" },
  {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      { label: "Campus Facilities", href: "/campus-life/campus-facilities" },
      { label: "Central Library", href: "/campus-life/library" },
      { label: "Hostels", href: "/campus-life/hostels" },
      { label: "Transport", href: "/campus-life/transport" },
      { label: "Sports", href: "/campus-life/sports" },
      { label: "NSS", href: "/campus-life/nss" },
      { label: "Startup Cell", href: "/campus-life/startup-cell" },
      { label: "Anti-Ragging", href: "/campus-life/anti-ragging" },
      { label: "Grievance Redressal", href: "/campus-life/grievance" },
      { label: "Cultural Club", href: "/campus-life/cultural" },
    ],
  },
  {
    label: "IQAC",
    href: "/iqac",
    children: [
      { label: "NAAC", href: "/naac" },
      { label: "Accreditation", href: "/accreditation" },
    ],
  },
  { label: "IIC", href: "/iic" },
  { label: "EDC", href: "/edc" },
  { label: "Examinations", href: "/examinations" },
  { label: "Alumni", href: "/alumni" },
  { label: "Gallery", href: "/gallery" },
  { label: "Careers", href: "/careers" },
  { label: "Degree Verification", href: "/degree-verification" },
  { label: "News & Events", href: "/news" },
  {
    label: "Contact",
    href: "/contact",
    children: [
      { label: "Contact Us", href: "/contact" },
      { label: "RTI Rules", href: mediaFile(174) },
    ],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const pathname = usePathname()

  // Horizontal-scroll state for the desktop nav row: with 18 top-level
  // items the row is wider than the viewport, so it scrolls sideways and
  // shows yellow arrow affordances at whichever edge still has hidden items.
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

  const scrollByAmount = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
    setHoveredDropdown(null)
  }

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
    const r = triggerEl.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.left, window.innerWidth - 252))
    setDropdownPos({ left, top: r.bottom })
    setHoveredDropdown(label)
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div style={{
      background: "#2B3490",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
    }}>
      <style>{`
        @media (max-width: 768px) {
          .navbar-desktop-wrap { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        .navbar-desktop { scrollbar-width: none; -ms-overflow-style: none; }
        .navbar-desktop::-webkit-scrollbar { display: none; }
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
      `}</style>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "0 20px",
        height: "48px",
      }}>
        {/* Desktop Navigation — horizontally scrollable row with yellow edge arrows */}
        <div className="navbar-desktop-wrap" style={{ position: "relative", flex: 1, minWidth: 0 }}>
          {canLeft && (
            <button className="nav-scroll-arrow left" aria-label="Scroll navigation left" onClick={() => scrollByAmount(-1)}>‹</button>
          )}

          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="navbar-desktop"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
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

              return (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", flex: "0 0 auto" }}
                  onMouseEnter={(e) => (hasChildren ? openDropdown(item.label, e.currentTarget) : (cancelClose(), setHoveredDropdown(null)))}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "0 12px",
                      height: "48px",
                      color: active || isOpen ? "#FFE619" : "rgba(255, 255, 255, 0.82)",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: 600,
                      fontFamily: "'Rajdhani', sans-serif",
                      whiteSpace: "nowrap",
                      borderBottom: active ? "3px solid #FFE619" : "3px solid transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    {item.label}
                    {hasChildren && <span style={{ fontSize: "10px" }}>▾</span>}
                  </Link>
                </div>
              )
            })}
          </div>

          {canRight && (
            <button className="nav-scroll-arrow right" aria-label="Scroll navigation right" onClick={() => scrollByAmount(1)}>›</button>
          )}
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
                minWidth: "240px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                borderRadius: "0 0 8px 8px",
                zIndex: 1100,
                padding: "6px 0",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setHoveredDropdown(null)}
                  style={{
                    display: "block",
                    padding: "10px 18px",
                    color: "#2B3490",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.background = "#f2f4ff" }}
                  onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.background = "transparent" }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )
        })()}

        {/* Mobile Hamburger */}
        <button
          className="navbar-hamburger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px 8px",
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
            const hasChildren = item.children && item.children.length > 0
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
                      padding: "13px 8px",
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
                    <span style={{
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(-180deg)" : "rotate(0deg)",
                      fontSize: "13px",
                    }}>▾</span>
                  </div>
                  {isExpanded && (
                    <div style={{ background: "rgba(255,255,255,0.05)" }}>
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: "block",
                            padding: "10px 8px 10px 32px",
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
                  padding: "13px 8px",
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

          {/* Mobile Social Links */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 8px",
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
