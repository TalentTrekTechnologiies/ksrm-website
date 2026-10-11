// The one place the backend origin is resolved. Never hardcode
// `http://localhost:4000` in page/component source - import from here instead,
// so every API call and asset URL follows the same rule.
//
// Last-resort origin for a PRODUCTION build whose NEXT_PUBLIC_API_URL never
// arrived. It is deliberately not a placeholder: a missing env var used to
// silently ship a working-looking site that was entirely broken, because the
// fallbacks were worse than useless -
//   - api-client fell back to "" (relative), so every call hit the static host
//     and 404'd: POST https://ksrmcol.netlify.app/auth/login -> 404, which took
//     out the ticker, downloads and admin login at once.
//   - everything else fell back to localhost:4000, so every image and PDF
//     resolved against the visitor's own machine.
// Neither fails the build, so both shipped green. Guessing the real backend is
// strictly better than either. NEXT_PUBLIC_API_URL still wins whenever it is
// set, so this never overrides real configuration.
const PRODUCTION_API_ORIGIN = "https://ksrm-backend.onrender.com";

function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  // NODE_ENV is build-time and always "production" for `next build`, so a
  // deployed export can never resolve to localhost.
  return process.env.NODE_ENV === "production" ? PRODUCTION_API_ORIGIN : "http://localhost:4000";
}

export const API_BASE = resolveApiBase();

/** Servable URL for a Media Library asset (original file). */
export function mediaFile(id: number): string {
  return `${API_BASE}/media/file/${id}/ORIGINAL/SOURCE`;
}

/**
 * Makes a URL stored in the database servable from wherever the page is.
 *
 * Rows hold two shapes, both legitimate. Older ones were rewritten to a
 * relative "/api/media/file/..." so they would follow the site's own scheme
 * and host rather than being pinned to an IP; newer ones are absolute,
 * because the server resolves the URL at save time against its own origin.
 *
 * A relative one only works where the site and the API share an origin -
 * true in production, where Nginx proxies /api, and false in development,
 * where the site is on :3000 and the API on :4000. Rendered raw, every
 * pre-existing document 404'd locally while freshly uploaded ones worked,
 * which reads like "some of the PDFs are broken" rather than a host mismatch.
 *
 * Anything already absolute, or pointing somewhere else entirely (an external
 * site, a static file under /public), is returned untouched.
 */
/**
 * Props for an <img> in a grid: a smaller copy of a Media Library image, with
 * the original as the fallback.
 *
 * Grids used to load every photo's original - 0.5-1.8 MB each, ~70 MB for the
 * Gallery page - though the Media Library keeps an 800px WebP of each upload
 * (MEDIUM, ~70 KB). Images imported from the old site may not have one until
 * backend/scripts/backfill-image-variants.ts has run, so a missing copy falls
 * back to the original instead of showing as broken. A URL that is not a
 * Media Library original (a static file, a video) is used as it is.
 *
 * Usage: <img {...thumbProps(item.imageUrl)} alt="..." loading="lazy" />
 */
export function thumbProps(
  url: string | null | undefined,
  size: "SMALL" | "MEDIUM" | "LARGE" = "MEDIUM",
  /** Runs when even the original fails - e.g. to hide the tile. */
  onFinalError?: (img: HTMLImageElement) => void,
) {
  const original = resolveFileUrl(url);
  const thumb = original.replace(/\/media\/file\/(\d+)\/ORIGINAL\/SOURCE$/, `/media/file/$1/${size}/WEBP`);
  return {
    src: thumb,
    onError: (e: { currentTarget: HTMLImageElement }) => {
      const img = e.currentTarget;
      if (thumb !== original && img.dataset.fellBack !== "1") {
        img.dataset.fellBack = "1";
        img.src = original;
        return;
      }
      onFinalError?.(img);
    },
  };
}

export function resolveFileUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  // A Media Library file is only ever served by this site's own API, so an
  // absolute one is re-pointed at it whatever host it was saved against.
  // Rows saved while the API answered on a bare IP still carried
  // "http://200.141.7.253/api/media/file/...": on the HTTPS site the browser
  // refused it as mixed content, and the H&S department video never played.
  const media = trimmed.match(/^https?:\/\/[^/]+\/api(\/media\/file\/.*)$/i);
  if (media) return `${API_BASE}${media[1]}`;
  // Stored without the /api prefix, which the static host answers with a 404.
  if (trimmed.startsWith("/media/file/")) return `${API_BASE}${trimmed}`;
  if (/^(https?:|data:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  // API_BASE already carries the /api prefix, so the stored one is dropped
  // rather than doubled.
  if (trimmed.startsWith("/api/")) return `${API_BASE}${trimmed.slice(4)}`;
  return trimmed;
}
