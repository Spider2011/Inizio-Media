import { describe, expect, it } from 'vitest';
import { getPage, nextPage, PAGES } from './pages';
import { isCurrentPage, NAV_LINKS } from './site';

describe('pages', () => {
  it('has one page per navigation link, in navigation order', () => {
    expect(PAGES.map((p) => p.href)).toEqual(NAV_LINKS.map((l) => l.href));
    expect(PAGES.map((p) => p.index)).toEqual(NAV_LINKS.map((_, i) => i + 1));
  });

  it('gives every page an accent word that appears in its title', () => {
    PAGES.forEach((page) => page.accent.forEach((word) => expect(page.title.split(' '), page.id).toContain(word)));
  });

  it('looks pages up and steps through them in a loop', () => {
    expect(getPage('work').href).toBe('/work');
    expect(nextPage('work').id).toBe('events');
    expect(nextPage('contact').id).toBe('about');
  });
});

describe('isCurrentPage', () => {
  it('matches the page and pages beneath it, but not look-alikes', () => {
    expect(isCurrentPage('/work', '/work')).toBe(true);
    expect(isCurrentPage('/work', '/work/case-study')).toBe(true);
    expect(isCurrentPage('/work', '/workshop')).toBe(false);
    expect(isCurrentPage('/work', '/')).toBe(false);
    expect(isCurrentPage('/work', null)).toBe(false);
  });
});
