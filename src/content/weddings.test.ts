import { describe, expect, it } from 'vitest';
import { WEDDING_REEL_FILES } from '@/data/wedding-reels';
import { WEDDING_CHAPTERS, WEDDING_REASONS, WEDDING_REELS, WEDDING_SERVICES } from './weddings';

describe('Weddings content', () => {
  it('shows every encoded wedding reel exactly once, and nothing that was not encoded', () => {
    const ids = WEDDING_REELS.map((reel) => reel.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(Object.keys(WEDDING_REEL_FILES).sort());
  });

  it('opens with the pre-wedding chapter, and every chapter is one of the two services', () => {
    expect(WEDDING_CHAPTERS[0].kind).toBe('Pre-wedding');
    const kinds = new Set(WEDDING_SERVICES.map((service) => service.kind));
    WEDDING_CHAPTERS.forEach((chapter) => expect(kinds.has(chapter.kind), chapter.id).toBe(true));
  });

  it('backs every reason with a reel that is on the page', () => {
    WEDDING_REASONS.forEach((reason) => expect(ids()).toContain(reason.proof));
  });

  it('gives every reel a moment and a hook', () => {
    WEDDING_REELS.forEach((reel) => {
      expect(reel.moment.trim(), reel.id).not.toBe('');
      expect(reel.hook.trim(), reel.id).not.toBe('');
    });
  });
});

function ids() {
  return WEDDING_REELS.map((reel) => reel.id);
}
