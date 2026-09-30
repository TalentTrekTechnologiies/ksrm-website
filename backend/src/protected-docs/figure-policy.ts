/**
 * Which numbers on a page are worth covering.
 *
 * Separated from the OCR because "find the numbers" and "decide which numbers
 * matter" are different questions with different failure modes, and only the
 * second is a policy someone may want to change per document type.
 *
 * The cost of getting this wrong runs both ways and neither is free:
 *
 *   too eager   page numbers and clause numbers get blacked out, the reader
 *               hovers constantly, and the claim this design rests on - that
 *               the page reads normally - stops being true
 *   too shy     the figures that carry the finding are served in the clear
 *               and the layer does nothing
 */

/** What a numeric token looks like. One token has exactly one kind. */
export type FigureKind =
  | 'integer'
  | 'decimal'
  | 'grouped'
  | 'percentage'
  | 'currency'
  | 'year'
  | 'range'
  | 'ordinal'
  /** 05-01-2024, 30/06/2026, 2024-01-05. */
  | 'date'
  /** File No. 11-79-2010-NBA, application I.D. 7831-16-02-2023. */
  | 'reference';

export interface FigurePolicy {
  /** Kinds to cover. Anything not listed is left visible. */
  kinds: FigureKind[];
  /**
   * Cover integers only at or above this magnitude.
   *
   * Small integers are usually structure - a clause number, a column count, a
   * count of pages - and covering them is a lot of reading burden for very
   * little. 10 keeps two-digit counts (37 projects, 12 patents), which in an
   * accreditation document are findings.
   */
  minIntegerValue: number;
  /**
   * Skip numbers sitting in the top or bottom margin.
   *
   * Page numbers and running headers live there and are worth nothing to an
   * attacker, while a blacked-out page number looks like a fault.
   */
  excludeMargins: boolean;
  /** Fraction of the page height treated as margin at each edge. */
  marginFraction: number;
}

/**
 * The default for NBA submissions.
 *
 * Everything numeric except bare years and page numbers. Years are excluded
 * because an accreditation document names the assessment period on nearly
 * every page, a reviewer needs it constantly to make sense of anything else,
 * and "2021-22" is not the finding - the value reported against it is.
 *
 * Ranges like "2021-22" are kept visible for the same reason.
 */
export const NBA_DEFAULT_POLICY: FigurePolicy = {
  kinds: [
    'integer',
    'decimal',
    'grouped',
    'percentage',
    'currency',
    'date',
    'reference',
  ],
  minIntegerValue: 10,
  excludeMargins: true,
  marginFraction: 0.05,
};

/** Cover every numeric token, including years and page numbers. */
export const STRICT_POLICY: FigurePolicy = {
  kinds: [
    'integer',
    'decimal',
    'grouped',
    'percentage',
    'currency',
    'year',
    'range',
    'ordinal',
    'date',
    'reference',
  ],
  minIntegerValue: 0,
  excludeMargins: false,
  marginFraction: 0,
};

/** Only the values large enough to be money or counts of consequence. */
export const LARGE_VALUES_ONLY_POLICY: FigurePolicy = {
  kinds: ['grouped', 'currency', 'integer'],
  minIntegerValue: 1000,
  excludeMargins: true,
  marginFraction: 0.05,
};

export const POLICIES: Record<string, FigurePolicy> = {
  nba: NBA_DEFAULT_POLICY,
  strict: STRICT_POLICY,
  large: LARGE_VALUES_ONLY_POLICY,
};

/**
 * What kind of number this token is, or null if it is not one.
 *
 * Order matters: the more specific patterns are tested first, because
 * "1,260,000" is also a string of digits and "98%" is also an integer.
 */
