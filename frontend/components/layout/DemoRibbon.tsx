"use client"

import { IS_DEMO, DEMO_BRAND } from "@/lib/demo-mode"

/**
 * A standing mark that this is a specimen, not a live college site.
 *
 * It exists for the screenshot as much as for the visitor: sales decks and
 * case studies get cropped, forwarded and re-hosted, and a frame of a
 * convincing college website with an agency's logo on it should never be able
 * to circulate without saying plainly what it is. Fixed to the viewport so it
 * survives any crop that keeps a corner.
 *
 * Renders nothing at all in the production build.
 */
export default function DemoRibbon() {
  if (!IS_DEMO) return null

  return (
    <>
      <style>{`
        .tt-demo-ribbon {
          position: fixed;
          left: 0;
          bottom: 0;
          z-index: 2147483000;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-top-right-radius: 10px;
          background: #1f3a86;
          color: #fff;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          font-size: 12px;
          line-height: 1.3;
          letter-spacing: 0.2px;
          box-shadow: 0 -2px 14px rgba(0,0,0,0.22);
          text-decoration: none;
          /* Never swallows a click meant for the page underneath - the demo is
             there to be clicked around, and a fixed bar in the corner is
             exactly where a "back to top" button tends to sit. */
          pointer-events: auto;
        }
        .tt-demo-ribbon b { background: #e2650f; padding: 2px 7px; border-radius: 5px; font-size: 11px; letter-spacing: 1px; }
        .tt-demo-ribbon span { opacity: 0.9; }
        @media (max-width: 640px) {
          .tt-demo-ribbon { font-size: 11px; padding: 6px 10px; gap: 7px; }
          .tt-demo-ribbon span.tt-demo-long { display: none; }
        }
        @media print { .tt-demo-ribbon { position: static; } }
      `}</style>
      <a
        className="tt-demo-ribbon"
        href="https://talenttrektechnologies.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <b>{DEMO_BRAND.ribbon}</b>
        <span>
          Sample site by {DEMO_BRAND.company}
          <span className="tt-demo-long"> — sample content, not a live institution</span>
        </span>
      </a>
    </>
  )
}
