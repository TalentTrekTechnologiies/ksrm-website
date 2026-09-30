import { Logger } from '@nestjs/common';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import {
  NBA_DEFAULT_POLICY,
  shouldRedact,
  type FigurePolicy,
} from './figure-policy';

/**
 * Finds where the numbers are on a rendered page.
 *
 * This backs the one protection here that reduces what a capture is worth
 * without costing the reader anything. The page renders normally - no flicker,
 * no covered page, no contrast loss - and only the figures are blocked out,
 * uncovering one at a time as the reader points at them.
 *
 * Why figures and not the page: measured OCR work on these documents found
 * that prose survives damage and figures do not, because context and a
 * dictionary repair a mangled word and nothing repairs "4617500". The same
 * asymmetry applies to a person reading a leaked screenshot. An accreditation
 * submission is prose ABOUT numbers, so covering ~3% of the page protects most
 * of what matters, where covering the page protects all of it and costs the
 * reader the document.
 *
 * Classification: DEGRADATION and DETERRENCE. It raises an attacker's cost
 * from one capture to one per figure. It is not prevention, it does not stop a
 * capture being taken, and it must never be described as though it did.
 */

const logger = new Logger('FigureBoxes');

/**
 * A figure's position on the page, as fractions of the page's width and
 * height.
 *
 * Fractions, not pixels. The viewer scales the page image to fit the window,
 * so a box in source pixels would sit correctly at exactly one size and drift
 * off its number at every other zoom level, device pixel ratio and screen.
 * Fractions are invariant under all of them, because the box and the image
 * scale by the same factor.
 */
export interface FigureBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface OcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * The default-policy predicate, kept as a named export because it is the
 * cheapest thing to test and among the easiest to get wrong.
 */
export function isFigure(text: string): boolean {
  return shouldRedact(text, NBA_DEFAULT_POLICY, 0.5);
}

/**
 * Joins numbers that OCR split into several tokens.
 *
 * "4 617 500" and "1,260, 000" come back as separate words often enough to
 * matter, and a half-covered number is worse than an uncovered one because it
 * looks protected. Tokens merge when they sit on the same line, are close
 * enough horizontally to be one number, and are both digit-runs.
 *
 * Deliberately conservative: two numbers in adjacent table cells are also on
 * the same line, so the gap limit is a fraction of the token's own character
 * width rather than an absolute, and a wide gap is never merged across.
 */
