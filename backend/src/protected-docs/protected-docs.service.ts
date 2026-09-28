import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_ADAPTER } from '../media/storage/storage.constants';
import type { StorageAdapter } from '../media/storage/storage-adapter.interface';

/**
 * Pages whose documents are shown, never handed over.
 *
 * Deliberately a short allow-list rather than a flag on every document: this
 * route rasterises whatever it is pointed at, so if it could be pointed at any
 * id it would become a way to read documents the rest of the CMS keeps behind
 * permissions. A page has to be named here to be reachable at all.
 */
const PROTECTED_SECTION_ROOTS = new Set(['nba']);

/**
 * How large a page is rendered. 2x is legible on a laptop and on a phone at
 * full zoom, and is around 150-250 KB a page once it is a JPEG - small enough
 * to turn pages without waiting.
 */
const RENDER_SCALE = 2;

/**
 * Serves accreditation documents as page images that carry the viewer's own
 * watermark, so the PDF itself never reaches anybody's device.
 *
 * What this genuinely prevents: downloading the file. The browser is sent one
 * flattened JPEG per page, so there is no document to save, no text to copy,
 * and a shared page is one page.
 *
 * What nothing can prevent: a screenshot, or a photograph of the screen. Those
 * happen in the operating system and in the room, where no website reaches.
 * The watermark is the answer to both - it is burned into the pixels rather
 * than laid over them in the DOM, so it cannot be removed with devtools and it
 * appears in a phone photo exactly as it appears on screen. A leaked page
 * names the address and the minute it was served.
 */
@Injectable()
export class ProtectedDocsService {
  private readonly logger = new Logger(ProtectedDocsService.name);
  private readonly cacheRoot: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject(STORAGE_ADAPTER) private storage: StorageAdapter,
  ) {
    this.cacheRoot = path.join(
      this.config.get<string>('MEDIA_STORAGE_ROOT') ?? './storage/media',
      '.protected-pages',
    );
  }

  /**
   * The document, if it is one this route is allowed to serve.
   *
   * A 404 rather than a 403 for everything: whether a given id exists, and
   * which page it belongs to, are not things an unauthenticated caller should
   * be able to map out by reading status codes.
   */
  private async documentOrThrow(id: number) {
    const doc = await this.prisma.download.findFirst({
      where: { id, deletedAt: null, isActive: true },
    });
    const root = doc?.pageSection?.split('.')[0];
    if (!doc || !root || !PROTECTED_SECTION_ROOTS.has(root)) {
      throw new NotFoundException();
    }
    return doc;
  }

  /** The original bytes, read through the storage adapter, never by path. */
  private async sourceBytes(mediaId: number | null): Promise<Buffer> {
    if (mediaId == null) throw new NotFoundException();

    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, deletedAt: null, isActive: true, isPrivate: false },
    });
    if (!media) throw new NotFoundException();

    const variant = await this.prisma.mediaVariant.findFirst({
      where: {
        mediaId,
        variant: 'ORIGINAL' as never,
        format: 'SOURCE' as never,
        cropPreset: null,
      },
    });
    if (!variant) throw new NotFoundException();

    const chunks: Buffer[] = [];
    const stream = this.storage.createReadStream(variant.storageKey);
    for await (const chunk of stream as AsyncIterable<Buffer>) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  /**
   * Renders every page once and keeps them.
   *
   * Rasterising is the expensive part and the document does not change, so it
   * is done on the first request and read from disk afterwards. The watermark
   * is NOT baked in here - it is per viewer, and a cached copy carrying
   * somebody else's address would defeat the point of having one.
   */
  private async ensureRendered(docId: number, mediaId: number | null): Promise<number> {
    const dir = path.join(this.cacheRoot, String(docId));
    const manifest = path.join(dir, 'pages.json');

    if (fs.existsSync(manifest)) {
      const { pages } = JSON.parse(fs.readFileSync(manifest, 'utf-8')) as { pages: number };
      return pages;
    }

    const bytes = await this.sourceBytes(mediaId);
    // Imported here, not at module load: pdf-to-img is ESM-only, and the rest
    // of this backend is CommonJS.
    const require = createRequire(__filename);
    const { pdf } = (await import('pdf-to-img')) as {
      pdf: (
        data: Buffer,
        opts: Record<string, unknown>,
      ) => Promise<AsyncIterable<Buffer> & { length: number }>;
    };

    // Without this, any PDF relying on a standard font (rather than embedding
    // its own) renders with the glyphs missing and no error.
    //
    // A filesystem path with forward slashes and a trailing one. pdfjs
    // validates it as a URL and refuses anything not ending in "/", but reads
    // it from disk - so a file:// URL fails to load and a Windows path fails
    // validation. Only this form satisfies both, and the failure mode either
    // way is a page rendered with its glyphs missing and no error raised.
    const fontsDir = path.join(
      path.dirname(require.resolve('pdfjs-dist/package.json')),
      'standard_fonts',
    );
    const standardFontDataUrl = `${fontsDir.split(path.sep).join('/')}/`;

    fs.mkdirSync(dir, { recursive: true });
    const document = await pdf(bytes, {
      scale: RENDER_SCALE,
      docInitParams: { standardFontDataUrl },
    });

    let pages = 0;
    for await (const page of document) {
      pages += 1;
      fs.writeFileSync(path.join(dir, `${pages}.png`), page);
    }
    fs.writeFileSync(manifest, JSON.stringify({ pages }));
    this.logger.log(`Rendered document ${docId} to ${pages} page image(s)`);
    return pages;
  }

  async meta(id: number) {
    const doc = await this.documentOrThrow(id);
    const pages = await this.ensureRendered(doc.id, doc.mediaId);
    return { id: doc.id, title: doc.title, pages };
  }

  /**
   * One page, watermarked for whoever asked for it.
   *
   * The watermark is drawn across the whole page at a slant rather than
   * tucked into a corner, because a corner is the first thing cropped out of
   * a screenshot.
   */
  async page(id: number, pageNumber: number, viewer: string): Promise<Buffer> {
    const doc = await this.documentOrThrow(id);
    const pages = await this.ensureRendered(doc.id, doc.mediaId);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pages) {
      throw new NotFoundException();
    }

    const file = path.join(this.cacheRoot, String(doc.id), `${pageNumber}.png`);
    if (!fs.existsSync(file)) throw new NotFoundException();

    const image = sharp(file);
    const { width = 1000, height = 1400 } = await image.metadata();
    const mark = this.watermarkSvg(width, height, viewer);

    return image
      .composite([{ input: mark, top: 0, left: 0 }])
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
  }

  /** Repeated diagonally so no crop of the page can be free of it. */
  private watermarkSvg(width: number, height: number, viewer: string): Buffer {
    const label = escapeXml(viewer);
    const fontSize = Math.max(14, Math.round(width / 30));
    const rows: string[] = [];
    const lines = 7;
    for (let i = 0; i < lines; i++) {
      const y = Math.round((height * (i + 0.5)) / lines);
      rows.push(
        `<text class="m" x="${Math.round(-width * 0.2)}" y="${y}">${label} &#160;&#160; ${label} &#160;&#160; ${label}</text>`,
      );
    }
    return Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` +
        `<style>.m{fill:#b00020;fill-opacity:0.17;font-family:sans-serif;font-size:${fontSize}px;font-weight:700}</style>` +
        `<g transform="rotate(-28 ${width / 2} ${height / 2})">${rows.join('')}</g>` +
        `</svg>`,
    );
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
