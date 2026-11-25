import { describe, expect, it } from 'vitest';
import { activeChapter, filmGeometry, formatDuration, progressToCentre, scrollForProgress } from './film';

describe('filmGeometry', () => {
  it('pins for exactly as long as the track has left to travel', () => {
    expect(filmGeometry(5000, 1280, 800)).toEqual({ travel: 3720, height: 4520 });
  });

  it('does not travel when the track fits the screen', () => {
    expect(filmGeometry(900, 1280, 800)).toEqual({ travel: 0, height: 800 });
  });
});

describe('progressToCentre', () => {
  it('finds the progress that centres a point of the track', () => {
    expect(progressToCentre(640 + 1860, 1280, 3720)).toBeCloseTo(0.5);
  });

  it('stays within the strip at either end', () => {
    expect(progressToCentre(100, 1280, 3720)).toBe(0);
    expect(progressToCentre(99999, 1280, 3720)).toBe(1);
    expect(progressToCentre(500, 1280, 0)).toBe(0);
  });
});

describe('scrollForProgress', () => {
  it('maps progress onto the pinned stretch of the page', () => {
    expect(scrollForProgress(0, 1200, 3000)).toBe(1200);
    expect(scrollForProgress(0.5, 1200, 3000)).toBe(2700);
    expect(scrollForProgress(2, 1200, 3000)).toBe(4200);
  });
});

describe('activeChapter', () => {
  const starts = [0, 0.3, 0.6, 0.9];
  it('picks the last chapter the scroll has reached', () => {
    expect(activeChapter(0, starts)).toBe(0);
    expect(activeChapter(0.299, starts)).toBe(1);
    expect(activeChapter(0.5, starts)).toBe(1);
    expect(activeChapter(1, starts)).toBe(3);
  });
});

describe('formatDuration', () => {
  it('writes seconds as m:ss', () => {
    expect(formatDuration(37)).toBe('0:37');
    expect(formatDuration(75)).toBe('1:15');
    expect(formatDuration(8.8)).toBe('0:09');
  });
});
