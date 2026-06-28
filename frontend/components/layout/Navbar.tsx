"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
      { label: "Humanities & Sciences", href: "/departments/humanities-sciences" },
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
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const itemRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())
  const pathname = usePathname()
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
  }

  const scroll = (direction: "left" | "right") => {
    setOpenDropdown(null)
    setDropdownPos(null)
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    })
  }

  const handleItemHover = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    const itemEl = itemRefsMap.current.get(label)
    if (itemEl) {
      const rect = itemEl.getBoundingClientRect()
      setDropdownPos({
        left: rect.left,
        top: rect.bottom,
      })
    }
    setOpenDropdown(label)
  }

  const handleItemLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
      setDropdownPos(null)
    }, 150)
  }

  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
  }

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
      setDropdownPos(null)
    }, 150)
  }

  const handleDropdownClick = () => {
    setOpenDropdown(null)
    setDropdownPos(null)
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    let lastScrollLeft = container?.scrollLeft ?? 0

    const closeDropdownOnScroll = () => {
      if (openDropdown) {
        console.log("🔍 SCROLL EVENT - closing dropdown:", openDropdown)
        setOpenDropdown(null)
        setDropdownPos(null)
      }
    }

    // Listener for container's scroll event
    const handleContainerScroll = () => {
      console.log("🔍 CONTAINER SCROLL EVENT", { scrollLeft: container?.scrollLeft })
      closeDropdownOnScroll()
    }

    // Use requestAnimationFrame to detect scroll even if events don't fire reliably
    let rafId: number
    const detectScroll = () => {
      if (container && container.scrollLeft !== lastScrollLeft) {
        console.log("🔍 SCROLL DETECTED via RAF", { from: lastScrollLeft, to: container.scrollLeft })
        lastScrollLeft = container.scrollLeft
        closeDropdownOnScroll()
      }
      if (openDropdown) {
        rafId = requestAnimationFrame(detectScroll)
      }
    }

    if (container) {
      console.log("✅ Setup scroll detection for container")
      container.addEventListener("scroll", handleContainerScroll)
      window.addEventListener("scroll", closeDropdownOnScroll, true)
      window.addEventListener("resize", checkScroll)

      // Start RAF-based detection when dropdown is open
      if (openDropdown) {
        rafId = requestAnimationFrame(detectScroll)
      }

      return () => {
        container.removeEventListener("scroll", handleContainerScroll)
        window.removeEventListener("scroll", closeDropdownOnScroll, true)
        window.removeEventListener("resize", checkScroll)
        if (rafId) cancelAnimationFrame(rafId)
      }
    }
  }, [openDropdown])

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
        }

        .navbar-desktop {
          display: flex;
          align-items: stretch;
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .navbar-scroll-container {
          display: flex;
          align-items: center;
          flex: 1;
          overflow-x: auto;
          scroll-behavior: smooth;
          gap: 0;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .navbar-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .navbar-scroll-fade-left {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(to right, #2B3490, rgba(43, 52, 144, 0));
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .navbar-scroll-fade-left.visible {
          opacity: 1;
        }

        .navbar-scroll-fade-right {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(to left, #2B3490, rgba(43, 52, 144, 0));
          pointer-events: none;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .navbar-scroll-fade-right.visible {
          opacity: 1;
        }

        .navbar-scroll-btn {
          position: relative;
          background: none;
          border: none;
          color: #D4A500;
          width: auto;
          height: 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 20;
          opacity: 0;
          pointer-events: none;
          flex-shrink: 0;
          padding: 0 8px;
        }

        .navbar-scroll-btn.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .navbar-scroll-btn:hover {
          transform: scale(1.2);
        }

        .navbar-hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 26px;
          cursor: pointer;
          flex-shrink: 0;
          padding: 4px 8px;
          line-height: 1;
          margin-left: auto;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .navbar-hamburger:focus-visible {
          outline: 2px solid rgba(255, 230, 25, 0.5);
          outline-offset: 2px;
          border-radius: 4px;
        }

        .navbar-hamburger:focus:not(:focus-visible) {
          outline: none;
        }

        .navbar-close-button {
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .navbar-close-button:focus-visible {
          outline: 2px solid rgba(255, 230, 25, 0.5);
          outline-offset: 2px;
          border-radius: 4px;
        }

        .navbar-close-button:focus:not(:focus-visible) {
          outline: none;
        }

        .navbar-mobile-menu {
          border-top: 1px solid rgba(255,255,255,0.12);
          background: #2B3490;
          max-height: calc(100vh - 140px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          animation: slideInMenu 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideInMenu {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-mobile-item {
          display: block;
          padding: 16px 18px;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: 'Rajdhani', sans-serif;
          text-decoration: none;
          color: rgba(255,255,255,0.9);
          height: 56px;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .navbar-mobile-item:active {
          background: rgba(255,230,25,0.08);
          color: #D4A500;
        }

        .navbar-mobile-parent {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: 'Rajdhani', sans-serif;
          color: rgba(255,255,255,0.9);
          cursor: pointer;
          height: 56px;
          transition: all 0.2s ease;
        }

        .navbar-mobile-parent:active {
          background: rgba(255,230,25,0.08);
        }

        .navbar-mobile-parent.expanded {
          background: rgba(255,230,25,0.12);
          color: #D4A500;
        }

        .navbar-mobile-arrow {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 13px;
          color: rgba(255,255,255,0.6);
        }

        .navbar-mobile-arrow.open {
          transform: rotate(-180deg);
        }

        .navbar-mobile-children {
          display: none;
          flex-direction: column;
          background: rgba(255,255,255,0.04);
          animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .navbar-mobile-children.visible {
          display: flex;
        }

        .navbar-mobile-child {
          padding: 14px 18px 14px 48px;
          font-size: 15px;
          font-weight: 500;
          border-bottom: none;
          border-left: 2px solid rgba(255,230,25,0.3);
          font-family: 'Rajdhani', sans-serif;
          text-decoration: none;
          color: rgba(255,255,255,0.75);
          height: 50px;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .navbar-mobile-child:active {
          background: rgba(255,230,25,0.08);
          color: #D4A500;
          border-left-color: #D4A500;
        }

        .nav-dropdown {
          position: fixed;
          background: #fff;
          min-width: 240px;
          max-width: 90vw;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border-radius: 0 0 8px 8px;
          z-index: 9999;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          margin-top: -1px;
        }

        .nav-dropdown a {
          display: block;
          padding: 12px 18px;
          color: #2B3490;
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px;
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

        .nav-item-link {
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          padding: 14px 12px;
          height: 48px;
          display: flex;
          align-items: center;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-item-link.active {
          color: #D4A500;
          border-bottom-color: #D4A500;
        }

        .nav-item-link:hover {
          color: #D4A500;
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
          .navbar-wrapper {
            padding: 0 12px;
          }
        }
      `}</style>

      <div className="navbar-wrapper">
        {/* Desktop navigation */}
        <div className="navbar-desktop">
          <div className={`navbar-scroll-fade-left ${canScrollLeft ? "visible" : ""}`} />
          <div className={`navbar-scroll-fade-right ${canScrollRight ? "visible" : ""}`} />

          <button
            className={`navbar-scroll-btn ${canScrollLeft ? "visible" : ""}`}
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            type="button"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>

          <div className="navbar-scroll-container" ref={scrollContainerRef}>
            {navItems.map((item) => {
              const active = isActive(item.href)
              const hasChildren = item.children && item.children.length > 0
              const isOpen = openDropdown === item.label

              if (hasChildren) {
                return (
                  <div
                    key={item.label}
                    className="nav-item-wrapper"
                    ref={(el: HTMLDivElement | null) => {
                      if (el) itemRefsMap.current.set(item.label, el)
                    }}
                    onMouseEnter={() => handleItemHover(item.label)}
                    onMouseLeave={handleItemLeave}
                  >
                    <Link
                      href={item.href}
                      className={`nav-item-link ${active || isOpen ? "active" : ""}`}
                    >
                      {item.label}
                      <span className={`nav-arrow ${isOpen ? "open" : ""}`}>▾</span>
                    </Link>
                  </div>
                )
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-item-link ${active ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <button
            className={`navbar-scroll-btn ${canScrollRight ? "visible" : ""}`}
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            type="button"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setOpen(!open)}
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Fixed-position dropdown (portal-like for desktop) */}
      {openDropdown && dropdownPos && (
        <div
          ref={dropdownRef}
          className="nav-dropdown"
          style={{
            left: `${dropdownPos.left}px`,
            top: `${dropdownPos.top}px`,
          }}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          {navItems
            .find((item) => item.label === openDropdown)
            ?.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={handleDropdownClick}
              >
                {child.label}
              </Link>
            ))}
        </div>
      )}

      {/* Mobile menu - CLEAN ACCORDION DRAWER */}
      {open && (
        <div className="navbar-mobile-menu" id="mobile-menu">
          {/* HEADER: College Logo & Title */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.15)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flex: 1,
            }}>
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <img src="/logo.png" alt="KSRM Logo" style={{
                  width: "46px",
                  height: "46px",
                  objectFit: "contain",
                }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: "'Rajdhani', sans-serif",
                  lineHeight: 1.1,
                }}>
                  KSRM
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  College of Engineering
                </div>
              </div>
            </div>
            <button
              className="navbar-close-button"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px 4px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* ACCREDITATION LOGOS ROW */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            padding: "18px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.08)",
            minHeight: "72px",
          }}>
            {[
              { src: "/nba.png", alt: "NBA" },
              { src: "/naac.png", alt: "NAAC" },
              { src: "/jntua.png", alt: "JNTUA" },
              { src: "/ksnr.png", alt: "KSNR" },
            ].map((logo) => (
              <a
                key={logo.alt}
                href="/accreditation"
                onClick={() => setOpen(false)}
                title={logo.alt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                  background: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"
                }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  width={48}
                  height={48}
                  style={{
                    height: "32px",
                    width: "auto",
                    maxWidth: "48px",
                    objectFit: "contain",
                  }}
                />
              </a>
            ))}
          </div>

          {/* NAV ITEMS - ACCORDIONS */}
          <div style={{ overflowY: "auto", maxHeight: "calc(75vh - 180px)" }}>
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedMobile === item.label
              const active = isActive(item.href)

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    {/* ACCORDION PARENT */}
                    <button
                      onClick={() => toggleMobileExpand(item.label)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 18px",
                        height: "60px",
                        background: isExpanded ? "rgba(255,230,25,0.12)" : "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        color: active ? "#D4A500" : "rgba(255,255,255,0.9)",
                        fontSize: "16px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{
                        fontSize: "12px",
                        transition: "transform 0.2s",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}>▾</span>
                    </button>

                    {/* ACCORDION CHILDREN - HIDDEN UNTIL EXPANDED */}
                    {isExpanded && (
                      <div style={{
                        background: "rgba(0,0,0,0.12)",
                        display: "flex",
                        flexDirection: "column",
                        animation: "slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}>
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "0 18px 0 48px",
                              height: "54px",
                              fontSize: "15px",
                              color: "rgba(255,255,255,0.8)",
                              textDecoration: "none",
                              borderBottom: "none",
                              borderLeft: "2px solid rgba(255,230,25,0.2)",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,230,25,0.05)"
                              ;(e.currentTarget as HTMLAnchorElement).style.color = "#D4A500"
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "transparent"
                              ;(e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.9)"
                            }}
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
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 18px",
                    height: "60px",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: active ? "#D4A500" : "rgba(255,255,255,0.9)",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,230,25,0.1)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent"
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* CONTACT & SOCIAL FOOTER */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.2)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            {/* PHONE NUMBERS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="tel:+919000073434" style={{ color: "#D4A500", fontSize: "13px", textDecoration: "none" }}>
                📞 +91 9000073434
              </a>
              <a href="tel:08562295972" style={{ color: "#D4A500", fontSize: "13px", textDecoration: "none" }}>
                📞 08562 295972
              </a>
            </div>

            {/* SOCIAL ICONS */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}>
              {socialLinks.map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    color: "#D4A500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255,230,25,0.1)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,230,25,0.2)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,230,25,0.1)"
                  }}
                >
                  {label === "Facebook" && "f"}
                  {label === "Twitter" && "𝕏"}
                  {label === "Instagram" && "◆"}
                  {label === "YouTube" && "▶"}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
