/**
 * Records the API the public site actually asks for, scrubs every real
 * identity out of it, and writes it as a static snapshot the specimen build
 * serves instead of a backend.
 *
 * Why record rather than write fixtures by hand: the pages ask for ~25
 * endpoints with a long tail of query strings ("/downloads?pageSection=
 * iqac.minutes"), and reimplementing the backend's filtering in fixtures would
 * drift from how the real site behaves. Crawling the built site and keeping
 * whatever it asked for cannot drift - the recording IS the behaviour.
 *
 * Why scrub rather than anonymise-on-read: the snapshot is a public static
 * file. Anything left in it is published. So the scrub happens once, here,
 * before it is ever written to disk.
 *
 *   node scripts/demo/record-api.mjs
 *
 * Expects a build in out/ and writes public/demo/api-snapshot.json.
 */
import { chromium } from "playwright";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const TARGET = path.join(process.cwd(), "public", "demo", "api-snapshot.json");
// The unscrubbed recording, kept out of the build. Scrubbing is the part that
// gets iterated on - an audit finds a leak, a rule changes, it runs again -
// and re-crawling 77 routes to retry a regex is seven minutes each time.
const RAW = path.join(process.cwd(), "..", "scratchpad", "demo-raw.json");
const UPSTREAM = process.env.DEMO_SOURCE ?? "https://ksrmce.ac.in";
const PORT = 4188;

/* ------------------------------------------------------------------ */
/* Identity scrubbing                                                  */
/* ------------------------------------------------------------------ */

import { DEMO_NAME, DEMO_SHORT, scrubValue, scrubRecord, isDroppable } from "./scrub.mjs";

/* ------------------------------------------------------------------ */
/* A static server for out/, proxying /api to the real site            */
/* ------------------------------------------------------------------ */

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".woff2": "font/woff2", ".ico": "image/x-icon", ".xml": "application/xml",
  ".mp4": "video/mp4", ".avif": "image/avif", ".webm": "video/webm",
};

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      if (url.startsWith("/api/")) {
        https
          .get(UPSTREAM + url + query, (up) => {
            const chunks = [];
            up.on("data", (c) => chunks.push(c));
            up.on("end", () => {
              res.writeHead(up.statusCode, {
                "Content-Type": up.headers["content-type"] ?? "application/json",
              });
              res.end(Buffer.concat(chunks));
            });
          })
          .on("error", () => { res.writeHead(502); res.end("[]"); });
        return;
      }
      let file = path.join(OUT, url);
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      const ok = fs.existsSync(file);
      if (!ok) file = path.join(OUT, "404.html");
      res.writeHead(ok ? 200 : 404, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
  });
}

/** Every public route the build produced, admin screens excluded. */
function routes() {
  const found = [];
  (function walk(dir, route) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        if (entry === "admin" || entry === "_next" || entry.startsWith("__")) continue;
        walk(full, `${route}/${entry}`);
      } else if (entry === "index.html") {
        found.push(route === "" ? "/" : `${route}/`);
      }
    }
  })(OUT, "");
  return found.sort();
}

/* ------------------------------------------------------------------ */

async function main() {
  if (!fs.existsSync(OUT)) {
    console.error("No out/ directory - run a build first.");
    process.exit(1);
  }

  const server = await serve();
  const all = routes();
  console.log(`Recording ${all.length} public routes against ${UPSTREAM}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const snapshot = {};
  let captured = 0;

  page.on("response", async (res) => {
    const url = new URL(res.url());
    if (!url.pathname.startsWith("/api/")) return;
    if (!res.ok()) return;
    let body;
    try {
      body = await res.json();
    } catch {
      return;
    }
    // Key on what the site asked for, minus the /api prefix the client adds.
    const key = url.pathname.replace(/^\/api/, "") + url.search;
    if (key in snapshot) return;
    snapshot[key] = body;
    captured++;
  });

  for (const [i, route] of all.entries()) {
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(700);
    } catch {
      // A route that will not settle still contributes whatever it did fetch.
    }
    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${all.length} routes, ${captured} responses`);
  }

  await browser.close();
  server.close();

  fs.mkdirSync(path.dirname(RAW), { recursive: true });
  fs.writeFileSync(RAW, JSON.stringify(snapshot));
  console.log(`\nCaptured ${captured} responses (raw kept for re-scrubbing). Scrubbing...`);

  const clean = {};
  let dropped = 0;
  for (const [key, value] of Object.entries(snapshot)) {
    const scrubbed = Array.isArray(value)
      ? value.map(scrubRecord).filter((r) => {
          if (isDroppable(r)) { dropped++; return false; }
          return true;
        })
      : scrubValue(scrubRecord(value));
    clean[key] = scrubbed;
  }

  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.writeFileSync(TARGET, JSON.stringify(clean));
  const mb = (fs.statSync(TARGET).size / 1024 / 1024).toFixed(2);

  console.log(`Dropped ${dropped} records that identified a person.`);
  console.log(`Wrote ${TARGET} (${mb} MB, ${Object.keys(clean).length} endpoints)`);
  console.log(`Institution renamed to "${DEMO_NAME}" (${DEMO_SHORT}).`);
}

main().catch((err) => { console.error("FATAL", err); process.exit(1); });