export function classify(raw: string): FigureKind | null {
  // Strip the punctuation a number picks up from the sentence around it.
  //
  // OCR returns "516003," for a PIN code at the end of an address line, and a
  // classifier keyed on /^\d+$/ rejects it - so the college's own PIN appeared
  // three times in the clear on a real letter while the board's PIN, which
  // happened to have no comma after it, was covered.
  const t = raw
    .trim()
    .replace(/^[([«"']+/, '')
    .replace(/[)\]»"',;:]+$/, '')
    // A trailing full stop ends a sentence; one between digits is a decimal.
    .replace(/\.$/, '');
  if (t.length < 1) return null;

  // Dates and reference numbers, BEFORE the range test.
  //
  // These were missing entirely, and the omission was invisible until the
  // detector met a real document. Tuned against a synthetic fixture full of
  // rupee figures, it found exactly one number on a genuine NBA accreditation
  // letter - the board's own PIN code - and left the file number, the
  // application I.D., the evaluation dates and the whole validity period in
  // the clear. A real accreditation document is dates and reference numbers at
  // least as much as it is money.
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(t)) return 'date';
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(t)) return 'date';

  // Three or more hyphenated parts, at least two of them numeric, with or
  // without a trailing word: 11-79-2010-NBA, 7831-16-02-2023.
  if (/^[\dA-Za-z]+(-[\dA-Za-z]+){2,}$/.test(t)) {
    const parts = t.split('-');
    if (parts.filter((x) => /^\d+$/.test(x)).length >= 2 && /\d{2}/.test(t))
      return 'reference';
  }

  // A year range or a hyphenated span: 2021-22, 2021-2022, 18-24.
  if (/^\d{2,4}\s*[-–—/]\s*\d{2,4}$/.test(t)) return 'range';

  // The same range with the hyphen lost.
  //
  // OCR drops the hyphen in "2021-22" often enough to matter, and the result -
  // "202122" - is a six-digit integer that no pattern distinguishes from a
  // real figure. It is recoverable from the arithmetic instead: an academic
  // year label is two CONSECUTIVE years written together, which a grant
  // figure will not be. Without this the year column came out half redacted,
  // depending purely on whether OCR kept the hyphen on a given row.
  if (/^(19|20)\d{2}\d{2}$/.test(t)) {
    const start = Number(t.slice(0, 4));
    if (Number(t.slice(4)) === (start + 1) % 100) return 'range';
  }
  if (/^(19|20)\d{2}(19|20)\d{2}$/.test(t)) {
    if (Number(t.slice(4)) === Number(t.slice(0, 4)) + 1) return 'range';
  }

  if (/%$/.test(t) && /\d/.test(t)) return 'percentage';

  // Currency, by symbol or the common Indian prefixes.
  if (
    /^(₹|Rs\.?|INR|\$)\s*[\d.,]+$/i.test(t) ||
    /^[\d.,]+\s*(₹|Rs\.?|INR)$/i.test(t)
  ) {
    return 'currency';
  }

  if (/^\d+(st|nd|rd|th)$/i.test(t)) return 'ordinal';

  // Grouped thousands: 1,260,000 or 12,60,000 (Indian grouping).
  if (/^\d{1,3}(,\d{2,3})+(\.\d+)?$/.test(t)) return 'grouped';

  if (/^\d+\.\d+$/.test(t)) return 'decimal';

  if (/^\d+$/.test(t)) {
    const n = Number(t);
    // A bare four-digit number in the plausible range is a year far more often
    // than it is a quantity, in this document type.
    if (t.length === 4 && n >= 1900 && n <= 2099) return 'year';
    return 'integer';
  }

  return null;
}

/** Numeric value of a token, for the magnitude threshold. */
function magnitude(raw: string): number {
  const digits = raw.replace(/[^\d.]/g, '');
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Whether a token should be covered under a policy.
 *
 * @param yCentre Position down the page, 0-1, for the margin rule.
 */
export function shouldRedact(
  raw: string,
  policy: FigurePolicy,
  yCentre: number,
): boolean {
  const kind = classify(raw);
  if (!kind) return false;
  if (!policy.kinds.includes(kind)) return false;

  if (
    policy.excludeMargins &&
    (yCentre < policy.marginFraction || yCentre > 1 - policy.marginFraction)
  ) {
    return false;
  }

  if (kind === 'integer' && magnitude(raw) < policy.minIntegerValue)
    return false;

  return true;
}

/**
 * Resolves the policy named by configuration.
 *
 * Falls back to the NBA default rather than throwing: a typo in an env var
 * should not take the document viewer down, and the fallback is the stricter
 * of the plausible mistakes.
 */
export function resolvePolicy(name: string | undefined): FigurePolicy {
  if (!name) return NBA_DEFAULT_POLICY;
  return POLICIES[name.trim().toLowerCase()] ?? NBA_DEFAULT_POLICY;
}
