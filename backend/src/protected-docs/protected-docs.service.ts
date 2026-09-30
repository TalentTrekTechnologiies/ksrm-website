import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Worker } from 'node:worker_threads';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_ADAPTER } from '../media/storage/storage.constants';
import type { StorageAdapter } from '../media/storage/storage-adapter.interface';
import { findFigureBoxes, type FigureBox } from './figure-boxes';
import { resolvePolicy } from './figure-policy';
import type { RenderJob, RenderMessage } from './render-worker';

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
 * How large a page is rendered.
 *
 * 3x rather than 2x. At 2x a full A4 page shown at the height of a laptop
 * window is being downscaled only slightly, and small print in an
 * accreditation table came out soft - the page is read at full height here,
 * not thumbnailed. Costs roughly twice the bytes and render time per page,
 * which the reader no longer waits for: rendering happens behind page one.
 *
 * Chroma subsampling is off for the same reason. The default halves colour
 * resolution, which is invisible on a photograph and smears the edges of thin
 * dark text on white paper.
 */
const RENDER_SCALE = 3;

/**
 * How long a page link stays valid.
 *
 * Short enough that a URL copied out of the network tab and pasted to someone
 * else has usually stopped working by the time they open it; long enough to
 * read a long document without the pages dying underneath you, because the
 * token is reissued whenever the viewer asks for the document again.
 */
