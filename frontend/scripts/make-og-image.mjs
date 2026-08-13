#!/usr/bin/env node
/**
 * Builds public/og-image.jpg (1200x630), the site-wide social share card.
 *
 *     node scripts/make-og-image.mjs
 *
 * Why this exists: app/layout.tsx has always pointed og:image and
 * twitter:image at /og-image.jpg, but no such file was ever committed - so
 * every WhatsApp, LinkedIn, Facebook or X share of any page on the site
 * rendered with a broken preview image. Found in the 2026-08 SEO audit.
 *
 * Built only from assets already in public/ - the campus aerial and the
 * official logo. No stock imagery, no invented claims: the three
 * accreditations printed on the card are the same ones the site states
 * throughout (and that the hero's accreditation label carries).
 *
 * Committed as a generated artefact rather than built at deploy time, so the
 * static export has nothing extra to do and the card is reviewable in git.
 * Re-run this if the logo or the accreditation line changes.
 *
 * NOTE: text is rendered by librsvg via sharp, which uses the FONTS INSTALLED
 * ON THE MACHINE running this script - it does not read the site's webfonts.
 * Rajdhani/DM Sans fall back to a system sans-serif if absent. Eyeball the
 * output before committing.
 */

import sharp from "sharp"
import { writeFileSync } from "node:fs"
import { join } from "node:path"

const PUB = join(process.cwd(), "public")
const W = 1200
const H = 630

const NAVY = "#2B3490"
const YELLOW = "#FFE619"

// Campus aerial, cropped to the OG aspect ratio. `position: "attention"` keeps
// the campus buildings in frame rather than an expanse of sky.
//
// Deliberately NOT campus.webp: despite the filename that file is a portrait of
// the Correspondent, which would be the wrong image on every share of every
// page (and puts an individual's photo where an institutional card belongs).
const bg = await sharp(join(PUB, "topview (1).webp"))
  .resize(W, H, { fit: "cover", position: "attention" })
  .toBuffer()

// Navy scrim so white text stays legible over a busy aerial photo, weighted to
// the left where the text sits and thinning out to keep the campus visible.
const scrim = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${NAVY}" stop-opacity="0.97"/>
      <stop offset="55%"  stop-color="${NAVY}" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="${NAVY}" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`)

const logo = await sharp(join(PUB, "logo.png"))
  .resize(150, 150, { fit: "inside", withoutEnlargement: true })
  .toBuffer()
const logoMeta = await sharp(logo).metadata()

const TEXT_X = 232
const text = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: 'Rajdhani','Segoe UI',Arial,sans-serif; font-weight:700; font-size:62px; fill:#ffffff; }
    .city { font-family: 'DM Sans','Segoe UI',Arial,sans-serif; font-weight:600; font-size:31px; fill:${YELLOW}; letter-spacing:1px; }
    .accr { font-family: 'DM Sans','Segoe UI',Arial,sans-serif; font-weight:500; font-size:22px; fill:rgba(255,255,255,0.88); letter-spacing:2.5px; }
  </style>
  <text class="name" x="${TEXT_X}" y="262">K.S.R.M. College</text>
  <text class="name" x="${TEXT_X}" y="332">of Engineering</text>
  <text class="city" x="${TEXT_X}" y="388">Kadapa, Andhra Pradesh</text>
  <rect x="${TEXT_X}" y="424" width="74" height="4" fill="${YELLOW}"/>
  <text class="accr" x="${TEXT_X}" y="482">NAAC A+  ·  NBA TIER-1  ·  UGC AUTONOMOUS</text>
</svg>`)

const out = await sharp(bg)
  .composite([
    { input: scrim, top: 0, left: 0 },
    // Vertically centred against the two-line institution name.
    { input: logo, top: Math.round(297 - (logoMeta.height ?? 150) / 2), left: 46 },
    { input: text, top: 0, left: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer()

writeFileSync(join(PUB, "og-image.jpg"), out)
console.log(`public/og-image.jpg written - ${(out.length / 1024).toFixed(0)} KB, ${W}x${H}`)
