/* Row-by-row masonry: each image goes to the column that is shortest so far, so the gallery reads
   left to right like rows while every image keeps its own shape. Heights are in column widths. */

export type Sized = { width: number; height: number; secondRow?: boolean };

/** Moves the images marked `secondRow` to the second row's second place (index `columns + 1`),
    keeping the others in order. */
export function placeSecondRow<T extends Sized>(items: readonly T[], columns: number): T[] {
  const pinned = items.filter((item) => item.secondRow);
  const rest = items.filter((item) => !item.secondRow);
  const at = Math.min(columns + 1, rest.length);
  return [...rest.slice(0, at), ...pinned, ...rest.slice(at)];
}

/** Deals `items` into `columns` columns, each to the shortest column so far (leftmost on a tie). */
export function masonryColumns<T extends Sized>(items: readonly T[], columns: number): T[][] {
  const count = Math.max(1, Math.floor(columns));
  const heights = Array<number>(count).fill(0);
  const out: T[][] = Array.from({ length: count }, () => []);
  for (const item of items) {
    const shortest = heights.indexOf(Math.min(...heights));
    out[shortest] = [...out[shortest], item];
    heights[shortest] += item.height / item.width;
  }
  return out;
}

/** Which row each item lands in (0-based), for checking the layout. */
export function rowsOf<T extends Sized>(cols: readonly (readonly T[])[]): Map<T, number> {
  const rows = new Map<T, number>();
  cols.forEach((col) => col.forEach((item, row) => rows.set(item, row)));
  return rows;
}
