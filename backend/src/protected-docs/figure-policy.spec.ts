import {
  classify,
  LARGE_VALUES_ONLY_POLICY,
  NBA_DEFAULT_POLICY,
  resolvePolicy,
  shouldRedact,
  STRICT_POLICY,
} from './figure-policy';

/**
 * The policy decides what gets blacked out on a real document, and it fails in
 * two directions that both matter: too eager and the page is unreadable, too
 * shy and the figures are served in the clear. Both are asserted.
 */
describe('classify', () => {
  it.each([
    ['4820000', 'integer'],
    ['37', 'integer'],
    ['12.5', 'decimal'],
    ['1,260,000', 'grouped'],
    ['12,60,000', 'grouped'],
    ['98%', 'percentage'],
    ['Rs 4820000', 'currency'],
    ['₹202500', 'currency'],
    ['2021-22', 'range'],
    ['2021-2022', 'range'],
    ['2021', 'year'],
    ['1st', 'ordinal'],
  ])('reads %s as %s', (text, kind) => {
    expect(classify(text)).toBe(kind);
  });

  it.each(['Criterion', 'the', 'Year', 'A', '', '   ', 'N/A'])(
    'reads %s as not a number',
    (t) => {
      expect(classify(t)).toBeNull();
    },
  );

  it('strips enclosing brackets, which tables use for negatives and notes', () => {
    expect(classify('(4820000)')).toBe('integer');
  });
});

describe('shouldRedact, under the NBA default', () => {
  const y = 0.5;

  it.each([
    '4820000',
    '4617500',
    '202500',
    '37',
    '12',
    '12.5',
    '1,260,000',
    '98%',
  ])('covers the figure %s', (t) => {
    expect(shouldRedact(t, NBA_DEFAULT_POLICY, y)).toBe(true);
  });

  it.each(['Criterion', 'Year', 'the'])('leaves the word %s alone', (t) => {
    expect(shouldRedact(t, NBA_DEFAULT_POLICY, y)).toBe(false);
  });

  it('leaves a bare year visible, because a reviewer needs the period constantly', () => {
    expect(shouldRedact('2021', NBA_DEFAULT_POLICY, y)).toBe(false);
    expect(shouldRedact('2021-22', NBA_DEFAULT_POLICY, y)).toBe(false);
  });

  it('leaves single digits and small integers alone — structure, not findings', () => {
    expect(shouldRedact('3', NBA_DEFAULT_POLICY, y)).toBe(false);
    expect(shouldRedact('9', NBA_DEFAULT_POLICY, y)).toBe(false);
  });

  it('leaves page numbers in the margins alone', () => {
    expect(shouldRedact('37', NBA_DEFAULT_POLICY, 0.01)).toBe(false);
    expect(shouldRedact('37', NBA_DEFAULT_POLICY, 0.99)).toBe(false);
    // The same token in the body is a finding and is covered.
    expect(shouldRedact('37', NBA_DEFAULT_POLICY, 0.5)).toBe(true);
  });
});

describe('the other policies', () => {
  it('strict covers years, page numbers and single digits', () => {
    expect(shouldRedact('2021', STRICT_POLICY, 0.5)).toBe(true);
    expect(shouldRedact('3', STRICT_POLICY, 0.5)).toBe(true);
    expect(shouldRedact('37', STRICT_POLICY, 0.01)).toBe(true);
  });

  it('large covers only values of consequence', () => {
    expect(shouldRedact('4820000', LARGE_VALUES_ONLY_POLICY, 0.5)).toBe(true);
    expect(shouldRedact('1,260,000', LARGE_VALUES_ONLY_POLICY, 0.5)).toBe(true);
    expect(shouldRedact('37', LARGE_VALUES_ONLY_POLICY, 0.5)).toBe(false);
  });
});

describe('resolvePolicy', () => {
  it('names each policy', () => {
    expect(resolvePolicy('nba')).toBe(NBA_DEFAULT_POLICY);
    expect(resolvePolicy('strict')).toBe(STRICT_POLICY);
    expect(resolvePolicy('LARGE')).toBe(LARGE_VALUES_ONLY_POLICY);
  });

  it('falls back to the NBA default rather than throwing', () => {
    // A typo in an env var must not take the document viewer down.
    expect(resolvePolicy('nonsense')).toBe(NBA_DEFAULT_POLICY);
    expect(resolvePolicy(undefined)).toBe(NBA_DEFAULT_POLICY);
  });
});
