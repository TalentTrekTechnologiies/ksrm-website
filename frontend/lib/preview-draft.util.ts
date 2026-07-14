/** Encodes draft content for the `?draft=` query param read by PreviewRenderer. */
export function encodeDraft(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}
