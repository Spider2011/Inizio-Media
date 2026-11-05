import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReelPlayer } from './ReelPlayer';

/* jsdom has no modal dialogs or media playback: stand them in so the wiring can be checked. */
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

const REEL = { src: '/work/reels/01.mp4', poster: '/work/reels/01.webp', label: 'Reel 1' };

describe('ReelPlayer', () => {
  it('stays closed until a reel is chosen', () => {
    render(<ReelPlayer reel={null} onClose={() => {}} />);
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('opens the chosen reel and plays it with sound', () => {
    const { container } = render(<ReelPlayer reel={REEL} onClose={() => {}} />);
    const video = container.querySelector('video')!;
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(video.getAttribute('src')).toBe(REEL.src);
    expect(video.muted).toBe(false);
    expect(video).toHaveAttribute('controls');
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('closes from its button, pausing the reel and telling the wheel', () => {
    const onClose = vi.fn();
    render(<ReelPlayer reel={REEL} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close reel' }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on a click outside the video but not on the video itself', () => {
    const onClose = vi.fn();
    const { container } = render(<ReelPlayer reel={REEL} onClose={onClose} />);
    fireEvent.click(container.querySelector('video')!);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(container.querySelector('dialog')!);
    expect(onClose).toHaveBeenCalled();
  });
});
