import { MediaType } from '@prisma/client';

/** Extension allowlist - the enforcement mechanism itself. Anything not a key
 * here (EXE/BAT/JS/PHP/bare ZIP/etc.) is rejected before any further
 * validation runs. */
export const EXTENSION_TYPE_MAP: Record<string, MediaType> = {
  jpg: MediaType.IMAGE,
  jpeg: MediaType.IMAGE,
  png: MediaType.IMAGE,
  svg: MediaType.IMAGE,
  webp: MediaType.IMAGE,
  mp4: MediaType.VIDEO,
  webm: MediaType.VIDEO,
  pdf: MediaType.DOCUMENT,
  doc: MediaType.DOCUMENT,
  docx: MediaType.DOCUMENT,
  xlsx: MediaType.DOCUMENT,
  pptx: MediaType.DOCUMENT,
};

export const ALLOWED_EXTENSIONS = Object.keys(EXTENSION_TYPE_MAP);

/** Declared (client-supplied, untrusted) MIME types accepted per extension. */
export const EXTENSION_MIME_MAP: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  svg: ['image/svg+xml'],
  webp: ['image/webp'],
  mp4: ['video/mp4'],
  webm: ['video/webm'],
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  pptx: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
};

/** Expected `file-type` (magic-byte sniffed) ext/mime per our extension.
 * SVG is deliberately absent - it has no reliable magic-byte signature and
 * is validated by `assertSafeSvg` instead. A file whose sniffed result
 * doesn't match this (e.g. a renamed .zip claiming to be .docx, or content
 * that only resolves to generic application/zip) is rejected. */
export const MAGIC_BYTE_EXPECTED: Record<
  string,
  { ext: string[]; mime: string[] }
> = {
  jpg: { ext: ['jpg'], mime: ['image/jpeg'] },
  jpeg: { ext: ['jpg'], mime: ['image/jpeg'] },
  png: { ext: ['png'], mime: ['image/png'] },
  webp: { ext: ['webp'], mime: ['image/webp'] },
  mp4: { ext: ['mp4'], mime: ['video/mp4'] },
  webm: { ext: ['webm'], mime: ['video/webm'] },
  pdf: { ext: ['pdf'], mime: ['application/pdf'] },
  // Legacy .doc is an MS-CFB container (same binary format family as old
  // .xls/.ppt/.msi/.msg) - file-type@16 only detects the generic container
  // signature, not a doc-specific one, so this can't distinguish a real
  // .doc from a renamed old .xls/.ppt. It still reliably rejects EXE/ZIP/
  // JS/etc (none of which produce this signature), which is the actual
  // security boundary this check exists for.
  doc: { ext: ['cfb'], mime: ['application/x-cfb'] },
  docx: {
    ext: ['docx'],
    mime: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  xlsx: {
    ext: ['xlsx'],
    mime: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  pptx: {
    ext: ['pptx'],
    mime: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  },
};

/** Site-Setting keys for per-type configurable size limits, with the
 * defaults the user specified (bytes) used the first time each key is
 * read and no row exists yet. */
export const MEDIA_SIZE_SETTING_KEYS: Record<MediaType, string> = {
  IMAGE: 'media.maxSizeImageBytes',
  VIDEO: 'media.maxSizeVideoBytes',
  DOCUMENT: 'media.maxSizeDocumentBytes',
};

export const MEDIA_SIZE_DEFAULTS_BYTES: Record<MediaType, number> = {
  IMAGE: 25 * 1024 * 1024, // 25 MB
  VIDEO: 2 * 1024 * 1024 * 1024, // 2 GB
  DOCUMENT: 100 * 1024 * 1024, // 100 MB (covers PDF/PPT; DOCX/XLSX are usually far smaller)
};

/** Hard ceiling enforced at the multipart-interceptor layer (before any DB
 * lookup is possible) - defense in depth against a request larger than any
 * configured per-type limit could legitimately be. The real, configurable
 * per-type limit is enforced afterward in MediaValidationService. */
export const MEDIA_HARD_SIZE_CEILING_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

export const MEDIA_BULK_MAX_FILES = 20;

/** Resize targets for the automatic image derivative pipeline. ORIGINAL is
 * NOT the raw upload - it's a re-encoded, EXIF-stripped, dimension-capped
 * rendition; the true original (Media.storageKey) is archival-only and
 * never served publicly. `sharp`'s `fit: 'inside', withoutEnlargement:
 * true` means a source smaller than a given target simply doesn't produce
 * a larger-than-source variant. */
export const IMAGE_VARIANT_TARGETS: { size: string; maxDimension: number }[] = [
  { size: 'ORIGINAL', maxDimension: 2560 },
  { size: 'HERO', maxDimension: 1920 },
  { size: 'LARGE', maxDimension: 1200 },
  { size: 'MEDIUM', maxDimension: 800 },
  { size: 'SMALL', maxDimension: 400 },
  { size: 'THUMBNAIL', maxDimension: 200 },
];
