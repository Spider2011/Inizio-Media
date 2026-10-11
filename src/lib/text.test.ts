import { describe, expect, it } from 'vitest';
import { plainText, tokenize } from './text';

describe('tokenize', () => {
  it('splits plain and accented parts into words, keeping punctuation on the word', () => {
    expect(tokenize(['Giving ', { accent: 'New Beginnings' }, ' to your Digital Presence.'])).toEqual([
      { kind: 'word', text: 'Giving', accent: false },
      { kind: 'word', text: 'New', accent: true },
      { kind: 'word', text: 'Beginnings', accent: true },
      { kind: 'word', text: 'to', accent: false },
      { kind: 'word', text: 'your', accent: false },
      { kind: 'word', text: 'Digital', accent: false },
      { kind: 'word', text: 'Presence.', accent: false }
    ]);
  });

  it('turns newlines into explicit line breaks', () => {
    expect(tokenize(["Let's\ncreate."])).toEqual([
      { kind: 'word', text: "Let's", accent: false },
      { kind: 'break' },
      { kind: 'word', text: 'create.', accent: false }
    ]);
  });
});

describe('plainText', () => {
  it('joins parts into one readable string for assistive tech', () => {
    expect(plainText(['We Build ', { accent: 'Brands.' }])).toBe('We Build Brands.');
    expect(plainText(["Let's\ncreate."])).toBe("Let's create.");
  });
});
