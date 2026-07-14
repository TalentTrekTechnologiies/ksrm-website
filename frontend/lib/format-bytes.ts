/** Human-readable file size (e.g. "11.8 MB") - accepts a plain number or a
 * stringified BigInt (Media.sizeBytes is serialized as a string, see
 * `main.ts`'s `BigInt.prototype.toJSON`), so every byte-count display in the
 * admin (Media Library file sizes, the Dashboard's Storage Used card) reads
 * the same way instead of one showing "12,370,007" and another "11.8 MB". */
export function formatBytes(bytes: number | string): string {
  const n = typeof bytes === "string" ? Number(bytes) : bytes
  if (!Number.isFinite(n) || n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}
