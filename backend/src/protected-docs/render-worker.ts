import { parentPort } from 'node:worker_threads';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Rasterises PDFs into page PNGs, off the main thread.
 *
 * pdfjs draws on the thread that calls it, and a page at 3x takes most of a
 * second of solid CPU. Run in the API process, that stalled every other
 * request for as long as the document took: measured at ~125 ms for
 * /api/departments idle and ~1.2 s while a 34-page upload was rendering, for
 * the full 28 seconds of it. Here the API thread only waits on messages.
 *
 * One long-lived worker, not one per document. Loading pdf-to-img into a new
 * thread was measured at 1.6-3.5 s, and a worker per document put that in
 * front of every first open - 8 s instead of 1.8 s. Started with the service
 * and kept, it is paid once at boot. That also caps rendering at one core
 * however many documents are uploaded together.
 *
 * Documents take turns a page at a time, and a new one goes to the front.
 * Run strictly one after another, a second upload waited for the WHOLE of the
 * first: measured at 28 s to open a document queued behind a 34-page one.
 * Taking turns, its first page waits for at most one page of each other
 * document in progress.
 *
 * Messages from the parent: { type: 'job', id, job }
 * Messages to the parent, each carrying the job id:
 *   { type: 'count', pages }  - the document opened; nothing is drawn yet
 *   { type: 'page', n }       - `<n>.png` is on disk
 *   { type: 'done', pages }   - every page is on disk
 *   { type: 'error', message }
 */

export interface RenderJob {
  bytes: Uint8Array;
  dir: string;
  scale: number;
  standardFontDataUrl: string;
}

export type RenderMessage = { id: number } & (
  | { type: 'count'; pages: number }
  | { type: 'page'; n: number }
  | { type: 'done'; pages: number }
  | { type: 'error'; message: string }
);

type Pdf = (
  data: Buffer,
  opts: Record<string, unknown>,
) => Promise<AsyncIterable<Buffer> & { length: number }>;

// ESM-only, and this file compiles to CommonJS; `nodenext` keeps this a real
// dynamic import rather than rewriting it to require(). Started immediately,
// so the load happens while the server boots rather than on the first open.
const loaded: Promise<Pdf> = import('pdf-to-img').then(
  (m) => (m as { pdf: Pdf }).pdf,
);

interface Active {
  id: number;
  dir: string;
  pages: AsyncIterator<Buffer>;
  n: number;
}

const post = (m: RenderMessage) => parentPort?.postMessage(m);
const fail = (id: number, error: unknown) =>
  post({
    id,
    type: 'error',
    message: error instanceof Error ? error.message : String(error),
  });

/** Documents with pages still to draw, in the order they get their turn. */
const active: Active[] = [];
let pumping = false;

async function pump(): Promise<void> {
  if (pumping) return;
  pumping = true;
  try {
    while (active.length > 0) {
      const job = active.shift()!;
      try {
        const next = await job.pages.next();
        if (next.done) {
          post({ id: job.id, type: 'done', pages: job.n });
          continue;
        }
        job.n += 1;
        fs.writeFileSync(path.join(job.dir, `${job.n}.png`), next.value);
        post({ id: job.id, type: 'page', n: job.n });
        active.push(job);
      } catch (error) {
        fail(job.id, error);
      }
    }
  } finally {
    pumping = false;
  }
}

async function open(id: number, job: RenderJob): Promise<void> {
  const pdf = await loaded;
  fs.mkdirSync(job.dir, { recursive: true });
  const document = await pdf(Buffer.from(job.bytes), {
    scale: job.scale,
    docInitParams: { standardFontDataUrl: job.standardFontDataUrl },
  });
  post({ id, type: 'count', pages: document.length });
  // To the front: its first page is what somebody is waiting to see.
  active.unshift({
    id,
    dir: job.dir,
    pages: document[Symbol.asyncIterator](),
    n: 0,
  });
  void pump();
}

parentPort?.on('message', (m: { type: 'job'; id: number; job: RenderJob }) => {
  if (m.type !== 'job') return;
  open(m.id, m.job).catch((error: unknown) => fail(m.id, error));
});
