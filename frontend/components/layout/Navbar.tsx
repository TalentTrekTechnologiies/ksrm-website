"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
      { label: "About KSRMCE", href: "/about" },
      { label: "Correspondent", href: "/about/correspondent" },
      { label: "Managing Director", href: "/about/managing-director" },
      { label: "Chairman", href: "/about/chairman" },
      { label: "Principal", href: "/about/principal" },
      { label: "Joint Board of Studies", href: "/about/joint-board-of-studies" },
      { label: "Strategic Plan", href: "/about/strategic-plan" },
      { label: "Magazines", href: "/about/magazines" },
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
      { label: "Humanities & Sciences", href: "/departments/humanities-sciences" },
      { label: "Management Studies (MBA)", href: "/departments/mba" },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    children: [
      { label: "Courses & Intake", href: "/academics/courses-intake" },
      { label: "Admissions", href: "/academics/admissions" },
      { label: "Fee Structure", href: "/academics/fee-structure" },
      { label: "Academic Calendar", href: "/academics/academic-calendar" },
      { label: "Syllabus", href: "/academics/syllabus" },
      { label: "Regulations", href: "/academics/regulations" },
      { label: "Faculty", href: "/academics/faculty" },
    ],
  },
  {
    label: "NAAC",
    href: "/naac",
    children: [
      { label: "NAAC", href: "/naac" },
      { label: "IQAC", href: "/iqac" },
    ],
  },
  { label: "T&P Cell", href: "/placements" },
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
      { label: "EDC", href: "/campus-life/edc" },
      { label: "Startup Cell", href: "/campus-life/startup-cell" },
      { label: "Anti-Ragging", href: "/campus-life/anti-ragging" },
      { label: "Grievance Redressal", href: "/campus-life/grievance" },
      { label: "Cultural Club", href: "/campus-life/cultural" },
    ],
  },
  { label: "Examinations", href: "/examinations" },
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
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap');

        .navbar-desktop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          width: 100%;
          flex-wrap: nowrap;
        }

        .navbar-hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 26px;
          cursor: pointer;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          line-height: 1;
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

        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0;
          background: #fff;
          min-width: 240px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border-radius: 0 0 8px 8px;
          z-index: 1100;
          padding: 6px 0;
          overflow: visible;
          display: flex;
          flex-direction: column;
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

        .nav-item-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .nav-arrow {
          margin-left: 5px;
          font-size: 10px;
          transition: transform 0.2s;
          display: inline-block;
        }

        .nav-arrow.open {
          transform: rotate(180deg);
        }

        @media (max-width: 768px) {
          .navbar-desktop { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        @media (max-width: 480px) {
          .navbar-mobile-item { padding: 14px 8px; font-size: 15px; }
          .navbar-mobile-parent { padding: 14px 8px; }
        }
      `}</style>

      <div style={{
        width: "100%",
        margin: "0 auto",
        padding: "0 5%",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* Desktop links */}
        <div className="navbar-desktop">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const hasChildren = item.children && item.children.length > 0
            const isOpen = openDropdown === item.label

            if (hasChildren) {
              return (
                <div
                  key={item.label}
                  className="nav-item-wrapper"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    style={{
                      color: active || isOpen ? "#FFE619" : "rgba(255,255,255,0.82)",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "'Rajdhani', sans-serif",
                      padding: "14px 12px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: active ? "3px solid #FFE619" : "3px solid transparent",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                    <span className={`nav-arrow ${isOpen ? "open" : ""}`}>▾</span>
                  </Link>

                  {isOpen && (
                    <div className="nav-dropdown" onMouseEnter={() => setOpenDropdown(item.label)} onMouseLeave={() => setOpenDropdown(null)}>
                      {item.children?.map((child) => (
                        <Link key={child.href} href={child.href}>
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
                  color: active ? "#FFE619" : "rgba(255,255,255,0.82)",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "'Rajdhani', sans-serif",
                  padding: "14px 12px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: active ? "3px solid #FFE619" : "3px solid transparent",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar-hamburger" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="navbar-mobile-menu">
          <div style={{ display: "flex", flexDirection: "column" }}>
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
          </div>
        </div>
      )}
    </div>
  )
}
