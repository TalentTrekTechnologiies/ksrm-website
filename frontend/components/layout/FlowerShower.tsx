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
// Denser and quicker than the first pass, per direction.
const PETALS = [
  { left: 3, delay: 1.2, duration: 2.9, size: 11, drift: 8 },
  { left: 7, delay: 1.3, duration: 2.0, size: 12, drift: 8 },
  { left: 12, delay: 1.7, duration: 1.9, size: 10, drift: -6 },
  { left: 13, delay: 1.8, duration: 2.6, size: 8, drift: 7 },
  { left: 22, delay: 1.4, duration: 2.5, size: 9, drift: -9 },
  { left: 25, delay: 0.1, duration: 1.8, size: 9, drift: -9 },
  { left: 29, delay: 0.7, duration: 2.5, size: 9, drift: 9 },
  { left: 30, delay: 0.6, duration: 1.8, size: 8, drift: 8 },
  { left: 37, delay: 0.9, duration: 2.5, size: 14, drift: -7 },
  { left: 41, delay: 0.7, duration: 2.1, size: 10, drift: -9 },
  { left: 41, delay: 1.7, duration: 2.3, size: 14, drift: 5 },
  { left: 47, delay: 2.1, duration: 2.8, size: 8, drift: -5 },
  { left: 50, delay: 2.0, duration: 2.4, size: 13, drift: 7 },
  { left: 56, delay: 1.2, duration: 2.0, size: 13, drift: 5 },
  { left: 59, delay: 0.7, duration: 1.8, size: 11, drift: -7 },
  { left: 62, delay: 1.6, duration: 1.8, size: 11, drift: 8 },
  { left: 66, delay: 1.2, duration: 2.3, size: 9, drift: -6 },
  { left: 72, delay: 0.8, duration: 2.3, size: 9, drift: -9 },
  { left: 75, delay: 2.1, duration: 2.8, size: 10, drift: -9 },
  { left: 79, delay: 0.9, duration: 2.8, size: 13, drift: -7 },
  { left: 82, delay: 0.3, duration: 2.3, size: 8, drift: 6 },
  { left: 91, delay: 0.8, duration: 1.9, size: 9, drift: -5 },
  { left: 90, delay: 0.8, duration: 2.5, size: 9, drift: 8 },
  { left: 96, delay: 0.3, duration: 2.3, size: 13, drift: -6 },
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
