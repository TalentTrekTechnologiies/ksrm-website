"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type NavChild = { label: string; href: string }
type NavItem = { label: string; href: string; children?: NavChild[] }

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About", href: "/about",
    children: [
      { label: "About KSRMCE", href: "/about" },
      { label: "Correspondent", href: "/about/correspondent" },
      { label: "Managing Director", href: "/about/managing-director" },
      { label: "Chairman", href: "/about/chairman" },
      { label: "Principal", href: "/about/principal" },
      { label: "Joint Board of Studies", href: "/about/joint-board-of-studies" },
      { label: "Strategic Plan", href: "/about/strategic-plan" },
      { label: "Magazines", href: "/about/magazines" },
    ]
  },
  {
    label: "Academics", href: "/academics",
    children: [
      { label: "Courses & Intake", href: "/academics/courses-intake" },
      { label: "Fee Structure", href: "/academics/fee-structure" },
      { label: "Academic Calendar", href: "/academics/academic-calendar" },
      { label: "Syllabus", href: "/academics/syllabus" },
      { label: "Regulations", href: "/academics/regulations" },
      { label: "Faculty", href: "/academics/faculty" },
    ]
  },
  {
    label: "Departments", href: "/departments",
    children: [
      { label: "Civil Engineering", href: "/departments/civil" },
      { label: "Computer Science & Engineering", href: "/departments/cse" },
      { label: "Electrical & Electronics Engineering", href: "/departments/eee" },
      { label: "Electronics & Communication Engineering", href: "/departments/ece" },
      { label: "Mechanical Engineering", href: "/departments/mechanical" },
      { label: "Humanities & Sciences", href: "/departments/hs" },
      { label: "Management Studies", href: "/departments/mba" },
    ]
  },
  { label: "Admissions", href: "/academics/admissions" },
  {
    label: "Placements", href: "/placements",
    children: [
      { label: "About T&P Cell", href: "/placements" },
      { label: "Placement Record", href: "/placements#record" },
      { label: "Placement Training", href: "/placements#training" },
      { label: "Placement Partners", href: "/placements#partners" },
    ]
  },
  { label: "Research", href: "/research" },
  {
    label: "Campus Life", href: "/campus-life",
    children: [
      { label: "Campus Facilities", href: "/campus-life/campus-facilities" },
      { label: "Library", href: "/campus-life/library" },
      { label: "Hostels", href: "/campus-life/hostels" },
      { label: "Transport", href: "/campus-life/transport" },
      { label: "Sports", href: "/campus-life/sports" },
      { label: "NSS", href: "/campus-life/nss" },
      { label: "EDC", href: "/campus-life/edc" },
      { label: "Startup Cell", href: "/campus-life/startup-cell" },
      { label: "Anti-Ragging", href: "/campus-life/anti-ragging" },
      { label: "Grievance Redressal", href: "/campus-life/grievance" },
      { label: "Cultural Club", href: "/campus-life/cultural" },
    ]
  },
  { label: "Library", href: "/campus-life/library" },
  { label: "News & Events", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Accreditation", href: "/accreditation" },
  { label: "IQAC", href: "/iqac" },
  { label: "Alumni", href: "/alumni" },
  { label: "Careers", href: "/careers" },
  { label: "Results", href: "/examinations" },
  { label: "Contact", href: "/contact" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const pathname = usePathname()

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
          overflow-x: auto;
          scrollbar-width: none;
        }
        .navbar-desktop::-webkit-scrollbar { display: none; }

        .nav-item-wrap { position: relative; height: 100%; display: flex; align-items: center; }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          min-width: 240px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          border-top: 3px solid #FFE619;
          border-radius: 0 0 6px 6px;
          z-index: 1001;
          padding: 4px 0;
        }
        .nav-dropdown a {
          display: block;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          color: #2B3490;
          text-decoration: none;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nav-dropdown a:last-child { border-bottom: none; }
        .nav-dropdown a:hover { background: #2B3490; color: #FFE619; padding-left: 24px; }

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
        }

        @media (max-width: 768px) {
          .navbar-desktop   { display: none !important; }
          .navbar-hamburger { display: flex !important; }
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
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <div
                key={item.label}
                className="nav-item-wrap"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  style={{
                    color: active
                      ? "#FFE619"
                      : hoveredItem === item.label
                      ? "#fff"
                      : "rgba(255,255,255,0.82)",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "'Rajdhani', sans-serif",
                    padding: "14px 12px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: active
                      ? "3px solid #FFE619"
                      : "3px solid transparent",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Link>

                {item.children && hoveredItem === item.label && (
                  <div className="nav-dropdown">
                    {item.children.map((child) => (
                      <Link key={child.label} href={child.href}>
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
        <button className="navbar-hamburger" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="navbar-mobile-menu">
          <div style={{ padding: "8px 16px 16px" }}>
            {navItems.map((item) => (
              <div key={item.label}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Link
                    href={item.href}
                    onClick={() => !item.children && setOpen(false)}
                    className="navbar-mobile-item"
                    style={{ color: pathname === item.href ? "#FFE619" : "#fff", flex: 1, borderBottom: "none" }}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      style={{ background: "none", border: "none", color: "#fff", fontSize: "16px", padding: "10px 12px", cursor: "pointer" }}
                    >
                      {mobileExpanded === item.label ? "▲" : "▼"}
                    </button>
                  )}
                </div>
                {item.children && mobileExpanded === item.label && (
                  <div style={{ background: "#1f2670", paddingLeft: "16px" }}>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="navbar-mobile-item"
                        style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}
                      >
                        → {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
