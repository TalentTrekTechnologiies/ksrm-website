// Backend origin, resolved once from the build-time environment. Never
// hardcode `http://localhost:4000` in page/component source - import these
// instead, so a production build with NEXT_PUBLIC_API_URL set points every
// asset at the real backend automatically.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

/** Servable URL for a Media Library asset (original file). */
export function mediaFile(id: number): string {
  return `${API_BASE}/media/file/${id}/ORIGINAL/SOURCE`;
}
