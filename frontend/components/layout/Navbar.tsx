"use client"

import { useState } from "react"
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
      { label: "Joint Board of Studies", href: "/about#jbos" },
      { label: "Strategic Plan", href: "/about#strategic" },
      { label: "Policy Documents", href: "/about#policies" },
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
      { label: "RTI Rules", href: "https://ksrmce.ac.in/NAAC/rtidoc.pdf" },
    ],
  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const pathname = usePathname()

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
          .navbar-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
      `}</style>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "0 20px",
        height: "48px",
      }}>
        {/* Desktop Navigation */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          flex: 1,
          overflow: "visible",
        }} className="navbar-desktop">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const hasChildren = item.children && item.children.length > 0
            const isOpen = hoveredDropdown === item.label

            return (
              <div
                key={item.label}
                style={{ position: "relative", display: "flex", alignItems: "center" }}
                onMouseEnter={() => setHoveredDropdown(item.label)}
                onMouseLeave={() => setHoveredDropdown(null)}
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
                    fontSize: "14px",
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

                {hasChildren && isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      background: "#fff",
                      minWidth: "240px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      borderRadius: "0 0 8px 8px",
                      zIndex: 1100,
                      padding: "6px 0",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={() => setHoveredDropdown(item.label)}
                    onMouseLeave={() => setHoveredDropdown(null)}
                  >
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        style={{
                          display: "block",
                          padding: "10px 18px",
                          color: "#2B3490",
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: "14px",
                          fontWeight: 600,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLAnchorElement).style.background = "#f2f4ff"
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLAnchorElement).style.background = "transparent"
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

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
                      fontSize: "14px",
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
                      fontSize: "12px",
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
                            fontSize: "13px",
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
                  fontSize: "14px",
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
                style={{ color: "#fff", fontSize: "16px", textDecoration: "none" }}
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
