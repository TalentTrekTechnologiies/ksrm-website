import { Injectable, BadRequestException } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import * as fsp from 'fs/promises';
import * as path from 'path';
import { fromFile } from 'file-type';
import {
  ALLOWED_EXTENSIONS,
  EXTENSION_MIME_MAP,
  EXTENSION_TYPE_MAP,
  MAGIC_BYTE_EXPECTED,
} from './constants/media-type-map';
import { MediaSettingsService } from './media-settings.service';

export interface ValidatedFile {
  type: MediaType;
  extension: string;
}

/** Patterns that make an SVG unsafe to re-serve from this backend's own
 * origin (the admin panel's origin) - a raw, unsanitized SVG is a stored-XSS
 * vector via inline <script>, event-handler attributes, <foreignObject>
 * (arbitrary embedded HTML), or a reference that pulls in remote content.
 * Deliberately reject rather than attempt to rewrite/strip - a hand-rolled
 * sanitizer that tries to "clean" markup is much easier to get wrong than
 * one that just refuses anything suspicious. */
const UNSAFE_SVG_PATTERNS: RegExp[] = [
  /<script[\s>]/i,
  /\son\w+\s*=/i, // onload=, onclick=, etc.
  /<foreignobject[\s>]/i,
  /javascript:/i,
  /<iframe[\s>]/i,
  /xlink:href\s*=\s*["']https?:/i,
  /\bhref\s*=\s*["']https?:/i,
];

@Injectable()
export class MediaValidationService {
  constructor(private mediaSettings: MediaSettingsService) {}

  async validate(file: Express.Multer.File): Promise<ValidatedFile> {
    const extension = this.extractExtension(file.originalname);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(
        `File type ".${extension}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}.`,
      );
    }

    const type = EXTENSION_TYPE_MAP[extension];

    const allowedMimes = EXTENSION_MIME_MAP[extension];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Declared file type "${file.mimetype}" does not match extension ".${extension}".`,
      );
    }

    const maxSizeBytes = await this.mediaSettings.getMaxSizeBytes(type);
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File is too large (${file.size} bytes). Maximum for ${type.toLowerCase()} is ${maxSizeBytes} bytes.`,
      );
    }

    if (extension === 'svg') {
      await this.assertSafeSvg(file.path);
    } else {
      await this.assertMagicBytesMatch(file.path, extension);
    }

    return { type, extension };
  }

  private extractExtension(filename: string): string {
    const ext = path.extname(filename).replace(/^\./, '').toLowerCase();
    return ext;
  }

  /** Don't trust the extension or declared MIME type alone - the file's
   * actual byte signature must resolve to something consistent with what
   * was claimed. Also the DOCX/XLSX/PPTX-are-ZIP-containers check: a bare
   * .zip renamed to .docx will sniff as generic application/zip, not the
   * specific Office subtype, and must be rejected even though the
   * extension/declared-MIME checks above already passed. */
  private async assertMagicBytesMatch(
    filePath: string,
    extension: string,
  ): Promise<void> {
    const expected = MAGIC_BYTE_EXPECTED[extension];
    const detected = await fromFile(filePath);

    if (!detected) {
      throw new BadRequestException(
        `Could not verify the actual content of this file - upload rejected.`,
      );
    }

    if (
      !expected.ext.includes(detected.ext) ||
      !expected.mime.includes(detected.mime)
    ) {
      throw new BadRequestException(
        `File content does not match its ".${extension}" extension (detected: ${detected.mime}).`,
      );
    }
  }

  private async assertSafeSvg(filePath: string): Promise<void> {
    const content = await fsp.readFile(filePath, 'utf-8');

    if (!content.includes('<svg')) {
      throw new BadRequestException('File does not contain valid SVG content.');
    }

    for (const pattern of UNSAFE_SVG_PATTERNS) {
      if (pattern.test(content)) {
        throw new BadRequestException(
          'This SVG contains content that is not allowed (scripts, event handlers, or external references).',
        );
      }
    }
  }
}