const TOKEN_TTL_MS = 15 * 60 * 1000;

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
export class ProtectedDocsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProtectedDocsService.name);
  private readonly cacheRoot: string;

  /**
   * The one rendering thread, and the jobs waiting on it.
   *
   * Started with the service rather than on the first open: loading the PDF
   * library into a fresh thread takes 1.6-3.5 s, and a thread per document put
   * that in front of every reader who was first to a new upload.
   */
  private worker: Worker | null = null;
  private nextJob = 1;
  private readonly jobs = new Map<number, (m: RenderMessage) => void>();

  onModuleInit() {
    this.renderWorker();
  }

  async onModuleDestroy() {
    await this.worker?.terminate();
  }

  private renderWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(path.join(__dirname, 'render-worker.js'));
    // The HTTP server keeps the process alive; this thread should not.
    worker.unref();
    worker.on('message', (m: RenderMessage) => this.jobs.get(m.id)?.(m));
    // If the thread dies, every job it held fails now rather than hanging,
    // and the next render starts a fresh one.
    const died = (error: Error) => {
      if (this.worker === worker) this.worker = null;
      for (const [id, handle] of this.jobs) {
        handle({ id, type: 'error', message: error.message });
      }
      this.jobs.clear();
    };
    worker.on('error', died);
    worker.on('exit', (code) =>
      died(new Error(`render worker exited with code ${code}`)),
    );
    this.worker = worker;
    return worker;
  }

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
   * A signed, expiring permit for one document.
   *
   * The page route is public - NBA reviewers are given a URL and will not be
   * issued accounts - so "public" has to mean "public for a quarter of an
   * hour, to whoever asked". Without this the page URLs are permanent and
   * guessable by walking the id, which is a worse position than the PDF link
   * this replaced.
   *
   * Signed with the server's own key, so nothing about it can be forged
   * client-side, and it commits to the document id: a token for one document
   * cannot be replayed against another.
   */
  private secret(): string {
    const key = this.config.get<string>('JWT_SECRET');
    if (!key) {
      // Same stance as AuthModule: refuse rather than fall back to a default
      // that would make every signature meaningless.
      throw new Error(
        'JWT_SECRET is not set; refusing to issue document tokens.',
      );
    }
    return key;
  }

  issueToken(documentId: number): string {
    const expires = Date.now() + TOKEN_TTL_MS;
    const payload = `${documentId}.${expires}`;
    const mac = createHmac('sha256', this.secret())
      .update(payload)
      .digest('base64url');
    return `${expires}.${mac}`;
  }

  verifyToken(documentId: number, token: string | undefined): boolean {
    if (!token) return false;
    const [expiresRaw, mac] = token.split('.');
    const expires = Number(expiresRaw);
    if (!Number.isFinite(expires) || !mac) return false;
    if (Date.now() > expires) return false;

    const expected = createHmac('sha256', this.secret())
      .update(`${documentId}.${expires}`)
      .digest('base64url');
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    // Constant time, so a caller cannot learn the signature a byte at a time
    // from how long the comparison took.
    return a.length === b.length && timingSafeEqual(a, b);
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
    for await (const chunk of stream as AsyncIterable<Buffer>)
      chunks.push(chunk);
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
  private async ensureRendered(
    docId: number,
    mediaId: number | null,
  ): Promise<number> {
    const key = cacheKey(docId, mediaId);
    const dir = path.join(this.cacheRoot, key);
    const manifest = path.join(dir, 'pages.json');

    const running = this.rendering.get(key);
    if (running) return running;

    if (fs.existsSync(manifest)) {
      const { pages } = JSON.parse(fs.readFileSync(manifest, 'utf-8')) as {
        pages: number;
      };
      // Written when page 1 is ready, not when the last one is. If the process
      // stopped between the two, the manifest says the document is open-able
      // while its later pages never arrive - so it is only trusted once the
      // last page is on disk, or while a render is still producing it.
      if (
        fs.existsSync(path.join(dir, `${pages}.png`)) ||
        this.backgroundRender.has(key)
      ) {
        return pages;
      }
      this.logger.warn(
        `Document ${docId}: render was interrupted, starting it again`,
      );
    }

    // One render per document, however many callers ask at once.
    //
    // The cache is only visible once the manifest is written at the very end,
    // so two requests arriving during the first render both saw no cache and
    // both rendered the whole document. Observed in a dev log: the same
    // twelve-page document rasterised and OCR'd twice, sixty seconds each,
    // because the viewer asked twice while the first was still running. With a
    // long document and two readers it is minutes of duplicated CPU.
    const work = this.renderNow(docId, mediaId, key, dir, manifest).finally(
      () => {
        this.rendering.delete(key);
      },
    );
    this.rendering.set(key, work);
    return work;
  }

  /**
   * In-flight renders, so concurrent callers share one.
   *
   * Per process. A second instance behind a load balancer would still render
   * its own copy once - acceptable, since the result is written to the shared
   * cache directory and the duplication is bounded by the number of instances
   * rather than by the number of readers.
   */
  private readonly rendering = new Map<string, Promise<number>>();

  private async renderNow(
    docId: number,
    mediaId: number | null,
    key: string,
    dir: string,
    manifest: string,
  ): Promise<number> {
    const bytes = await this.sourceBytes(mediaId);

    fs.mkdirSync(this.cacheRoot, { recursive: true });
    // Pages from a file this document no longer points at. Nothing can reach
    // them once the key has moved on, so they are only disk.
    for (const stale of fs.readdirSync(this.cacheRoot, {
      withFileTypes: true,
    })) {
      if (
        stale.isDirectory() &&
        stale.name.startsWith(`${docId}-`) &&
        stale.name !== key
      ) {
        fs.rmSync(path.join(this.cacheRoot, stale.name), {
          recursive: true,
          force: true,
        });
      }
    }

    const require = createRequire(__filename);

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

    // On a worker thread, not this one.
    //
    // Rasterising is solid CPU on whichever thread runs it, and this thread
    // answers every request the site makes. Measured with a 34-page upload:
    // /api/departments went from ~125 ms to ~1.2 s for the whole 28 seconds
    // the document took, which is the site feeling slow whenever somebody
    // opened a new document. See render-worker.ts.
    const job: RenderJob = {
      bytes,
      dir,
      scale: RENDER_SCALE,
      standardFontDataUrl,
    };
    const id = this.nextJob++;

    // Resolves with the page count once page 1 is on disk: the reader sees
    // page one while the rest are still being written, and by the time they
    // turn, the next is there. `rest` settles when the last page is.
    let total = 0;
    let firstReady!: (pages: number) => void;
    let firstFailed!: (error: Error) => void;
    const first = new Promise<number>((resolve, reject) => {
      firstReady = resolve;
      firstFailed = reject;
    });

    const rest = new Promise<void>((resolve, reject) => {
      const fail = (error: Error) => {
        firstFailed(error);
        reject(error);
      };
      this.jobs.set(id, (m: RenderMessage) => {
        if (m.type === 'count') {
          total = m.pages;
        } else if (m.type === 'page' && m.n === 1) {
          // Written now, so the document counts as openable from this moment.
          fs.writeFileSync(manifest, JSON.stringify({ pages: total }));
          this.logger.log(
            `Document ${docId}: page 1 of ${total} ready, rendering the rest`,
          );
          firstReady(total);
        } else if (m.type === 'done') {
          if (m.pages === 0) firstFailed(new NotFoundException());
          this.logger.log(
            `Document ${docId}: all ${m.pages} page image(s) rendered`,
          );
          this.jobs.delete(id);
          resolve();
        } else if (m.type === 'error') {
          this.jobs.delete(id);
          fail(new Error(m.message));
        }
      });
    });
    this.renderWorker().postMessage({ type: 'job', id, job });

    // Tracked rather than fired and forgotten, because `page()` has to be able
    // to wait for a page the reader reached faster than the renderer did.
    const tracked = rest.catch((error) => {
      // A failure here leaves the later pages missing rather than the document
      // unopenable, so it is logged and not thrown into a request that has
      // already been answered.
      this.logger.error(
        `Document ${docId}: rendering failed. ${String(error)}`,
      );
    });
    this.backgroundRender.set(key, tracked);
    void tracked.finally(() => this.backgroundRender.delete(key));

    return first;
  }

  /**
   * Starts rendering a document that was just uploaded or replaced, so its
   * first reader opens it from cache instead of waiting for the render.
   *
   * Fire and forget: the upload has already succeeded, and a document this
   * route does not serve (anything outside the protected sections) is simply
   * skipped. A render that fails here is logged, and the first open tries
   * again.
   */
  prewarm(id: number): void {
    this.documentOrThrow(id)
      .then((doc) => this.ensureRendered(doc.id, doc.mediaId))
      .catch((error: unknown) => {
        if (error instanceof NotFoundException) return;
        this.logger.warn(
          `Document ${id}: could not pre-render. ${String(error)}`,
        );
      });
  }

  async meta(id: number) {
    const doc = await this.documentOrThrow(id);
    const pages = await this.ensureRendered(doc.id, doc.mediaId);
    return {
      id: doc.id,
      title: doc.title,
      pages,
      token: this.issueToken(doc.id),
      expiresInMs: TOKEN_TTL_MS,
    };
  }

  /**
   * Where the figures are on one page, as fractions of its size.
   *
   * Only the boxes, never the values. The numbers stay in the page image and
   * are uncovered by moving a block out of the way, so nothing here hands a
   * caller a machine-readable copy of the figures - which is precisely what
   * this layer exists to prevent.
   */
  async figures(id: number, pageNumber: number): Promise<FigureBox[]> {
    const doc = await this.documentOrThrow(id);
    const pages = await this.ensureRendered(doc.id, doc.mediaId);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pages) {
      throw new NotFoundException();
    }

    const dir = path.join(this.cacheRoot, cacheKey(doc.id, doc.mediaId));
    const cached = path.join(dir, `figures-${pageNumber}.json`);
    if (fs.existsSync(cached)) {
      try {
        return JSON.parse(fs.readFileSync(cached, 'utf-8')) as FigureBox[];
      } catch {
        // A truncated file from an interrupted write. Detect it again rather
        // than serve a page as though it had no figures on it.
      }
    }

    // Detected per page, on demand, rather than for the whole document up
    // front.
    //
    // Doing every page during the render put ALL of the OCR in front of the
    // reader before they saw anything: measured at 50 seconds of a 60-second
    // open for twelve pages, and it scales with the document - a hundred-page
    // report would have been minutes. Per page it is a few seconds for the
    // page being read, pages nobody opens are never OCR'd at all, and the
    // result is cached the same way.
    const key = `${doc.id}:${pageNumber}`;
    const running = this.detecting.get(key);
    if (running) return running;

    const policy = resolvePolicy(
      this.config.get<string>('PROTECTED_DOCS_FIGURE_POLICY'),
    );
    const work = findFigureBoxes(path.join(dir, `${pageNumber}.png`), policy)
      .then((boxes) => {
        try {
          fs.writeFileSync(cached, JSON.stringify(boxes));
        } catch {
          // Cache write failures cost time on the next view, not correctness.
        }
        this.logger.log(
          `Document ${doc.id} page ${pageNumber}: ${boxes.length} figure(s) to redact`,
        );
        return boxes;
      })
      .finally(() => {
        this.detecting.delete(key);
      });

    this.detecting.set(key, work);
    return work;
  }

  /** In-flight per-page detections, so concurrent readers share one OCR pass. */
  private readonly detecting = new Map<string, Promise<FigureBox[]>>();

  /** Documents whose later pages are still being written behind the reader. */
  private readonly backgroundRender = new Map<string, Promise<void>>();

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

    const file = path.join(
      this.cacheRoot,
      cacheKey(doc.id, doc.mediaId),
      `${pageNumber}.png`,
    );
    if (!fs.existsSync(file)) {
      // Turned to faster than the background render reached. Wait for it
      // rather than 404 a page that is seconds away from existing.
      const pending = this.backgroundRender.get(cacheKey(doc.id, doc.mediaId));
      if (pending) await pending;
      if (!fs.existsSync(file)) throw new NotFoundException();
    }

    const image = sharp(file);
    const { width = 1000, height = 1400 } = await image.metadata();
    const mark = this.watermarkSvg(width, height, viewer);

    return image
      .composite([{ input: mark, top: 0, left: 0 }])
      .jpeg({ quality: 88, progressive: true, chromaSubsampling: '4:4:4' })
      .toBuffer();
  }

  /**
   * Repeated diagonally so no crop of the page can be free of it.
   *
   * Faint grey and sparse, not red and dense. It is there to identify a copy,
   * which it does at any opacity a person can still make out; at the old 17%
   * red over seven rows it sat on top of the text and the page was harder to
   * read than the watermark was worth.
   */
  private watermarkSvg(width: number, height: number, viewer: string): Buffer {
    const label = escapeXml(viewer);
    const fontSize = Math.max(14, Math.round(width / 34));
    const rows: string[] = [];
    const lines = 4;
    for (let i = 0; i < lines; i++) {
      const y = Math.round((height * (i + 0.5)) / lines);
      rows.push(
        `<text class="m" x="${Math.round(-width * 0.2)}" y="${y}">${label} &#160;&#160;&#160;&#160; ${label}</text>`,
      );
    }
    return Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` +
        `<style>.m{fill:#5a6275;fill-opacity:0.08;font-family:sans-serif;font-size:${fontSize}px;font-weight:700}</style>` +
        `<g transform="rotate(-28 ${width / 2} ${height / 2})">${rows.join('')}</g>` +
        `</svg>`,
    );
  }
}

/**
 * Where a document's pages live: per document AND per file.
 *
 * Keyed on the document id alone, replacing a document's PDF in the CMS kept
 * serving the old pages for as long as the cache existed - the manifest was
 * there, so nothing was ever re-rendered.
 */
function cacheKey(docId: number, mediaId: number | null): string {
  return `${docId}-${mediaId ?? 'none'}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
