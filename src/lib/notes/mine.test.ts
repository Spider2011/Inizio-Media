import { describe, expect, it } from 'vitest';
import { addMine, mergeWall, parseMine, stillPending } from './mine';
import type { Note } from './note';

const note = (id: string, createdAt: string, approved = false): Note => ({
  id,
  text: `note ${id}`,
  name: 'Chai Co',
  paper: 'white',
  createdAt,
  approved
});

const NOW = Date.parse('2026-11-15T10:00:00Z');

describe('parseMine', () => {
  it('reads saved notes and ignores junk', () => {
    const saved = [note('a', '2026-11-14T10:00:00Z'), { id: 'b' }, 'x'];
    expect(parseMine(JSON.stringify(saved), NOW).map((n) => n.id)).toEqual(['a']);
    expect(parseMine('{not json', NOW)).toEqual([]);
    expect(parseMine(null, NOW)).toEqual([]);
    expect(parseMine('{"a":1}', NOW)).toEqual([]);
  });

  it('forgets notes older than 30 days', () => {
    const saved = [note('new', '2026-11-01T10:00:00Z'), note('old', '2026-10-01T10:00:00Z')];
    expect(parseMine(JSON.stringify(saved), NOW).map((n) => n.id)).toEqual(['new']);
  });
});

describe('the visitor’s wall', () => {
  it('adds the newest note first without duplicates, keeping at most 10', () => {
    const many = Array.from({ length: 10 }, (_, i) => note(String(i), '2026-11-14T10:00:00Z'));
    const next = addMine(many, note('fresh', '2026-11-15T10:00:00Z'));
    expect(next).toHaveLength(10);
    expect(next[0].id).toBe('fresh');
    expect(addMine([note('a', '2026-11-14T10:00:00Z')], note('a', '2026-11-14T10:00:00Z'))).toHaveLength(1);
  });

  it('drops notes once they are approved', () => {
    const mine = [note('a', '2026-11-14T10:00:00Z'), note('b', '2026-11-13T10:00:00Z')];
    expect(stillPending(mine, [note('a', '2026-11-14T10:00:00Z', true)]).map((n) => n.id)).toEqual(['b']);
  });

  it('merges pending and approved notes newest first, marking which are pending', () => {
    const approved = [note('x', '2026-11-12T10:00:00Z', true), note('a', '2026-11-10T10:00:00Z', true)];
    const mine = [note('m', '2026-11-11T10:00:00Z'), note('a', '2026-11-10T10:00:00Z')];
    expect(mergeWall(approved, mine).map((n) => [n.id, n.pending])).toEqual([
      ['x', false],
      ['m', true],
      ['a', false]
    ]);
  });
});
