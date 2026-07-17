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
