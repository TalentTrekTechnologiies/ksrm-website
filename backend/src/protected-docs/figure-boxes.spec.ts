import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';
import { findFigureBoxes, isFigure, mergeSplitNumbers } from './figure-boxes';

/**
 * The figure filter decides what gets blacked out on a real document, and it
 * fails in two directions that both matter:
 *
 *   too eager   words are covered, the reader hovers constantly, and the
 *               design's whole claim - that the page reads normally - is gone
 *   too shy     the figures are served in the clear and the layer does nothing
 *
 * So both directions are asserted, not just the happy one.
 */
describe('isFigure', () => {
  it.each([
    '4820000',
    '4617500',
    '202500',
    '37',
    '12',
    '1,260,000',
    '12.5',
    '98%',
  ])('covers the figure %s', (text) => {
    expect(isFigure(text)).toBe(true);
  });

  it.each([
    'Criterion',
    'the',
    'Sanctioned',
    'Year',
    'A',
    // One digit is not worth covering - there are ten of them, so a guess
    // recovers it and the cost is a hovered block for nothing.
    '3',
    // Mostly letters with a digit in them is a heading, not a finding.
    'Criterion3',
    // Deliberate under the NBA policy: an accreditation document names the
    // assessment period on nearly every page and a reviewer needs it to make
    // sense of anything else. The year is not the finding; the value reported
    // against it is. figure-policy.spec.ts covers this directly.
    '2021-22',
    '2021',
  ])('leaves %s alone', (text) => {
    expect(isFigure(text)).toBe(false);
  });
});

/**
 * Splitting is what turns a covered number into a half-covered one, which is
 * worse than an uncovered one because it looks protected.
 */
describe('mergeSplitNumbers', () => {
  const word = (text: string, x0: number, x1: number, y0 = 100, y1 = 120) => ({
    text,
    bbox: { x0, y0, x1, y1 },
  });

  it('joins a number OCR split on its thousands separator', () => {
    const merged = mergeSplitNumbers([
      word('4', 10, 20),
      word('617500', 22, 90),
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].text).toBe('4617500');
    expect(merged[0].bbox).toEqual({ x0: 10, y0: 100, x1: 90, y1: 120 });
  });

  it('does NOT join two numbers in adjacent table cells', () => {
    // Same line, but a cell apart. Merging these would black out the gap
    // between two columns and read as one enormous figure.
    const merged = mergeSplitNumbers([
      word('18', 10, 30),
      word('42', 200, 220),
    ]);
    expect(merged).toHaveLength(2);
  });

  it('does NOT join across lines', () => {
    const merged = mergeSplitNumbers([
      word('18', 10, 30),
      word('42', 31, 50, 300, 320),
    ]);
    expect(merged).toHaveLength(2);
  });

  it('leaves words alone', () => {
    const merged = mergeSplitNumbers([
      word('Sanctioned', 10, 90),
      word('4820000', 92, 160),
    ]);
    expect(merged).toHaveLength(2);
  });
});

/**
 * The OCR path, against a real rendered page.
 *
 * Skipped unless a page image is present, because it needs the OCR engine and
 * takes seconds rather than milliseconds:
 *
 *   FIGURE_FIXTURE=../docs/protection-evidence/screenshot/clean.png npx jest figure-boxes
 */
const fixture = process.env.FIGURE_FIXTURE;
const describeOcr =
  fixture && fs.existsSync(fixture) ? describe : describe.skip;

describeOcr('findFigureBoxes', () => {
  jest.setTimeout(120_000);

  it('finds the figures and leaves most of the page uncovered', async () => {
    const file = path.resolve(fixture as string);
    const boxes = await findFigureBoxes(file);

    const { width = 0, height = 0 } = await sharp(file).metadata();

    // Written BEFORE the assertions, deliberately. It is the diagnostic for
    // a failure, and a version that only ran on success was useless at the
    // exact moment it was needed.
    if (process.env.FIGURE_DEBUG) {
      const rects = boxes
        .map(
          (b) =>
            `<rect x="${(b.x * width).toFixed(1)}" y="${(b.y * height).toFixed(1)}" ` +
            `width="${(b.w * width).toFixed(1)}" height="${(b.h * height).toFixed(1)}" ` +
            `fill="#11152e" />`,
        )
        .join('');
      const overlay = Buffer.from(
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`,
      );
      await sharp(file)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .png()
        .toFile(process.env.FIGURE_DEBUG);
    }

    // How many figures the page actually has is a property of the DOCUMENT,
    // not of the detector: the synthetic fixture is dense with numbers and a
    // real accreditation letter is mostly prose. FIGURE_MIN lets a different
    // document state its own expectation.
    const minimum = Number(process.env.FIGURE_MIN ?? 8);
    expect(boxes.length).toBeGreaterThanOrEqual(minimum);

    for (const b of boxes) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(1.001);
      expect(b.y + b.h).toBeLessThanOrEqual(1.001);
      // No single block may swallow the page - that is the failure this
      // design exists to avoid.
      expect(b.w).toBeLessThan(0.5);
      expect(b.h).toBeLessThan(0.2);
    }

    // The point of the design is that the page stays readable, so the covered
    // area has to stay small. Anything approaching the reading-band's two
    // thirds means the filter has gone wrong.
    const covered = boxes.reduce((n, b) => n + b.w * b.h, 0);
    expect(covered).toBeLessThan(0.12);

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});
