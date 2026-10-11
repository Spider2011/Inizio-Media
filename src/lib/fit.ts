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
