#!/usr/bin/env node
/**
 * Recompresses oversized images in public/ IN PLACE.
 *
 *     node scripts/compress-public-images.mjs --dry    # report only
 *     node scripts/compress-public-images.mjs          # actually rewrite
 *
 * Found in the 2026-08 SEO audit: public/ shipped 49 images over 400 KB,
 * including two 18 MB gallery originals and six exam-staff portraits between
 * 3.7 MB and 7.7 MB. next.config.ts sets `images.unoptimized: true` (required
 * by `output: "export"` without a loader), so Next does no resizing at all -
 * whatever is in public/ is exactly what the browser downloads. That is a
 * direct LCP problem on the pages that use them and a large deploy.
 *
 * SAFETY: this only ever rewrites a file at its existing path in its existing
 * format, so no <img src> or CMS-stored URL can break. It never deletes, never
 * renames, and never converts formats. A file is left untouched if
 * recompression does not actually make it smaller.
 *
 * Files are capped at MAX_EDGE on the long side. 2400px is far beyond any
 * display size on this site (the widest container is 1760px) while leaving
 * headroom for high-DPI screens.
 */

import sharp from "sharp"
import { readdirSync, statSync, writeFileSync, readFileSync } from "node:fs"
import { join, extname } from "node:path"

const PUBLIC = join(process.cwd(), "public")
const DRY = process.argv.includes("--dry")

/** Only bother with files above this size. */
const MIN_BYTES = 300 * 1024
/** Longest edge, in pixels, after resize. */
const MAX_EDGE = 2400

const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (EXTS.has(extname(name).toLowerCase()) && st.size >= MIN_BYTES) out.push({ path: full, size: st.size })
  }
  return out
}

const files = walk(PUBLIC).sort((a, b) => b.size - a.size)

let before = 0
let after = 0
let rewritten = 0
const rows = []

for (const file of files) {
  before += file.size
  try {
    // Read into memory first rather than letting sharp open the path itself.
    // On Windows, sharp keeps a handle on the source file, and writing the
    // result back to that same path then fails with EPERM/EBUSY - silently, in
    // the catch below. That is exactly what happened on the first run here:
    // logo.png (small, fully buffered) was rewritten while the 18 MB gallery
    // originals and the 7.7 MB staff portraits were skipped, turning an
    // expected 88 MB saving into 7.7 MB.
    const input = readFileSync(file.path)
    const image = sharp(input, { failOn: "none" })
    const meta = await image.metadata()
    const format = meta.format

    const needsResize = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE
    let pipeline = image
    if (needsResize) {
      pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    }

    if (format === "jpeg") {
      pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true })
    } else if (format === "png") {
      // Keeps the alpha channel; compressionLevel 9 + effort 10 is slow but
      // this runs once, by hand, not in the build.
      pipeline = pipeline.png({ compressionLevel: 9, effort: 10, palette: true })
    } else if (format === "webp") {
      pipeline = pipeline.webp({ quality: 82, effort: 6 })
    } else {
      after += file.size
      continue
    }

    const buf = await pipeline.toBuffer()

    // Never write a file that got bigger - some already-optimised assets will.
    if (buf.length >= file.size) {
      after += file.size
      continue
    }

    if (!DRY) writeFileSync(file.path, buf)
    after += buf.length
    rewritten++
    rows.push({
      path: file.path.replace(PUBLIC, "public"),
      from: file.size,
      to: buf.length,
      dims: needsResize ? `${meta.width}x${meta.height} -> max ${MAX_EDGE}` : `${meta.width}x${meta.height}`,
    })
  } catch (err) {
    console.warn(`SKIP ${file.path}: ${err.message}`)
    after += file.size
  }
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`

rows.sort((a, b) => b.from - b.to - (a.from - a.to))
console.log(`\n${DRY ? "[DRY RUN] " : ""}Recompressed ${rewritten} of ${files.length} candidate images\n`)
for (const r of rows.slice(0, 25)) {
  console.log(`  ${kb(r.from).padStart(9)} -> ${kb(r.to).padStart(8)}   ${r.dims.padEnd(24)} ${r.path}`)
}
if (rows.length > 25) console.log(`  ... and ${rows.length - 25} more`)

console.log(`\n  total: ${mb(before)} -> ${mb(after)}   (saved ${mb(before - after)}, ${(((before - after) / before) * 100).toFixed(1)}%)\n`)
