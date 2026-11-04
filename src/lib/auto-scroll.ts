/* Looping scroll maths for a strip made of two identical copies of its content. Jumping by the
   width of one copy (`half`) lands on an identical picture, so the loop has no visible seam. */

/** Brings a scroll offset back inside [1, half), so the strip can always move either way. */
export function loopScroll(left: number, half: number): number {
  if (!(half > 1)) return left;
  if (left < 1) return left + half;
  if (left >= half) return left - half;
  return left;
}

/** Pixels per second that move one full copy past in `loopSeconds`. */
export function loopSpeed(half: number, loopSeconds: number): number {
  return loopSeconds > 0 ? half / loopSeconds : 0;
}

/** True when a horizontal gesture (trackpad swipe, shift + wheel) should move the strip. */
export function isSidewaysWheel(deltaX: number, deltaY: number): boolean {
  return Math.abs(deltaX) > Math.abs(deltaY);
}
