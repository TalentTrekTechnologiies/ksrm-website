import { Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  MEDIA_SIZE_DEFAULTS_BYTES,
  MEDIA_SIZE_SETTING_KEYS,
} from './constants/media-type-map';

/**
 * Reads per-type upload size limits from the generic `SiteSetting` key/value
 * store (group: "media") rather than hardcoding them - lets an admin raise
 * or lower a limit from Site Settings without a code change. Falls back to
 * the documented defaults (Image 25MB / Video 2GB / Document 100MB) when no
 * row exists yet, so the module works out of the box before anyone visits
 * Site Settings.
 */
@Injectable()
export class MediaSettingsService {
  constructor(private prisma: PrismaService) {}

  async getMaxSizeBytes(type: MediaType): Promise<number> {
    const key = MEDIA_SIZE_SETTING_KEYS[type];
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key },
    });
    if (!setting) return MEDIA_SIZE_DEFAULTS_BYTES[type];

    const parsed = Number(setting.value);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : MEDIA_SIZE_DEFAULTS_BYTES[type];
  }

  /** Ensures the three size-limit rows exist in Site Settings (group:
   * "media") so an admin sees them immediately instead of the module
   * looking configured-but-empty. Safe to call repeatedly - no-ops once
   * the rows exist. Not run automatically; wired into the seed script. */
  async ensureDefaultSettingsSeeded(): Promise<void> {
    for (const type of Object.values(MediaType)) {
      const key = MEDIA_SIZE_SETTING_KEYS[type];
      await this.prisma.siteSetting.upsert({
        where: { key },
        update: {},
        create: {
          key,
          value: String(MEDIA_SIZE_DEFAULTS_BYTES[type]),
          type: 'NUMBER',
          group: 'media',
          isPublic: false,
          description: `Maximum upload size (bytes) for ${type.toLowerCase()} files in the Media Library.`,
        },
      });
    }
  }
}
