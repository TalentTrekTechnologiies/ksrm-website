import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { StorageAdapter } from './storage-adapter.interface';

@Injectable()
export class LocalDiskStorageAdapter implements StorageAdapter {
  private readonly root: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.root = path.resolve(
      this.configService.get<string>('MEDIA_STORAGE_ROOT') ?? './storage/media',
    );
    this.baseUrl = (
      this.configService.get<string>('MEDIA_BASE_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? 4000}`
    ).replace(/\/$/, '');

    fs.mkdirSync(this.root, { recursive: true });
  }

  async save(
    sourcePath: string,
    keyHint: string,
    mimeType: string,
  ): Promise<{ storageKey: string; sizeBytes: number }> {
    // mimeType is part of the StorageAdapter interface (a future S3 adapter
    // needs it for the object's Content-Type) but local disk storage has no
    // use for it.
    void mimeType;
    const storageKey = this.allocateKey(keyHint);

    const destPath = this.resolveKey(storageKey);
    await fsp.mkdir(path.dirname(destPath), { recursive: true });
    await fsp.copyFile(sourcePath, destPath);

    const stats = await fsp.stat(destPath);
    return { storageKey, sizeBytes: stats.size };
  }

  /** Mints a fresh, date-partitioned storage key without writing anything -
   * used by callers (e.g. `MediaImageProcessingService`) that generate
   * output directly at a destination path (sharp's `.toFile()`) rather than
   * copying an already-existing source file via `save()`. */
  allocateKey(extensionHint: string): string {
    const now = new Date();
    const yyyy = String(now.getUTCFullYear());
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const ext = extensionHint.startsWith('.')
      ? extensionHint
      : `.${extensionHint}`;
    return path.posix.join(yyyy, mm, `${randomUUID()}${ext}`);
  }

  /** Ensures the parent directory for a storage key exists - callers that
   * write to `resolveKey(key)` directly (bypassing `save()`) need this. */
  async ensureParentDir(storageKey: string): Promise<void> {
    await fsp.mkdir(path.dirname(this.resolveKey(storageKey)), {
      recursive: true,
    });
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = this.resolveKey(storageKey);
    await fsp.rm(filePath, { force: true });
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      await fsp.access(this.resolveKey(storageKey));
      return true;
    } catch {
      return false;
    }
  }

  createReadStream(storageKey: string): NodeJS.ReadableStream {
    return fs.createReadStream(this.resolveKey(storageKey));
  }

  getUrl(storageKey: string): string {
    return `${this.baseUrl}/media/raw/${storageKey}`;
  }

  /** Absolute filesystem path a caller can read/write for local processing
   * (e.g. sharp) without going through a stream - not part of the
   * `StorageAdapter` interface since a remote adapter has no local path,
   * but `MediaImageProcessingService` needs it for the current, local-only
   * implementation. */
  resolveKey(storageKey: string): string {
    const resolved = path.resolve(this.root, storageKey);
    if (!resolved.startsWith(this.root)) {
      throw new Error(`Invalid storage key: ${storageKey}`);
    }
    return resolved;
  }
}
