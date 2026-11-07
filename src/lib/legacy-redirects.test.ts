import { describe, expect, it } from 'vitest';
import { LEGACY_REDIRECTS } from './legacy-redirects';

const PAGES = ['/', '/about', '/services', '/work', '/clientele', '/contact'];

describe('LEGACY_REDIRECTS', () => {
  it('sends the old WordPress posts and pages to the home page', () => {
    const home = LEGACY_REDIRECTS.filter((r) => r.destination === '/').map((r) => r.source);
    expect(home).toEqual(expect.arrayContaining(['/hello-world', '/iniziome', '/:year(\\d{4})/:rest*']));
  });

  it('only points at pages that exist, permanently', () => {
    LEGACY_REDIRECTS.forEach((r) => {
      expect(PAGES).toContain(r.destination);
      expect(r.permanent).toBe(true);
    });
  });

  it('never hides a real page or the enquiry API, and lists each address once', () => {
    const sources = LEGACY_REDIRECTS.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
    sources.forEach((s) => {
      expect(PAGES).not.toContain(s);
      expect(s.startsWith('/api')).toBe(false);
    });
  });
});
