"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Social media links for mobile menu
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
  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const toggleMobileExpand = (label: string) => {
    setExpandedMobile(expandedMobile === label ? null : label)
  }

  return (
    <div style={{
      background: "#2B3490",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
    }}>
      <style>{`
        .navbar-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
          height: 48px;
          position: relative;
          padding: 0 20px;
          gap: 8px;
          overflow: visible;
        }

        .navbar-desktop {
          display: flex;
          align-items: stretch;
          flex: 1;
          position: relative;
          overflow-x: auto;
          overflow-y: visible;
          gap: 0;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .navbar-desktop::-webkit-scrollbar {
          display: none;
        }

        .nav-item-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          overflow: visible;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0 12px;
          height: 48px;
          color: rgba(255, 255, 255, 0.82);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          cursor: pointer;
        }

        .nav-item:hover {
          color: #FFE619;
        }

        .nav-item.active {
          color: #FFE619;
          border-bottom-color: #FFE619;
        }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          min-width: 240px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border-radius: 0 0 8px 8px;
          z-index: 1100;
          padding: 6px 0;
          display: none;
          flex-direction: column;
        }

        .nav-item-wrapper:hover .nav-dropdown {
          display: flex;
        }

        .nav-dropdown a {
          display: block;
          padding: 10px 18px;
          color: #2B3490;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .nav-dropdown a:hover {
          background: #f2f4ff;
        }

        .nav-arrow {
          margin-left: 5px;
          font-size: 10px;
          display: inline-block;
        }

        .navbar-hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 8px;
        }

        .navbar-mobile-menu {
          border-top: 1px solid rgba(255,255,255,0.1);
          background: #2B3490;
          max-height: 75vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .navbar-mobile-item {
          display: block;
          padding: 13px 8px;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'Rajdhani', sans-serif;
          text-decoration: none;
          color: #fff;
        }

        .navbar-mobile-parent {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 8px;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'Rajdhani', sans-serif;
          color: #fff;
          cursor: pointer;
        }

        .navbar-mobile-parent.expanded {
          background: rgba(255,230,25,0.1);
        }

        .navbar-mobile-arrow {
          transition: transform 0.2s;
          font-size: 12px;
        }

        .navbar-mobile-arrow.open {
          transform: rotate(-180deg);
        }

        .navbar-mobile-children {
          display: none;
          flex-direction: column;
          background: rgba(255,255,255,0.05);
        }

        .navbar-mobile-children.visible {
          display: flex;
        }

        .navbar-mobile-child {
          padding: 10px 8px 10px 32px;
          font-size: 13px;
          font-weight: 500;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-family: 'Rajdhani', sans-serif;
          text-decoration: none;
          color: rgba(255,255,255,0.8);
        }

        .navbar-mobile-child:hover {
          color: #FFE619;
        }

        @media (max-width: 768px) {
          .navbar-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
      `}</style>

      <div className="navbar-wrapper">
        {/* Desktop navigation */}
        <div className="navbar-desktop">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.label} className="nav-item-wrapper">
                <Link
                  href={item.href}
                  className={`nav-item ${active ? "active" : ""}`}
                >
                  {item.label}
                  {hasChildren && <span className="nav-arrow">▾</span>}
                </Link>

                {hasChildren && (
                  <div className="nav-dropdown">
                    {item.children?.map((child) => (
                      <Link key={child.href} href={child.href}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="navbar-mobile-menu">
          {navItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMobile === item.label
            const active = isActive(item.href)

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <div
                    className={`navbar-mobile-parent ${isExpanded ? "expanded" : ""}`}
                    onClick={() => toggleMobileExpand(item.label)}
                    style={{ color: active ? "#FFE619" : "#fff" }}
                  >
                    <span>{item.label}</span>
                    <span className={`navbar-mobile-arrow ${isExpanded ? "open" : ""}`}>▾</span>
                  </div>
                  {isExpanded && (
                    <div className="navbar-mobile-children visible">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="navbar-mobile-child"
                          onClick={() => setOpen(false)}
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
                className="navbar-mobile-item"
                onClick={() => setOpen(false)}
                style={{ color: active ? "#FFE619" : "#fff" }}
              >
                {item.label}
              </Link>
            )
          })}

          {/* Mobile social links */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px 8px", display: "flex", gap: "12px" }}>
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
