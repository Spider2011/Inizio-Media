/* Geometry for the Weddings page's film strip: a horizontal track that moves sideways while the page
   scrolls down past a pinned frame. */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** How far the track travels, and how tall the pinned area must be for that travel to take one
 *  pixel of scroll per pixel of track. */
export function filmGeometry(trackWidth: number, viewportWidth: number, viewportHeight: number) {
  const travel = Math.max(0, Math.round(trackWidth - viewportWidth));
  return { travel, height: travel + viewportHeight };
}

/** Scroll progress (0–1) that brings a point of the track (px from its start) to the screen's centre. */
export function progressToCentre(pointX: number, viewportWidth: number, travel: number): number {
  if (travel <= 0) return 0;
  return clamp01((pointX - viewportWidth / 2) / travel);
}

/** The window scroll position for a progress through the pinned area. */
export function scrollForProgress(progress: number, pinTop: number, travel: number): number {
  return Math.round(pinTop + clamp01(progress) * travel);
}

/** Index of the chapter on screen: the last whose start (as a progress) the scroll has reached. */
export function activeChapter(progress: number, starts: readonly number[]): number {
  let active = 0;
  starts.forEach((start, i) => {
    if (progress >= start - 0.001) active = i;
  });
  return active;
}

/** 37 → "0:37", 75 → "1:15". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
