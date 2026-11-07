import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOADER_DONE_EVENT, LOADER_DONE_FLAG } from '@/lib/loader';
import { IntroProvider, useIntroDone } from './Intro';
import { INTRO_DONE_EVENT } from './SmoothScroll';

type LoaderWindow = Window & { InizioLoader?: unknown; [LOADER_DONE_FLAG]?: boolean };
const win = window as LoaderWindow;

function Probe() {
  return <p>{useIntroDone() ? 'ready' : 'waiting'}</p>;
}

const mount = () =>
  render(
    <IntroProvider>
      <Probe />
    </IntroProvider>
  );

beforeEach(() => {
  vi.useFakeTimers();
  delete win.InizioLoader;
  delete win[LOADER_DONE_FLAG];
});

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.classList.remove('is-loading');
});

describe('IntroProvider', () => {
  it('waits for the loader to leave, holding the page still meanwhile', () => {
    win.InizioLoader = {};
    const onIntroDone = vi.fn();
    window.addEventListener(INTRO_DONE_EVENT, onIntroDone);
    mount();
    expect(screen.getByText('waiting')).toBeInTheDocument();
    expect(document.documentElement).toHaveClass('is-loading');
    vi.advanceTimersByTime(10_000);
    expect(screen.getByText('waiting')).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(new CustomEvent(LOADER_DONE_EVENT));
    });
    expect(screen.getByText('ready')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('is-loading');
    expect(onIntroDone).toHaveBeenCalledTimes(1);
    window.removeEventListener(INTRO_DONE_EVENT, onIntroDone);
  });

  it('is ready at once when the loader finished before the page was interactive', () => {
    win.InizioLoader = {};
    win[LOADER_DONE_FLAG] = true;
    mount();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });

  it('stops waiting when the loader script never ran', () => {
    mount();
    expect(screen.getByText('waiting')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('ready')).toBeInTheDocument();
  });
});