export function mergeSplitNumbers(words: OcrWord[]): OcrWord[] {
  const out: OcrWord[] = [];
  const sorted = [...words].sort(
    (a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0,
  );

  for (const w of sorted) {
    const prev = out[out.length - 1];
    const digits = (t: string) => /^[\d.,]+$/.test(t.trim());
    // A four-digit year followed by a short number is a range whose hyphen OCR
    // dropped - "2021 22", not the number 202122. Merging those produced a
    // six-digit integer, which the policy then covered as a figure, so two
    // rows of a year column were blacked out and two were not depending on
    // whether OCR happened to keep the hyphen.
    const yearLike = (t: string) =>
      /^\d{4}$/.test(t.trim()) && Number(t) >= 1900 && Number(t) <= 2099;
    const rangeFragments =
      prev && yearLike(prev.text) && /^\d{1,4}$/.test(w.text.trim());
    if (prev && !rangeFragments && digits(w.text) && digits(prev.text)) {
      const prevHeight = prev.bbox.y1 - prev.bbox.y0;
      const sameLine =
        Math.abs(prev.bbox.y0 - w.bbox.y0) < prevHeight * 0.5 &&
        Math.abs(prev.bbox.y1 - w.bbox.y1) < prevHeight * 0.5;
      const charWidth =
        (prev.bbox.x1 - prev.bbox.x0) / Math.max(1, prev.text.trim().length);
      const gap = w.bbox.x0 - prev.bbox.x1;
      if (sameLine && gap >= 0 && gap < charWidth * 0.9) {
        prev.text = `${prev.text.trim()}${w.text.trim()}`;
        prev.bbox = {
          x0: Math.min(prev.bbox.x0, w.bbox.x0),
          y0: Math.min(prev.bbox.y0, w.bbox.y0),
          x1: Math.max(prev.bbox.x1, w.bbox.x1),
          y1: Math.max(prev.bbox.y1, w.bbox.y1),
        };
        continue;
      }
    }
    out.push({ text: w.text, bbox: { ...w.bbox } });
  }
  return out;
}

/**
 * OCRs one page image and returns a box for every figure the policy covers.
 *
 * Runs once per document at rasterisation time and is cached beside the page
 * images, so no reader ever waits for OCR and no view request ever triggers it.
 *
 * Failure is not fatal. If OCR is unavailable or throws, the page serves with
 * no boxes rather than not serving: the document staying readable matters more
 * than this layer, which sits on top of the watermark and the expiring links
 * rather than holding the door shut.
 */
export async function findFigureBoxes(
  pngPath: string,
  policy: FigurePolicy = NBA_DEFAULT_POLICY,
): Promise<FigureBox[]> {
  try {
    // Required lazily, so a backend that never serves a protected document
    // does not pay to load the OCR engine at boot - but through `require`, not
    // a dynamic `import`. tesseract.js is CommonJS, and a dynamic import of it
    // throws ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG under Jest, which
    // would leave this function's only real test permanently unrunnable.
    const require = createRequire(__filename);
    const { createWorker, PSM } =
      require('tesseract.js') as typeof import('tesseract.js');
    const worker = await createWorker('eng');
    try {
      await worker.setParameters({ preserve_interword_spaces: '1' });

      // Two passes, merged.
      //
      // AUTO reads the page as a document and is good at prose, but its layout
      // analysis routinely misses a short number alone in a table cell - on
      // the test page it lost two of the four values in one column, and a
      // figure this layer fails to cover is served in the clear. SPARSE makes
      // no layout assumptions and finds exactly those. Neither alone is
      // enough, and running both costs one extra pass at ingest time.
      const words: OcrWord[] = [];
      for (const mode of [PSM.AUTO, PSM.SPARSE_TEXT]) {
        await worker.setParameters({ tessedit_pageseg_mode: mode });
        const result = await worker.recognize(pngPath, {}, { blocks: true });
        const data = result.data as unknown as {
          words?: OcrWord[];
          blocks?: Array<{
            paragraphs?: Array<{ lines?: Array<{ words?: OcrWord[] }> }>;
          }>;
        };
        // tesseract.js moved words behind `blocks` in v5, and older builds put
        // them at the top level. Read both rather than pin a shape that changes.
        words.push(
          ...(data.words ??
            (data.blocks ?? []).flatMap((b) =>
              (b.paragraphs ?? []).flatMap((p) =>
                (p.lines ?? []).flatMap((l) => l.words ?? []),
              ),
            )),
        );
      }

      if (!words.length) return [];

      // The PAGE's dimensions, not the extent of the text on it.
      //
      // This was the bounding box of all detected words, which is smaller than
      // the page by whatever margin it has - so every coordinate was divided
      // by too small a number and every block landed below and to the right of
      // its figure, leaving all of them readable. It looked plausible in the
      // numbers and was obvious the moment the boxes were drawn onto the page.
      const { width = 0, height = 0 } = await sharp(pngPath).metadata();
      if (!width || !height) return [];

      const candidates = mergeSplitNumbers(words);

      const boxes = candidates
        .filter((w) =>
          shouldRedact(w.text, policy, (w.bbox.y0 + w.bbox.y1) / 2 / height),
        )
        .map((w) => {
          // Padded slightly. An OCR box hugs the glyphs, and a block that hugs
          // them just as tightly leaves the digit shapes legible as a
          // silhouette down its edges.
          const padX = (w.bbox.x1 - w.bbox.x0) * 0.08 + 2;
          const padY = (w.bbox.y1 - w.bbox.y0) * 0.18 + 2;
          return {
            x: Math.max(0, (w.bbox.x0 - padX) / width),
            y: Math.max(0, (w.bbox.y0 - padY) / height),
            w: Math.min(1, (w.bbox.x1 - w.bbox.x0 + padX * 2) / width),
            h: Math.min(1, (w.bbox.y1 - w.bbox.y0 + padY * 2) / height),
          };
        })
        // A box covering most of the page means OCR failed rather than that
        // the page is one enormous number, and covering the page is exactly
        // the outcome this design exists to avoid.
        .filter((b) => b.w < 0.5 && b.h < 0.2);

      // The two passes find the same figure twice. Stacked duplicates look
      // identical, but each is its own hover target - so a reader could
      // uncover one copy and still be looking at the other.
      const merged: FigureBox[] = [];
      for (const b of boxes) {
        const overlaps = merged.some((m) => {
          const ix = Math.max(
            0,
            Math.min(m.x + m.w, b.x + b.w) - Math.max(m.x, b.x),
          );
          const iy = Math.max(
            0,
            Math.min(m.y + m.h, b.y + b.h) - Math.max(m.y, b.y),
          );
          return ix * iy > 0.5 * Math.min(m.w * m.h, b.w * b.h);
        });
        if (!overlaps) merged.push(b);
      }

      return merged;
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    logger.warn(
      `Figure detection failed for ${pngPath}; serving the page without figure boxes. ${String(error)}`,
    );
    return [];
  }
}
