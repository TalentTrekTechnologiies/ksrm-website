/**
 * Turns a finished build in out/ into the specimen: renames the institution
 * everywhere it is written into the markup, swaps the logo assets, and makes
 * the whole thing uncrawlable.
 *
 * Done as a post-build pass rather than in the components because the college
 * name is written into 159 source files. Editing those would mean carrying a
 * demo concern through the production code forever, and risking the live site
 * for the sake of a sales asset. Here the production build is untouched - the
 * specimen is a copy, made after the fact.
 *
 *   node scripts/demo/rebrand.mjs
 *
 * Rewrites out/ in place, so run it on a demo build, never on the build you
 * are about to deploy to the college.
 */
import fs from "node:fs";
import path from "node:path";
import { DEMO_NAME, DEMO_SHORT, DEMO_DOMAIN } from "./scrub.mjs";

const OUT = path.join(process.cwd(), "out");
const DEMO_LOGO = path.join(process.cwd(), "public", "demo", "talenttrek-logo.png");

/** Extensions worth rewriting text in. Binaries are left alone. */
const TEXT = new Set([".html", ".js", ".css", ".json", ".txt", ".xml", ".webmanifest"]);

const REPLACEMENTS = [
  [/K\.?\s?S\.?\s?R\.?\s?M\.?\s+College\s+of\s+Engineering/g, DEMO_NAME],
  [/KSRM\s+College\s+of\s+Engineering/g, DEMO_NAME],
  [/K\.?S\.?R\.?M\.?C\.?E\.?/g, DEMO_SHORT],
  [/KSRMCE/g, DEMO_SHORT],
  [/K\.S\.R\.M\./g, DEMO_SHORT],
  [/KSRM/g, DEMO_SHORT],
  [/ksrmce\.ac\.in/g, DEMO_DOMAIN],
  [/Kadapa/g, "Springfield"],
  [/JNTUA/g, "State Technical University"],
  [/Kandula Obul Reddy Charities/g, "Demo Educational Trust"],
  [/Kandula Group of Institutions/g, "Demo Educational Trust"],

  // Case-insensitive from here down. The rules above are written as they
  // appear in prose; these turn up lower-cased inside handles, addresses and
  // hardcoded structured data, where the capitalised forms never matched.
  //
  // Deliberately NOT a blanket /ksrm/gi: the intro splash's CSS classes and
  // keyframes are all named "ksrm-intro-*", and rewriting an identifier to a
  // value with a space in it produces invalid CSS and a broken animation.
  // Only the things that identify the college are replaced.
  [/ksrmcengg@yahoo\.co\.in/gi, "info@talenttrektechnologies.com"],
  [/ksrmceofficialmedia/gi, "talenttrektechnologies"],
  [/ksrmceofficial/gi, "talenttrektechnologies"],
  [/\+?91[-\s]?9000073434/g, "+91 90000 00000"],
  [/kandula/gi, "Demo"],
  [/jntua/gi, "State Technical University"],

  // Social links. There are two sets in the codebase - the navbar's
  // "ksrmceofficial" handles and a footer set on plain "ksrmce" - and both
  // are live accounts belonging to the college. A visitor clicking one in
  // the specimen would land on the real institution, which gives the game
  // away and sends traffic somewhere it was not meant to go. Every social
  // link points at the agency instead.
  // Contact details hardcoded in components never pass through the API
  // scrub, so they arrive in the build untouched: the top bar carries the
  // college's live admissions numbers and names the Dean. Any Indian
  // mobile is replaced, wherever it was written.
  // Lookarounds, not \b: in "+918143731980" the country code runs straight
  // into the number, and there is no word boundary between two digits - so
  // the boundary form matched nothing and every tel: link survived.
  [/(?<!\d)(?:\+?91[- ]?)?[6-9]\d{4}[- ]?\d{5}(?!\d)/g, "+91 90000 00000"],
  [/Dean\s+S\.\s*L\.\s*Prathap\s+Reddy/gi, "Dean (Demo)"],
  [/S\.\s*L\.\s*Prathap\s+Reddy/gi, "A. Demo Name"],

  [/https?:\/\/(?:www\.)?(?:facebook|twitter|x|instagram|youtube|linkedin)\.com\/[A-Za-z0-9_.@/-]*ksrmce[A-Za-z0-9_.@/-]*/gi,
    "https://talenttrektechnologies.netlify.app/"],
];

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.error("No out/ directory - run a build first.");
    process.exit(1);
  }

  let filesChanged = 0;
  let replacements = 0;

  walk(OUT, (file) => {
    if (!TEXT.has(path.extname(file))) return;
    const before = fs.readFileSync(file, "utf-8");
    let after = before;
    for (const [pattern, value] of REPLACEMENTS) {
      after = after.replace(pattern, () => { replacements++; return value; });
    }
    if (after !== before) {
      fs.writeFileSync(file, after);
      filesChanged++;
    }
  });

  // Logos. The header falls back to /header.webp and the footer/admin use
  // /logo.png; both become the agency's mark. Overwriting the files means no
  // markup has to know about it.
  const logo = fs.readFileSync(DEMO_LOGO);
  for (const target of ["logo.png", "favicon.ico"]) {
    const dest = path.join(OUT, target);
    if (fs.existsSync(dest)) { fs.writeFileSync(dest, logo); console.log(`  replaced /${target}`); }
  }
  // The header banner is 1920x277, not a square mark - dropping the raw
  // logo in stretched it across half the viewport. This is the same logo
  // composited onto a banner of the right shape.
  const banner = path.join(process.cwd(), "public", "demo", "talenttrek-header.webp");
  const headerDest = path.join(OUT, "header.webp");
  if (fs.existsSync(banner) && fs.existsSync(headerDest)) {
    fs.writeFileSync(headerDest, fs.readFileSync(banner));
    console.log("  replaced /header.webp (banner-shaped)");
  }
  // The college's animated logo clip is not ours to ship. IntroSplash renders
  // the agency logo in demo mode instead, so the file is simply removed.
  const clip = path.join(OUT, "ksrm-logo.webm");
  if (fs.existsSync(clip)) { fs.unlinkSync(clip); console.log("  removed /ksrm-logo.webm"); }

  // Keep it out of search results. This is the single most important line
  // here: an indexed copy of a client's site competes with the client.
  fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");
  const sitemap = path.join(OUT, "sitemap.xml");
  if (fs.existsSync(sitemap)) fs.unlinkSync(sitemap);

  let noindexed = 0;
  walk(OUT, (file) => {
    if (path.extname(file) !== ".html") return;
    const html = fs.readFileSync(file, "utf-8");
    if (html.includes("noindex")) return;
    const tagged = html.replace(/<head>/i, '<head><meta name="robots" content="noindex,nofollow">');
    if (tagged !== html) { fs.writeFileSync(file, tagged); noindexed++; }
  });

  console.log(`\nRenamed institution in ${filesChanged} files (${replacements} replacements).`);
  console.log(`Added noindex to ${noindexed} pages; robots.txt disallows everything; sitemap removed.`);
  console.log(`\nSpecimen ready in out/ as "${DEMO_NAME}".`);
}

main();
