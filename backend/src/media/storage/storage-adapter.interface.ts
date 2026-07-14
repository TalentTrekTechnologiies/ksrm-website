/**
 * Swap boundary for where Media Library bytes actually live. `LocalDiskStorageAdapter`
 * is the only implementation today; a future `S3StorageAdapter implements StorageAdapter`
 * plus one DI binding change in `media.module.ts` (and a `MEDIA_BASE_URL` env change) is
 * the entire migration - no other application code should ever touch the filesystem or
 * an S3 SDK directly.
 */
export interface StorageAdapter {
  /**
   * Moves/copies the file at `sourcePath` (a temp file multer already wrote to disk)
   * into permanent storage under a key derived from `keyHint`, and returns the final
   * storage key plus the byte size actually stored.
   */
  save(
    sourcePath: string,
    keyHint: string,
    mimeType: string,
  ): Promise<{ storageKey: string; sizeBytes: number }>;

  delete(storageKey: string): Promise<void>;

  exists(storageKey: string): Promise<boolean>;

  createReadStream(storageKey: string): NodeJS.ReadableStream;

  /**
   * Absolute, directly-fetchable URL for a stored key. Local disk: this backend's own
   * streaming route. A future S3 adapter: the CDN/S3 URL directly.
   */
  getUrl(storageKey: string): string;
}
