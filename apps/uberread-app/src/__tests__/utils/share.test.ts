import { describe, it, expect } from 'vitest';
import { buildShareUrl, parseShareDeepLink } from '@/utils/share';

describe('buildShareUrl', () => {
  it('builds the canonical https URL for a token', () => {
    expect(buildShareUrl('aBcDeFgHiJkLmNoPqRsTuV')).toBe(
      'https://web.uberread.com/s/aBcDeFgHiJkLmNoPqRsTuV',
    );
  });
});

describe('parseShareDeepLink', () => {
  const VALID_TOKEN = 'aBcDeFgHiJkLmNoPqRsTuV';

  it('parses uberread://share/{token}', () => {
    expect(parseShareDeepLink(`uberread://share/${VALID_TOKEN}`)).toEqual({ token: VALID_TOKEN });
  });

  it('parses https://web.uberread.com/s/{token}', () => {
    expect(parseShareDeepLink(`https://web.uberread.com/s/${VALID_TOKEN}`)).toEqual({
      token: VALID_TOKEN,
    });
  });

  it('parses *.uberread.com subdomains for preview deploys', () => {
    expect(parseShareDeepLink(`https://staging.uberread.com/s/${VALID_TOKEN}`)).toEqual({
      token: VALID_TOKEN,
    });
  });

  it('rejects tokens of the wrong length', () => {
    expect(parseShareDeepLink('uberread://share/short')).toBeNull();
    expect(parseShareDeepLink(`uberread://share/${VALID_TOKEN}extra`)).toBeNull();
  });

  it('rejects tokens with disallowed characters', () => {
    // Underscore and hyphen are explicitly NOT in the alphabet.
    const bad = 'aBcDeFgHiJkLmNoPqRsTu-';
    expect(parseShareDeepLink(`uberread://share/${bad}`)).toBeNull();
  });

  it('rejects URLs from third-party hosts', () => {
    expect(parseShareDeepLink(`https://evil.example.com/s/${VALID_TOKEN}`)).toBeNull();
  });

  it('rejects uberread:// URLs whose host is not "share"', () => {
    expect(parseShareDeepLink(`uberread://book/${VALID_TOKEN}`)).toBeNull();
    expect(parseShareDeepLink(`uberread://annotation/${VALID_TOKEN}`)).toBeNull();
  });

  it('rejects nested or extra path segments', () => {
    expect(parseShareDeepLink(`https://web.uberread.com/s/${VALID_TOKEN}/extra`)).toBeNull();
    expect(parseShareDeepLink(`https://web.uberread.com/extra/s/${VALID_TOKEN}`)).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(parseShareDeepLink('')).toBeNull();
    expect(parseShareDeepLink('not-a-url')).toBeNull();
    expect(parseShareDeepLink('ftp://web.uberread.com/s/' + VALID_TOKEN)).toBeNull();
  });
});
