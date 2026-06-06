"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Home",          href: "/"              },
  { label: "About",         href: "/about"         },
  { label: "Academics",     href: "/academics"     },
  { label: "Departments",   href: "/departments"   },
  { label: "Admissions",    href: "/admissions"    },
  { label: "Placements",    href: "/placements"    },
  { label: "Research",      href: "/research"      },
  { label: "Campus Life",   href: "/campus-life"   },
  { label: "Library",       href: "/library"       },
  { label: "News & Events", href: "/news"          },
  { label: "Gallery",       href: "/gallery"       },
  { label: "Accreditation", href: "/accreditation" },
  { label: "IQAC",          href: "/iqac"          },
  { label: "Alumni",        href: "/alumni"        },
  { label: "Careers",       href: "/careers"       },
  { label: "Results",       href: "/results"       },
  { label: "Contact",       href: "/contact"       },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
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
        @media (max-width: 480px) {
          .navbar-mobile-item { padding: 14px 8px; font-size: 15px; }
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
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
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
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>

      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="navbar-mobile-menu">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 16px 16px" }}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="navbar-mobile-item"
                style={{ color: pathname === item.href ? "#FFE619" : "#fff" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
