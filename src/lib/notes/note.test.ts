import { describe, expect, it } from 'vitest';
import { cleanText, NOTE_NAME_MAX, NOTE_TEXT_MAX, validateNote } from './note';

describe('cleanText', () => {
  it('strips HTML tags and stray angle brackets', () => {
    expect(cleanText('<b>Great</b> team <script>alert(1)</script>!')).toBe('Great team alert(1)!');
    expect(cleanText('a < b > c')).toBe('a b c');
  });

  it('collapses whitespace, including line breaks, and trims', () => {
    expect(cleanText('  So   good\n\nto work\twith  ')).toBe('So good to work with');
  });

  it('removes control characters', () => {
    expect(cleanText('Hi\u0000 there\u0007')).toBe('Hi there');
  });

  it('removes invisible and direction-changing characters', () => {
    expect(cleanText('​Chai‮ Co﻿⁦')).toBe('Chai Co');
    expect(validateNote({ text: 'Fine', name: '​​' })).toMatchObject({ success: false, errors: { name: expect.any(String) } });
  });
});

describe('validateNote', () => {
  it('accepts a note and returns the cleaned values', () => {
    const result = validateNote({ text: ' They <i>got</i> us. ', name: ' Chai  Co ', paper: 'navy' });
    expect(result).toEqual({ success: true, data: { text: 'They got us.', name: 'Chai Co', paper: 'navy' } });
  });

  it('falls back to white paper when the paper is missing or unknown', () => {
    const result = validateNote({ text: 'Lovely work', name: 'Asha', paper: 'gold' });
    expect(result.success && result.data.paper).toBe('white');
  });

  it('asks for a few words and a name when they are empty', () => {
    expect(validateNote({ text: '   ', name: '<p></p>' })).toEqual({
      success: false,
      errors: {
        text: 'Please write a few words about your experience.',
        name: "Please add your name or your company's name."
      }
    });
  });

  it('rejects text and names over the limits, counted after cleaning', () => {
    const ok = validateNote({ text: 'a'.repeat(NOTE_TEXT_MAX) + '<br>', name: 'n'.repeat(NOTE_NAME_MAX) });
    expect(ok.success).toBe(true);

    const long = validateNote({ text: 'a'.repeat(NOTE_TEXT_MAX + 1), name: 'n'.repeat(NOTE_NAME_MAX + 1) });
    expect(long).toEqual({
      success: false,
      errors: { text: 'Keep your note to 220 characters.', name: 'Keep the name to 60 characters.' }
    });
  });

  it('treats a non-object payload as empty fields', () => {
    expect(validateNote('hello').success).toBe(false);
    expect(validateNote(null)).toMatchObject({ success: false, errors: { text: expect.any(String), name: expect.any(String) } });
  });

  it('rejects fields that are not strings', () => {
    expect(validateNote({ text: 42, name: ['x'] }).success).toBe(false);
  });
});
