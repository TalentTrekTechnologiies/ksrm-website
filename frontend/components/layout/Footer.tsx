"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react"

type SvgIconProps = { size?: number; color?: string }

const IconFacebook = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const IconTwitterX = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.626 5.905-5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const IconInstagram = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
  </svg>
)

const IconYoutube = ({ size = 18, color = "currentColor" }: SvgIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2.8 12 2.8 12 2.8s-4.6 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.1 12 22.1 12 22.1s4.6 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.5 8.5v-7.6l6.5 3.8-6.5 3.8z" />
  </svg>
)

const EASE = [0.22, 1, 0.36, 1] as const

const currentYear = new Date().getFullYear()

const quickLinks = [
  { label: "About",       href: "/about"       },
  { label: "Academics",   href: "/academics"   },
  { label: "Admissions",  href: "/admissions"  },
  { label: "Placements",  href: "/placements"  },
  { label: "Research",    href: "/research"    },
  { label: "Campus Life", href: "/campus-life" },
]

const deptLinks = [
  { label: "CSE",        href: "/departments/cse"   },
  { label: "ECE",        href: "/departments/ece"   },
  { label: "EEE",        href: "/departments/eee"   },
  { label: "Mechanical", href: "/departments/mech"  },
  { label: "Civil",      href: "/departments/civil" },
  { label: "MBA",        href: "/departments/mba"   },
]

const ugPrograms = [
  { label: "B.Tech CSE",         href: "/departments/cse"   },
  { label: "B.Tech ECE",         href: "/departments/ece"   },
  { label: "B.Tech EEE",         href: "/departments/eee"   },
  { label: "B.Tech Mechanical",  href: "/departments/mech"  },
  { label: "B.Tech Civil",       href: "/departments/civil" },
]

const pgPrograms = [
  { label: "M.Tech VLSI",        href: "/academics"         },
  { label: "M.Tech Power Systems", href: "/academics"       },
  { label: "M.Tech Structural",  href: "/academics"         },
  { label: "M.Tech Thermal",     href: "/academics"         },
]

const diplomaPrograms = [
  { label: "Diploma Civil",      href: "/academics/admissions" },
  { label: "Diploma Mechanical", href: "/academics/admissions" },
  { label: "Diploma ECE",        href: "/academics/admissions" },
  { label: "Diploma CSE",        href: "/academics/admissions" },
]

const socials = [
  { Icon: IconFacebook,  href: "https://facebook.com/ksrmceofficial"     },
  { Icon: IconTwitterX,  href: "https://twitter.com/ksrmceofficial"      },
  { Icon: IconInstagram, href: "https://instagram.com/ksrmceofficial"    },
  { Icon: IconYoutube,   href: "http://youtube.com/ksrmceofficialmedia"  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const colVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
        {children}
      </div>
      <div style={{ width: "24px", height: "2px", background: "#FFE619" }} />
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "6px 0",
        color: hovered ? "#FFE619" : "rgba(255,255,255,0.7)",
        fontSize: "13.5px",
        textDecoration: "none",
        transition: "color 0.2s ease",
      }}
    >
      {hovered && <ArrowRight size={13} strokeWidth={2.5} />}
      {label}
    </Link>
  )
}

function SocialBtn({ Icon, href }: { Icon: (props: SvgIconProps) => React.ReactElement; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: hovered ? "#FFE619" : "rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={hovered ? "#1e2570" : "#ffffff"} {...({ strokeWidth: 1.8 } as any)} />
    </a>
  )
}

