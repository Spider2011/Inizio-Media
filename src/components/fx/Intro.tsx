'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LOADER_DONE_EVENT, LOADER_DONE_FLAG } from '@/lib/loader';
import { INTRO_DONE_EVENT } from './SmoothScroll';

/* The opening loader is public/inizio-loader.js, started from <head> by LoaderScripts in the root
   layout (so it covers the page before React loads). This provider only tracks when it has left the
   screen: the header, heroes and work wheel wait for that before they animate in. */

/** If the loader script never ran (blocked or failed), stop waiting this long after the page loads. */
const MISSING_LOADER_GRACE_MS = 1500;

/* Whether the opening loader has finished. Defaults to true, so anything rendered outside the
   provider (tests, other pages) never waits for an intro. */
const IntroContext = createContext(true);

export function useIntroDone(): boolean {
  return useContext(IntroContext);
}

type LoaderWindow = Window & { InizioLoader?: unknown; [LOADER_DONE_FLAG]?: boolean };

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const win = window as LoaderWindow;
    const html = document.documentElement;
    if (!window.location.hash) {
      history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
    html.classList.add('is-loading');

    let finished = false;
    let grace = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      html.classList.remove('is-loading');
      setDone(true);
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
    };
    const checkLoaderRan = () => {
      grace = window.setTimeout(() => {
        if (!win.InizioLoader) finish();
      }, MISSING_LOADER_GRACE_MS);
    };

    if (win[LOADER_DONE_FLAG]) {
      finish();
      return;
    }
    document.addEventListener(LOADER_DONE_EVENT, finish, { once: true });
    if (document.readyState === 'complete') checkLoaderRan();
    else window.addEventListener('load', checkLoaderRan, { once: true });

    return () => {
      document.removeEventListener(LOADER_DONE_EVENT, finish);
      window.removeEventListener('load', checkLoaderRan);
      window.clearTimeout(grace);
    };
  }, []);

  return <IntroContext.Provider value={done}>{children}</IntroContext.Provider>;
}
