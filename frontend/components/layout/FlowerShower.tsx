"use client"

/**
 * A gentle, continuous shower of flower petals confined to one region of the
 * header - the founder's portrait on the far right of the banner image.
 *
 * The header is a single wide image (header.png, 2170x313) with the portrait
 * baked into its right edge, so the effect can't be attached to an element of
 * its own. Instead this overlays the right-hand slice of the header, sized as a
 * percentage so it tracks the image as it scales responsively. WIDTH_PCT is the
 * one number to tune if the portrait's position in the banner ever changes
 * (ksnr.png is 207px of the banner's 2170px width, i.e. ~9.5%).
 *
 * Purely decorative: pointer-events are off so it never intercepts the header
 * link, it is hidden from assistive tech, and it respects reduced-motion.
 */

const WIDTH_PCT = 11

// Staggered so petals don't fall in lockstep. left is a % within the strip.
const PETALS = [
  { left: 8, delay: 0, duration: 5.5, size: 13, drift: 6 },
  { left: 28, delay: 1.4, duration: 6.5, size: 10, drift: -8 },
  { left: 48, delay: 0.7, duration: 5.0, size: 12, drift: 5 },
  { left: 68, delay: 2.2, duration: 7.0, size: 9, drift: -6 },
  { left: 86, delay: 1.0, duration: 6.0, size: 12, drift: 7 },
  { left: 18, delay: 3.1, duration: 6.8, size: 10, drift: -5 },
  { left: 58, delay: 3.8, duration: 5.8, size: 11, drift: 8 },
  { left: 78, delay: 2.7, duration: 6.2, size: 9, drift: -7 },
]

export default function FlowerShower() {
  return (
    <div aria-hidden="true" className="fs-wrap">
      <style>{`
        .fs-wrap {
          position: absolute;
          top: 0;
          right: 0;
          width: ${WIDTH_PCT}%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 3;
        }
        .fs-petal {
          position: absolute;
          top: -14%;
          will-change: transform, opacity;
          animation-name: fs-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes fs-fall {
          0%   { transform: translate(0, -20%) rotate(0deg);   opacity: 0; }
          12%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translate(var(--fs-drift), 900%) rotate(320deg); opacity: 0; }
        }
        /* Decorative only - no motion for visitors who ask for less of it. */
        @media (prefers-reduced-motion: reduce) {
          .fs-petal { animation: none; opacity: 0; }
        }
      `}</style>

      {PETALS.map((p, i) => (
        <span
          key={i}
          className="fs-petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--fs-drift" as string]: `${p.drift}px`,
          }}
        >
          🌸
        </span>
      ))}
    </div>
  )
}
