"use client"

import { useEffect, useState } from "react"

type IconProps = { size?: number }

const FB = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
)
const TW = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.626 5.905-5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
)
const IG = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
)
const YT = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2.8 12 2.8 12 2.8s-4.6 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.1 12 22.1 12 22.1s4.6 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.5 8.5v-7.6l6.5 3.8-6.5 3.8z"/></svg>
)

const socials = [
  { Icon: FB, href: "https://facebook.com/ksrmceofficial", label: "Facebook" },
  { Icon: TW, href: "https://twitter.com/ksrmceofficial", label: "Twitter" },
  { Icon: IG, href: "https://instagram.com/ksrmceofficial", label: "Instagram" },
  { Icon: YT, href: "http://youtube.com/ksrmceofficialmedia", label: "YouTube" },
]

// One line, scrolling continuously - the codes + full programme list is too
// much text to fit a thin bar statically without either wrapping to extra
// rows (grows the bar) or shrinking past readable (still looked cramped).
// Same scrolling-strip approach already used for the homepage's placements/
// recruiters strips: a doubled track looping via translateX, so it reads as
// an unbroken loop rather than snapping back to the start.
const codesText = "EAPCET / ECET / ICET / POLYCET Code: KSRM  •  PGECET Code: KSRM1  •  Diploma: CE, EEE, ME, ECE, CSE, AIML  •  B.Tech: CE, EEE, ME, ECE, CSE, CSD, CSM, AIML  •  M.Tech: GTE, SE, PS, ES&VLSI, AIDS  •  MBA"

export default function TopBar() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setLoaded(true) }, [])

  return (
    <div style={{ background: "#202a78", color: "#fff", width: "100%", overflow: "hidden" }}>
      <style>{`
        .topbar-inner { width: 100%; margin: 0 auto; padding: 5px 5%; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .topbar-left { display: flex; gap: 18px; font-size: 13px; align-items: center; font-weight: 500; flex-shrink: 0; }
        .topbar-right { display: flex; gap: 14px; align-items: center; flex-shrink: 0; }
        .topbar-social { color: #fff; display: flex; align-items: center; transition: color 0.2s; }
        .topbar-social:hover { color: #FFE619; }
        .topbar-phone { color: #fff; text-decoration: none; transition: color 0.2s; }
        .topbar-phone:hover { color: #FFE619; }
        .topbar-label {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
          color: #FFE619; opacity: 0.9;
        }
        .topbar-dean { display: inline-flex; align-items: center; gap: 8px; }

        .topbar-codes-viewport { flex: 1; overflow: hidden; min-width: 0; }
        .topbar-codes-track { display: flex; width: max-content; white-space: nowrap; gap: 60px; animation: topbar-scroll 34s linear infinite; }
        .topbar-codes-track span { font-size: 12.5px; font-weight: 600; color: #FFE619; }
        @keyframes topbar-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @media (hover: hover) and (pointer: fine) {
          .topbar-codes-viewport:hover .topbar-codes-track { animation-play-state: paused; }
        }

        @media (max-width: 768px) {
          .topbar-inner { padding: 4px 14px; gap: 8px; }
          .topbar-left { font-size: 11px; gap: 10px; flex-direction: row; align-items: center; }
          .topbar-codes-viewport { display: none; }
          .topbar-dean { display: none; }
          .topbar-right { gap: 12px; }
        }
        @media (max-width: 380px) {
          .topbar-left { font-size: 10px; gap: 6px; }
          .topbar-right { gap: 10px; }
          .topbar-inner { padding: 5px 10px; }
        }
      `}</style>

      <div className="topbar-inner" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(-15px)", transition: "all 0.7s ease" }}>
        {/*
          Real tel: links, not plain text. These were <span>s, so on a phone -
          where most visitors are, and where a college's admissions number
          matters most - the numbers could be read but not dialled.

          Labelled, because two bare numbers side by side said nothing about
          who answers them. The Dean's line is hidden on the narrowest screens
          (see .topbar-dean) rather than wrapping the bar onto two rows.
        */}
        <div className="topbar-left">
          <span className="topbar-label">Admissions</span>
          <a href="tel:+918143731980" className="topbar-phone">📞 +91 8143731980</a>
          <a href="tel:+919948101980" className="topbar-phone">+91 9948101980</a>
          <span className="topbar-dean">
            <span className="topbar-label">Contact</span>
            <a href="tel:+919948201980" className="topbar-phone">
              Dean S. L. Prathap Reddy +91 9948201980
            </a>
          </span>
        </div>
        <div className="topbar-codes-viewport">
          <div className="topbar-codes-track">
            <span>{codesText}</span>
            <span>{codesText}</span>
          </div>
        </div>
        <div className="topbar-right">
          {socials.map(({ Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="topbar-social">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

