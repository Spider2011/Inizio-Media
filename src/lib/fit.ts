/* Binary search for the largest whole-pixel size in [min, max] for which `fits(size)` holds.
   Assumes `fits` is monotonic: if a size fits, every smaller size fits too. */
export function largestFitting(fits: (size: number) => boolean, min: number, max: number): number {
  if (fits(max)) return max;
  let lo = min;
  let hi = max;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

type WidestFit = {
  /** The current font size, px. */
  size: number;
  /** The width the text may take, px. */
  available: number;
  /** The width of the widest unbreakable word at `size`, px. */
  widest: number;
};

/* Font size at which the widest word fits `available`. Text width scales linearly with font size
   (letter-spacing is in em), so one measurement is enough. Keeps `size` when it already fits. */
export function sizeToFitWidest({ size, available, widest }: WidestFit, min: number): number {
  if (available <= 0 || widest <= available) return size;
  return Math.max(min, Math.floor((size * available) / widest));
}