export default function Footer() {
  return (
    <footer style={{ width: "100%", background: "#1e2570", color: "#ffffff", paddingTop: "56px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1.2fr;
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .footer-bottom-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; padding: 0 24px; }
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 0 20px; }
        }
        @media (max-width: 640px) {
          .footer-grid         { grid-template-columns: 1fr; padding: 0 16px; }
          .footer-bottom-inner { flex-direction: column; align-items: flex-start; gap: 10px; padding: 0 16px; }
          .footer-bottom-inner > div:last-child { text-align: left; }
        }
        @media (max-width: 380px) {
          .footer-grid { padding: 0 12px; gap: 20px; }
        }
      `}</style>

      {/* MAIN GRID */}
      <motion.div
        className="footer-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >

        {/* COL 1 — College Info */}
        <motion.div variants={colVariants}>
          {/* LOGO + NAME */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              background: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <img src="/logo.png" alt="KSRM Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "24px", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>
                KSRM
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
                College of Engineering
              </div>
            </div>
          </div>

          {/* TAGLINE */}
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 10px" }}>
            45 years of engineering excellence in Kadapa, Andhra Pradesh.
          </p>

          {/* SOCIAL ICONS */}
          <div style={{ display: "flex", gap: "10px" }}>
            {socials.map(({ Icon, href }) => (
              <SocialBtn key={href} Icon={Icon} href={href} />
            ))}
          </div>

          {/* QUICK CONTACT */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: "2px" }}>
                Admissions Helpline
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                +91 8143731960
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: "2px" }}>
                Email
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                admissions@ksrmce.ac.in
              </div>
            </div>
          </div>
        </motion.div>

        {/* COL 2 — UG Programs */}
        <motion.div variants={colVariants}>
          <ColHeading><strong>UG Programs</strong></ColHeading>
          {ugPrograms.map((l) => (
            <Link key={l.href} href={l.href} style={{ display: "block", padding: "6px 0", color: "rgba(255,255,255,0.7)", fontSize: "13.5px", textDecoration: "none", fontWeight: 600, transition: "color 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FFE619"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>{l.label}</Link>
          ))}
        </motion.div>

        {/* COL 3 — PG Programs */}
        <motion.div variants={colVariants}>
          <ColHeading><strong>PG Programs</strong></ColHeading>
          {pgPrograms.map((l) => (
            <Link key={l.href} href={l.href} style={{ display: "block", padding: "6px 0", color: "rgba(255,255,255,0.7)", fontSize: "13.5px", textDecoration: "none", fontWeight: 600, transition: "color 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FFE619"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>{l.label}</Link>
          ))}
        </motion.div>

        {/* COL 4 — Diploma Programs */}
        <motion.div variants={colVariants}>
          <ColHeading><strong>Diploma Programs</strong></ColHeading>
          {diplomaPrograms.map((l) => (
            <Link key={l.href} href={l.href} style={{ display: "block", padding: "6px 0", color: "rgba(255,255,255,0.7)", fontSize: "13.5px", textDecoration: "none", fontWeight: 600, transition: "color 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#FFE619"} onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>{l.label}</Link>
          ))}
        </motion.div>

        {/* COL 5 — Quick Links */}
        <motion.div variants={colVariants}>
          <ColHeading>Quick Links</ColHeading>
          {quickLinks.map((l) => <NavLink key={l.href} href={l.href} label={l.label} />)}
        </motion.div>

        {/* COL 6 — Contact + Map */}
        <motion.div variants={colVariants}>
          <ColHeading>Reach Us</ColHeading>

          {/* ADDRESS */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
            <MapPin size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
              KSRM College of Engineering,<br />Kadapa, Andhra Pradesh – 516003
            </span>
          </div>

          {/* PHONE */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
            <Phone size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
              +91 8143731960<br />08562 295972
            </span>
          </div>

          {/* EMAIL */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Mail size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <a href="mailto:principal@ksrmce.ac.in" style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
              principal@ksrmce.ac.in
            </a>
          </div>

          {/* GOOGLE MAP */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.125530584371!2d78.76410318567737!3d14.477480402447771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb373e15c65e6b7%3A0x2b13242197e9d9fa!2zS1NSTSDgsJXgsL7gsLLgsYfgsJzgsY0!5e0!3m2!1ste!2sin!4v1479195998208"
            width="100%"
            height="140"
            style={{ border: "none", borderRadius: "8px", marginTop: "14px", display: "block", opacity: 0.85 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </motion.div>

      {/* BOTTOM BAR */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "40px", padding: "18px 0" }}>
        <div className="footer-bottom-inner">

          {/* LEFT: College identity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              © {currentYear} KSRM College of Engineering. All Rights Reserved.
            </span>
            <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>
              SRI KANDULA OBUL REDDY CHARITIES
            </span>
          </div>

          {/* RIGHT: Powered by */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", textAlign: "right", marginLeft: "auto" }}>
            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              Powered by Talent Trek Technologies
            </span>
          </div>

        </div>
      </div>
    </footer>
  )
}
