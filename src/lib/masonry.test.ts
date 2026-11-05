import { describe, expect, it } from 'vitest';
import { GALLERY } from '@/data/gallery';
import { masonryColumns, placeSecondRow, rowsOf } from './masonry';

const square = (n: number) => Array.from({ length: n }, (_, i) => ({ width: 100, height: 100, id: i }));

describe('masonryColumns', () => {
  it('deals equal images left to right, row by row', () => {
    const cols = masonryColumns(square(7), 3);
    expect(cols.map((c) => c.map((x) => x.id))).toEqual([[0, 3, 6], [1, 4], [2, 5]]);
  });

  it('puts the next image under the shortest column', () => {
    const items = [
      { width: 100, height: 200, id: 'tall' },
      { width: 100, height: 100, id: 'a' },
      { width: 100, height: 100, id: 'b' }
    ];
    expect(masonryColumns(items, 2).map((c) => c.map((x) => x.id))).toEqual([['tall'], ['a', 'b']]);
  });

  it('copes with odd column counts', () => {
    expect(masonryColumns(square(2), 0)).toHaveLength(1);
    expect(masonryColumns([], 3)).toEqual([[], [], []]);
  });
});

describe('placeSecondRow', () => {
  it('moves the marked image to the second row, second place, keeping the rest in order', () => {
    const items = [...square(6), { width: 100, height: 100, id: 'logo', secondRow: true }];
    expect(placeSecondRow(items, 3).map((x) => x.id)).toEqual([0, 1, 2, 3, 'logo', 4, 5]);
  });

  it('puts the O&B logo in the gallery’s second row at every column count', () => {
    const logo = GALLERY.find((image) => image.secondRow);
    expect(logo, 'a gallery image marked for the second row').toBeDefined();
    for (const columns of [2, 3, 4]) {
      const cols = masonryColumns(placeSecondRow(GALLERY, columns), columns);
      expect(rowsOf(cols).get(logo!), `${columns} columns`).toBe(1);
      expect(cols.flat()).toHaveLength(GALLERY.length);
    }
  });
});
